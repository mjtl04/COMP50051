import { Request, Response, NextFunction } from "express";

export interface IAuthentication {
    authenticateToken(
        req: Request,
        res: Response,
        next: NextFunction
    ): void;
}
