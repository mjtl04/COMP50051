import { Department } from "../../entities/Department";

export interface IDepartmentService {
    getById(id: number): Promise<Department>;
}