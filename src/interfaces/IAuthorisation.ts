import { Request, Response, NextFunction } from "express";
import { RoleEnum } from "../utilities/enums/RoleEnum";

export interface IAuthorisation {
    authoriseRole(
        ...allowedRoles: RoleEnum[]
    ): (req: Request, res: Response, next: NextFunction) => void;
}
