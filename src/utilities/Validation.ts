import { isEmail, validate } from "class-validator";
import { StatusCodes } from "http-status-codes";
import { AppError } from "./APIExceptions";
import { IValidation } from "../interfaces/IValidation";

export class Validation implements IValidation {

    public async classValidate<T extends object>(item: T): Promise<void> {
        const errors = await validate(item);
        if (errors.length > 0) {
            throw new AppError(StatusCodes.BAD_REQUEST, errors.map(err => Object.values(err.constraints || {})).join(", "));
        }
    };

    public paramId(id: string): number {
        const value = parseInt(id);
        if (isNaN(value)) {
            throw new AppError(StatusCodes.BAD_REQUEST, `Request parameter must be a valid number`);
        }
        return value;
    }

    public email(email: string): string {
        if (!email || email.trim().length === 0) {
            throw new AppError(StatusCodes.BAD_REQUEST, "Email is required");
        }
        if (!isEmail(email)) {
            throw new AppError(StatusCodes.BAD_REQUEST, "Enter valid email format");
        }
        return email.trim().toLowerCase();
    }

    public password(password: string): string {
        if (!password || password.trim().length === 0) {
            throw new AppError(StatusCodes.BAD_REQUEST, "Password is required");
        }
        return password;
    }

    public reason(reason: string): string {
        if (!reason || reason.trim().length === 0) {
            throw new AppError(StatusCodes.BAD_REQUEST, "Reason is required");
        }
        return reason;
    }

    public formatName(name: string): string {
        if (!name) return name;
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }

}