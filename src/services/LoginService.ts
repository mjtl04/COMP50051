import { AuthedDTOToken } from "../entities/DTO/AuthedDTOToken";
import { Role } from "../entities/Role";
import { PasswordHandler } from "../utilities/PasswordHandler";
import { UserService } from "./UserService";

export class LoginService {

    static login = async (email: string, password: string): Promise<AuthedDTOToken> => {

        const user = await UserService.login(email);

        await PasswordHandler.verifyPassword(password, user.password);

        const token: AuthedDTOToken = {
            employee_id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: { id: user.role_id } as Role
        }

        return token;
    }
}