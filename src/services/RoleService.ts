import { StatusCodes } from "http-status-codes";
import { AppError } from "../utilities/APIExceptions";
import { Role } from "../entities/Role";
import { IRoleRepository } from "../interfaces/repositories/IRoleRepository";
import { IRoleService } from "../interfaces/services/IRoleService";

export class RoleService implements IRoleService {

    constructor(private repository: IRoleRepository) { }

    public static readonly ERROR_NOT_FOUND_ID = (id: number) => `Role not found with id: ${id}`;

    public async getById(id: number): Promise<Role> {
        const role = await this.repository.getById(id);
        if (!role) {
            throw new AppError(StatusCodes.NOT_FOUND, RoleService.ERROR_NOT_FOUND_ID(id));
        }
        return role;
    }
}