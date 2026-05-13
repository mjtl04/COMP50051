import { StatusCodes } from "http-status-codes";
import { User } from "../entities/User";
import { AppError } from "../utilities/APIExceptions";
import { AuthedDTOToken } from "../entities/DTO/AuthedDTOToken";
import { UserDTO } from "../entities/DTO/UserDTO";
import { plainToInstance } from "class-transformer";
import { Department } from "../entities/Department";
import { Role } from "../entities/Role";
import { IUserService } from "../interfaces/services/IUserService";
import { IValidation } from "../interfaces/IValidation";
import { IDepartmentService } from "../interfaces/services/IDepartmentService";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { IRoleService } from "../interfaces/services/IRoleService";

export class UserService implements IUserService {

    constructor(
        private validation: IValidation,
        private repository: IUserRepository,
        private roleService: IRoleService,
        private departmentService: IDepartmentService,
    ) { }

    static ERROR_ID_NOT_FOUND = (id: number) => `User with Id: ${id} not found`
    static ERROR_EMAIL_NOT_FOUND = (email: string) => `User with email: ${email} not found`
    static ERROR_EMAIL_EXISTS = (email: string) => `User with email: ${email} already exists`
    static ERROR_NO_USERS = `No users found`
    static ERROR_MIN_LEAVE_BALANCE = `Leave balance cannot be less than 0`

    public async login(email: string): Promise<User> {
        const record = await this.repository.getByEmail(email);
        if (!record) {
            throw new AppError(StatusCodes.NO_CONTENT, UserService.ERROR_EMAIL_NOT_FOUND(email));
        }
        return record;
    }

    public async getByEmail(email: string): Promise<UserDTO> {
        const record = await this.repository.getByEmail(email);
        if (!record) {
            throw new AppError(StatusCodes.NO_CONTENT, UserService.ERROR_EMAIL_NOT_FOUND(email));
        }
        return UserDTO.init(record, this.validation);
    }

    public async getAll(): Promise<UserDTO[]> {
        const records = await this.repository.getAll();
        if (!records) {
            throw new AppError(StatusCodes.NO_CONTENT, UserService.ERROR_NO_USERS);
        }

        return records.map(a => UserDTO.init(a, this.validation))
    }

    public async getById(id: number): Promise<UserDTO> {
        const record = await this.repository.getById(id);
        if (!record) {
            throw new AppError(StatusCodes.NOT_FOUND, UserService.ERROR_ID_NOT_FOUND(id));
        }
        return UserDTO.init(record, this.validation);
    }

    public async update(dto: UserDTO): Promise<UserDTO> {

        let user = await this.repository.getById(dto.id);
        if (!user) {
            throw new AppError(StatusCodes.NOT_FOUND, UserService.ERROR_ID_NOT_FOUND(dto.id));
        }

        await this.departmentService.getById(dto.department_id);
        await this.roleService.getById(dto.role_id);

        user.department = { id: dto.department_id } as Department;
        user.role = { id: dto.role_id } as Role;

        if (dto.leave_balance < 0) {
            throw new AppError(StatusCodes.NOT_FOUND, UserService.ERROR_MIN_LEAVE_BALANCE);
        }
        user.leave_balance = dto.leave_balance;

        const updated = await this.repository.update(user);
        return UserDTO.init(updated!, this.validation);
    }

    public async create(token: AuthedDTOToken, body: User): Promise<UserDTO> {
        const user = plainToInstance(User, body);

        user.first_name = this.validation.formatName(user.first_name);
        user.last_name = this.validation.formatName(user.last_name);
        user.email = this.validation.email(user.email);

        await this.validation.classValidate(user);
        await this.emailExists(user.email);
        await this.departmentService.getById(user.department_id);
        await this.roleService.getById(user.role_id);

        await this.repository.create(user);

        return UserDTO.init(user, this.validation);
    }

    public async delete(id: number) {
        await this.repository.delete(id);
    }

    private async emailExists(email: string): Promise<void> {
        const record = await this.repository.getByEmail(email);
        if (record) {
            throw new AppError(StatusCodes.CONFLICT, UserService.ERROR_EMAIL_EXISTS(email));
        }
    };

}