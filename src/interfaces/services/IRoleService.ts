import { Role } from "../../entities/Role";

export interface IRoleService {
    getById(id: number): Promise<Role>;
}