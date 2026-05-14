import { AppError } from "./APIExceptions";
import { StatusCodes } from "http-status-codes";
import argon2 from "argon2";

export class PasswordHandler {
    public static readonly ERROR_PASSWORD_INCORRECT = "Password incorrect";
    public static readonly ERROR_NO_PASSWORD_PROVIDED = "No password provided";

    private static readonly PEPPER = process.env.PEPPER;

    public static hashPassword = async (password: string): Promise<string> => {
        return argon2.hash(password + PasswordHandler.PEPPER);
    }

    public static verifyPassword = async (password: string, hash: string): Promise<boolean> => {
        if (!password || password.trim().length === 0) {
            throw new AppError(StatusCodes.FORBIDDEN, PasswordHandler.ERROR_NO_PASSWORD_PROVIDED);
        }

        const isValid = await argon2.verify(hash, password + PasswordHandler.PEPPER);
        if (!isValid) {
            throw new AppError(StatusCodes.FORBIDDEN, PasswordHandler.ERROR_PASSWORD_INCORRECT);
        }

        return true;
    }

}