import { StatusCodes } from "http-status-codes";
import { User } from "../entities/User";
import { UserRepository } from "../repositories/UserRepository";
import { AppError } from "../utilities/APIExceptions";
import { AuthedDTOToken } from "../entities/DTO/AuthedDTOToken";
import { UserDTO } from "../entities/DTO/UserDTO";
import { Validation } from "../utilities/Validation";
import { plainToInstance } from "class-transformer";
import { DepartmentService } from "./DepartmentService";
import { RoleService } from "./RoleService";
import { Department } from "../entities/Department";
import { Role } from "../entities/Role";

export class UserService {

    static ERROR_ID_NOT_FOUND = (id: number) => `User with Id: ${id} not found`
    static ERROR_EMAIL_NOT_FOUND = (email: string) => `User with email: ${email} not found`
    static ERROR_EMAIL_EXISTS = (email: string) => `User with email: ${email} already exists`
    static ERROR_NO_USERS = `No users found`
    static ERROR_MIN_LEAVE_BALANCE = `Leave balance cannot be less than 0`

    static login = async (email: string): Promise<User> => {
        const record = await UserRepository.login(email);
        if (!record) {
            throw new AppError(StatusCodes.NO_CONTENT, this.ERROR_EMAIL_NOT_FOUND(email));
        }
        return record;
    }

    static getAll = async (): Promise<UserDTO[]> => {
        const records = await UserRepository.getAll();
        if (!records) {
            throw new AppError(StatusCodes.NO_CONTENT, this.ERROR_NO_USERS);
        }

        return records.map(UserDTO.init)
    }

    static getById = async (id: number): Promise<UserDTO> => {
        const record = await UserRepository.getById(id);
        if (!record) {
            throw new AppError(StatusCodes.NOT_FOUND, this.ERROR_ID_NOT_FOUND(id));
        }
        return UserDTO.init(record);
    }

    static update = async (dto: UserDTO): Promise<UserDTO> => {

        let user = await UserRepository.getById(dto.id);
        if (!user) {
            throw new AppError(StatusCodes.NOT_FOUND, this.ERROR_ID_NOT_FOUND(dto.id));
        }

        await DepartmentService.getById(dto.department_id);
        await RoleService.getById(dto.role_id);

        user.department = { id: dto.department_id } as Department;
        user.role = { id: dto.role_id } as Role;

        if (dto.leave_balance < 0) {
            throw new AppError(StatusCodes.NOT_FOUND, this.ERROR_MIN_LEAVE_BALANCE);
        }
        user.leave_balance = dto.leave_balance;

        const updated = await UserRepository.update(user);
        return UserDTO.init(updated!);
    }


    static create = async (token: AuthedDTOToken, body: User): Promise<UserDTO> => {
        const user = plainToInstance(User, body);

        user.first_name = Validation.formatName(user.first_name);
        user.last_name = Validation.formatName(user.last_name);
        user.email = Validation.email(user.email);

        await Validation.classValidate(user);
        await UserService.emailExists(user.email);
        await DepartmentService.getById(user.department_id);
        await RoleService.getById(user.role_id);

        await UserRepository.create(user);

        return UserDTO.init(user);
    }

    static delete = async (id: number) => {
        await UserRepository.delete(id);
    }

    private static emailExists = async (email: string): Promise<void> => {
        const record = await UserRepository.getByEmail(email);
        if (record) {
            throw new AppError(StatusCodes.CONFLICT, this.ERROR_EMAIL_EXISTS(email));
        }
    };

}