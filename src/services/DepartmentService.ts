import { StatusCodes } from "http-status-codes";
import { Department } from "../entities/Department";
import { DepartmentRepository } from "../repositories/DepartmentRepository";
import { AppError } from "../utilities/APIExceptions";

export class DepartmentService {

    public static readonly ERROR_NOT_FOUND_ID = (id: number) => `Department not found with id: ${id}`;

    static getById = async (id: number): Promise<Department> => {
        const department = await DepartmentRepository.getById(id);
        if (!department) {
            throw new AppError(StatusCodes.NOT_FOUND, this.ERROR_NOT_FOUND_ID(id));
        }
        return department;
    }
}