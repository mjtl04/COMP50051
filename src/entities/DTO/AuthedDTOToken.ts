import { Role } from "../Role";

export class AuthedDTOToken {
    employee_id!: number;
    first_name!: string;
    last_name!: string;
    email!: string;
    role!: Role;

    constructor() { }
}
