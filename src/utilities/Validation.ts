import { isEmail, validate } from "class-validator";
import { StatusCodes } from "http-status-codes";
import { AppError } from "./AppError";

export class Validation {

    public static async classValidate<T extends object>(item: T): Promise<void> {
        const errors = await validate(item);
        if (errors.length > 0) {
            throw new AppError(errors.map(err => Object.values(err.constraints || {})).join(", "), StatusCodes.BAD_REQUEST);
        }
    };

    public static paramId(id: string): number {
        const value = parseInt(id);
        if (isNaN(value)) {
            throw new AppError(`Request parameter must be a valid number`, StatusCodes.BAD_REQUEST,);
        }
        return value;
    }

    public static email(email: string): string {
        if (!email || email.trim().length === 0) {
            throw new AppError("Email is required", StatusCodes.BAD_REQUEST);
        }
        if (!isEmail(email)) {
            throw new AppError("Enter valid email format", StatusCodes.BAD_REQUEST);
        }
        return email.trim().toLowerCase();
    }

    public static password(password: string): string {
        if (!password || password.trim().length === 0) {
            throw new AppError("Password is required", StatusCodes.BAD_REQUEST,);
        }
        return password;
    }

    public static reason(reason: string): string {
        if (!reason || reason.trim().length === 0) {
            throw new AppError("Reason is required", StatusCodes.BAD_REQUEST);
        }
        return reason;
    }

    public static formatName(name: string): string {
        if (!name) return name;
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }

}