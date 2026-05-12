import { StatusCodes } from "http-status-codes";
import { AppError } from "../utilities/APIExceptions";
import { RoleRepository } from "../repositories/RoleRepository";
import { Role } from "../entities/Role";

export class RoleService {

    public static readonly ERROR_NOT_FOUND_ID = (id: number) => `Role not found with id: ${id}`;

    static getById = async (id: number): Promise<Role> => {
        const role = await RoleRepository.getById(id);
        if (!role) {
            throw new AppError(StatusCodes.NOT_FOUND, this.ERROR_NOT_FOUND_ID(id));
        }
        return role;
    }
}