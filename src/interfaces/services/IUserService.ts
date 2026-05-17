
import { AuthedDTOToken } from "../../entities/DTO/AuthedDTOToken";
import { NewUserDTO } from "../../entities/DTO/NewUserDTO";
import { UserDTO } from "../../entities/DTO/UserDTO";
import { User } from "../../entities/User";

export interface IUserService {

    login(email: string): Promise<User>;

    getByEmail(email: string): Promise<UserDTO>;
    getAll(): Promise<UserDTO[]>;
    getById(id: number): Promise<UserDTO>;
    update(dto: UserDTO): Promise<UserDTO>;
    create(token: AuthedDTOToken, user: NewUserDTO): Promise<UserDTO>;
    delete(id: number): void;

}