import { Department } from "../../entities/Department";
import { IBaseRepository } from "./IBaseRepository";

export interface IDepartmentRepository extends IBaseRepository<Department> {
    getById(id: number): Promise<Department | null>;
}