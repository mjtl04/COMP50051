
import { User } from "../../entities/User";
import { IBaseRepository } from "./IBaseRepository";

export interface IUserRepository extends IBaseRepository<User> {
    getByEmail(email: string): Promise<User | null>
}