import { Validation } from "../../utilities/Validation";
import { User } from "../User";

export class UserDTO {

    id!: number;
    first_name!: string;
    last_name!: string;
    email!: string;
    leave_balance!: number;
    role_id!: number;
    department_id!: number;

    static init(user: User): UserDTO {
        const dto = new UserDTO();
        dto.id = user.id;
        dto.first_name = Validation.formatName(user.first_name);
        dto.last_name = Validation.formatName(user.last_name);
        dto.email = Validation.email(user.email);
        dto.leave_balance = user.leave_balance;
        dto.role_id = user.role_id;
        dto.department_id = user.department_id;
        return dto;
    }

}