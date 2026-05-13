
import { UserManagement } from "../../entities/UserManagement";
import { IBaseRepository } from "./IBaseRepository";

export interface IManagementRepository extends IBaseRepository<UserManagement> {
    getAllByManagerId(manager_id: number): Promise<UserManagement[] | null>
    getOneByEmployeeAndManager(user_id: number, manager_id: number): Promise<UserManagement | null>
}