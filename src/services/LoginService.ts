import { AuthedDTOToken } from "../entities/DTO/AuthedDTOToken";
import { Role } from "../entities/Role";
import { IUserService } from "../interfaces/services/IUserService";
import { ILoginService } from "../interfaces/services/ILoginService";
import { PasswordHandler } from "../utilities/PasswordHandler";

export class LoginService implements ILoginService {

    constructor(
        private userService: IUserService,
    ) { }

    public async login(email: string, password: string): Promise<AuthedDTOToken> {

        const user = await this.userService.login(email);

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