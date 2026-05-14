import { StatusCodes } from "http-status-codes";
import { RoleEnum } from "../utilities/enums/RoleEnum";
import { UserManagement } from "../entities/UserManagement";
import { UserDTO } from "../entities/DTO/UserDTO";
import { IManagementService } from "../interfaces/services/IManagementService";
import { IManagementRepository } from "../interfaces/repositories/IManagementRepository";
import { IUserService } from "../interfaces/services/IUserService";
import { AppError } from "../utilities/AppError";

export class ManagementService implements IManagementService {

    constructor(
        private repository: IManagementRepository,
        private userService: IUserService,
    ) { }

    public static readonly ERROR_PERMISSION = `Not enough permission to perform action`;
    public static readonly ERROR_EXISTING = (user_id: number, manager_id: number) => `Management record with user_id: ${user_id} and manager_id ${manager_id} already exists`;

    public async add(entry: UserManagement): Promise<UserManagement> {
        return await this.repository.create(entry);
    }

    public async getManagedEmployees(user_id: number): Promise<UserDTO[]> {

        let user = await this.userService.getById(user_id);
        let managed_employees: UserDTO[] = [];

        if (user.role_id == RoleEnum.Admin) {
            managed_employees = await this.userService.getAll();
        }
        else {
            const management_entries = await this.repository.getAllByManagerId(user.id)
            if (management_entries) {

                managed_employees = await Promise.all(
                    management_entries.map(mng => this.userService.getById(mng.user_id))
                );
            }
        }

        return managed_employees;
    }

    public async isManagedEmployee(user_id: number, employee_id: number) {

        let user = await this.userService.getById(user_id);

        if (user.role_id == RoleEnum.Admin) {
            return true;
        }
        else {
            let managed = await this.repository.getOneByEmployeeAndManager(employee_id, user_id);
            if (managed) {
                return true;
            }
            else {
                throw new AppError(ManagementService.ERROR_PERMISSION, StatusCodes.FORBIDDEN);
            }

        }
    }

    public async getOneByEmployeeAndManager(user_id: number, employee_id: number) {
        const existing = await this.repository.getOneByEmployeeAndManager(user_id, employee_id)

        if (existing) {
            throw new AppError(ManagementService.ERROR_EXISTING(user_id, employee_id), StatusCodes.CONFLICT);
        }
    }
}