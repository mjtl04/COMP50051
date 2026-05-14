import { StatusCodes } from "http-status-codes";
import { Department } from "../entities/Department";
import { IDepartmentService } from "../interfaces/services/IDepartmentService";
import { IDepartmentRepository } from "../interfaces/repositories/IDepartmentRepository";
import { AppError } from "../utilities/AppError";

export class DepartmentService implements IDepartmentService {

    constructor(private repository: IDepartmentRepository) { }

    public static readonly ERROR_NOT_FOUND_ID = (id: number) => `Department not found with id: ${id}`;

    public async getById(id: number): Promise<Department> {
        const department = await this.repository.getById(id);
        if (!department) {
            throw new AppError(DepartmentService.ERROR_NOT_FOUND_ID(id), StatusCodes.NOT_FOUND);
        }
        return department;
    }
}