import { AuthedDTOToken } from "../entities/DTO/AuthedDTOToken";
import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "./ResponseHandler";
import { StatusCodes } from "http-status-codes";
import { Logger } from "./Logger";
import jwt from "jsonwebtoken";

export class ApiAuthentication {
  private static ERROR_TOKEN_IS_INVALID = "Not authorised - Token is invalid";
  private static ERROR_TOKEN_NOT_FOUND = "Not authorised - Token not found";

  public static authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(" ")[1];

      if (!process.env.JWT_SECRET_KEY) {
        Logger.error(this.ERROR_TOKEN_NOT_FOUND);
        return ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, this.ERROR_TOKEN_IS_INVALID);
      }

      jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) {
          Logger.error(this.ERROR_TOKEN_IS_INVALID);
          return ResponseHandler.sendErrorResponse(res, StatusCodes.UNAUTHORIZED, this.ERROR_TOKEN_IS_INVALID);
        }

        req.authedUser = user as AuthedDTOToken;
        next();
      });

    } else {
      Logger.error(this.ERROR_TOKEN_NOT_FOUND);
      ResponseHandler.sendErrorResponse(res, StatusCodes.UNAUTHORIZED, this.ERROR_TOKEN_NOT_FOUND,
      );
    }
  };
}
