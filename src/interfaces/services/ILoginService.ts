import { AuthedDTOToken } from "../../entities/DTO/AuthedDTOToken";

export interface ILoginService {
    login(email: string, password: string): Promise<AuthedDTOToken>;
}