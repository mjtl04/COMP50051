import { User } from "../entities/User";
import { BaseRepository } from "./BaseRepository";

export class UserRepository extends BaseRepository(User) {

    static login = async (email: string): Promise<User | null> => {
        return await this.repository.findOne({
            where: { email },
            // select: ["id", "first_name", "last_name", "email", "role_id", "department_id"]
        });
    }

    static getByEmail = async (email: string): Promise<User | null> => {
        return await this.repository.findOneBy({ email: email });
    }



}