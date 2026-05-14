import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { RoleEnum } from "./enums/RoleEnum";
import { AuthedDTOToken } from "../entities/DTO/AuthedDTOToken";
import { ResponseHandler } from "./ResponseHandler";
import { AppError } from "./AppError";

export class ApiAuthorisation {

    static ERROR_NOT_AUTHENTICATED = `Not Authenticated - please log in`
    static ERROR_NOT_AUTHOURISED = `Not Authorised - not enough permission`
    static ERROR_NOT_ADMIN = `Not Admin - requires admin privelleges`

    public static authoriseRole = (...allowedRoles: RoleEnum[]) => {
        return (req: Request, res: Response, next: NextFunction) => {
            if (!req.authedUser) {
                ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, ApiAuthorisation.ERROR_NOT_AUTHENTICATED);
            }

            if (!allowedRoles.includes(req.authedUser.role.id)) {
                ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, ApiAuthorisation.ERROR_NOT_AUTHOURISED);
            }
            next();
        }
    }

    static isAdmin(token: AuthedDTOToken | undefined) {
        if (token) {
            if (token.role.id != RoleEnum.Admin) {
                throw new AppError(this.ERROR_NOT_ADMIN, StatusCodes.BAD_REQUEST);
            }
        }
        else {
            throw new AppError(this.ERROR_NOT_AUTHENTICATED, StatusCodes.BAD_REQUEST,);
        }
    }
}
