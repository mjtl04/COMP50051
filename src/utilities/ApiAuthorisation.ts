import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "./ResponseHandler";
import { StatusCodes } from "http-status-codes";
import { RoleEnum } from "./enums/RoleEnum";
import { AuthedDTOToken } from "../entities/DTO/AuthedDTOToken";
import { AppError } from "./APIExceptions";

export class ApiAuthorisation {

    static ERROR_NOT_AUTHENTICATED = `Not Authenticated - please log in`
    static ERROR_NOT_AUTHOURISED = `Not Authorised - not enough permission`
    static ERROR_NOT_ADMIN = `Not Admin - requires admin privelleges`

    static authoriseRole = (...allowedRoles: RoleEnum[]) => {
        return (req: Request, res: Response, next: NextFunction) => {
            if (!req.authedUser) {
                ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, this.ERROR_NOT_AUTHENTICATED);
            }

            if (!allowedRoles.includes(req.authedUser.role.id)) {
                ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, this.ERROR_NOT_AUTHOURISED);
            }
            next();
        }
    }

    static isAdmin(token: AuthedDTOToken | undefined) {
        if (token) {
            if (token.role.id != RoleEnum.Admin) {
                throw new AppError(StatusCodes.BAD_REQUEST, this.ERROR_NOT_ADMIN);
            }
        }
        else {
            throw new AppError(StatusCodes.BAD_REQUEST, this.ERROR_NOT_AUTHENTICATED);
        }
    }
}
