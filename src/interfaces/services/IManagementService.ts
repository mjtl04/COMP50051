
import { UserManagement } from "../../entities/UserManagement";
import { UserDTO } from "../../entities/DTO/UserDTO";

export interface IManagementService {
    add(entry: UserManagement): Promise<UserManagement>;
    getManagedEmployees(user_id: number): Promise<UserDTO[]>;
    isManagedEmployee(user_id: number, employee_id: number): Promise<boolean>;
    getOneByEmployeeAndManager(user_id: number, employee_id: number): void;
}