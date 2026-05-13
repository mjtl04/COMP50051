import { User } from "../entities/User";
import { BaseRepository } from "./BaseRepository";

export class UserRepository extends BaseRepository(User) {

    public async getByEmail(email: string): Promise<User | null> {
        return await this.repository.findOneBy({ email: email });
    }

}