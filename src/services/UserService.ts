import { StatusCodes } from "http-status-codes";
import { User } from "../entities/User";
import { AuthedDTOToken } from "../entities/DTO/AuthedDTOToken";
import { UserDTO } from "../entities/DTO/UserDTO";
import { plainToInstance } from "class-transformer";
import { Department } from "../entities/Department";
import { Role } from "../entities/Role";
import { IUserService } from "../interfaces/services/IUserService";
import { IDepartmentService } from "../interfaces/services/IDepartmentService";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { IRoleService } from "../interfaces/services/IRoleService";
import { Validation } from "../utilities/Validation";
import { AppError } from "../utilities/AppError";
import { NewUserDTO } from "../entities/DTO/NewUserDTO";

export class UserService implements IUserService {

    constructor(private repository: IUserRepository, private roleService: IRoleService, private departmentService: IDepartmentService) { }

    static ERROR_ID_NOT_FOUND = (id: number) => `User with Id: ${id} not found`
    static ERROR_EMAIL_NOT_FOUND = (email: string) => `User with email: ${email} not found`
    static ERROR_EMAIL_EXISTS = (email: string) => `User with email: ${email} already exists`
    static ERROR_NO_USERS = `No users found`
    static ERROR_MIN_LEAVE_BALANCE = `Leave balance cannot be less than 0`

    public async login(email: string): Promise<User> {
        const record = await this.repository.getByEmail(email);
        if (!record) {
            throw new AppError(UserService.ERROR_EMAIL_NOT_FOUND(email), StatusCodes.NO_CONTENT);
        }
        return record;
    }

    public async getByEmail(email: string): Promise<UserDTO> {
        const record = await this.repository.getByEmail(email);
        if (!record) {
            throw new AppError(UserService.ERROR_EMAIL_NOT_FOUND(email), StatusCodes.NO_CONTENT);
        }
        return UserDTO.init(record);
    }

    public async getAll(): Promise<UserDTO[]> {
        const records = await this.repository.getAll();
        if (!records) {
            throw new AppError(UserService.ERROR_NO_USERS, StatusCodes.NO_CONTENT);
        }

        return records.map(a => UserDTO.init(a))
    }

    public async getById(id: number): Promise<UserDTO> {
        const record = await this.repository.getById(id);
        if (!record) {
            throw new AppError(UserService.ERROR_ID_NOT_FOUND(id), StatusCodes.NO_CONTENT);
        }
        return UserDTO.init(record);
    }

    public async update(dto: UserDTO): Promise<UserDTO> {

        let user = await this.repository.getById(dto.id);
        if (!user) {
            throw new AppError(UserService.ERROR_ID_NOT_FOUND(dto.id), StatusCodes.NO_CONTENT);
        }

        await this.departmentService.getById(dto.department_id);
        await this.roleService.getById(dto.role_id);

        user.department = { id: dto.department_id } as Department;
        user.role = { id: dto.role_id } as Role;

        if (user.leave_balance < 0) {
            throw new AppError(UserService.ERROR_MIN_LEAVE_BALANCE, StatusCodes.NO_CONTENT);
        }
        user.leave_balance = dto.leave_balance;

        const updated = await this.repository.update(user);
        return UserDTO.init(updated!);
    }

    public async create(token: AuthedDTOToken, new_user: NewUserDTO): Promise<UserDTO> {

        let user = new User();
        user.first_name = Validation.formatName(new_user.first_name);
        user.last_name = Validation.formatName(new_user.last_name);
        user.email = Validation.email(new_user.email);
        user.password = new_user.password;

        if (await this.emailExists(user.email)) {
            throw new AppError(UserService.ERROR_EMAIL_EXISTS(new_user.email), StatusCodes.CONFLICT,);
        }

        user.department = await this.departmentService.getById(new_user.department_id);
        user.role = await this.roleService.getById(new_user.role_id);

        await Validation.classValidate(user);
        await this.repository.create(user);

        return UserDTO.init(user);
    }

    public async delete(id: number) {
        await this.repository.delete(id);
    }

    private async emailExists(email: string): Promise<boolean> {
        const user = await this.repository.getByEmail(email);
        if (user) {
            return true;
        }
        else {
            return false;
        }
    };

}