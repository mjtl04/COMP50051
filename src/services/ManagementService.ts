import { StatusCodes } from "http-status-codes";
import { User } from "../entities/User";
import { ManagementRepository } from "../repositories/ManagementRepository";
import { AppError } from "../utilities/APIExceptions";
import { RoleEnum } from "../utilities/enums/RoleEnum";
import { UserService } from "./UserService";
import { UserManagement } from "../entities/UserManagement";
import { UserDTO } from "../entities/DTO/UserDTO";


export class ManagementService {

    public static readonly ERROR_EMPTY_USERS = `No Managed Users`;
    public static readonly ERROR_PERMISSION = `Not enough permission to perform action`;

    public static add = async (entry: UserManagement): Promise<UserManagement> => {
        return await ManagementRepository.create(entry);
    }

    public static getManagedEmployees = async (user_id: number): Promise<UserDTO[]> => {

        let user = await UserService.getById(user_id);
        let managed_employees: UserDTO[] = [];

        if (user.role_id == RoleEnum.Admin) {
            managed_employees = await UserService.getAll();
        }
        else {
            const management_entries = await ManagementRepository.getAllByManagerId(user.id)
            if (management_entries) {

                managed_employees = await Promise.all(
                    management_entries.map(mng => UserService.getById(mng.user_id))
                );

                // if (managed_employees.length === 0) {
                //     throw new AppError(StatusCodes.NOT_FOUND, this.ERROR_EMPTY_USERS);
                // }
            }
        }

        return managed_employees;
    }

    public static isManagedEmployee = async (user_id: number, employee_id: number) => {


        let user = await UserService.getById(user_id);

        if (user.role_id == RoleEnum.Admin) {
            return true;
        }
        else {
            let managed = await ManagementRepository.getOneByEmployeeAndManager(employee_id, user_id);
            if (managed) {
                return true;
            }
            else {
                throw new AppError(StatusCodes.FORBIDDEN, this.ERROR_PERMISSION);
            }

        }
    }
}