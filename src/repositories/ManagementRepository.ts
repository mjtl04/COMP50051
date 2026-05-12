import { UserManagement } from "../entities/UserManagement";
import { BaseRepository } from "./BaseRepository";

export class ManagementRepository extends BaseRepository(UserManagement) {

    static getAllByManagerId = async (manager_id: number): Promise<UserManagement[] | null> => {
        return await this.repository.findBy({ manager_id: manager_id });
    }

    static getOneByEmployeeAndManager = async (user_id: number, manager_id: number): Promise<UserManagement | null> => {
        return await this.repository.findOne({ where: { user_id: user_id, manager_id: manager_id } });
    }
}