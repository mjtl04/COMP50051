import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { ILoginService } from "../interfaces/services/ILoginService";
import jwt from 'jsonwebtoken';
import { Validation } from "../utilities/Validation";
import { ResponseHandler } from "../utilities/ResponseHandler";
import { Logger } from "../utilities/Logger";

export class LoginController {

  constructor(private loginService: ILoginService) { }

  public login = async (req: Request, res: Response): Promise<void> => {
    try {

      if (req.body == null) { throw new Error("Request body is required") }
      if (!('email' in req.body)) { throw new Error("email field is required") }
      if (!('password' in req.body)) { throw new Error("password field is required") }

      const email = Validation.email(req.body.email);
      const password = Validation.password(req.body.password);
      const token = await this.loginService.login(email, password);

      res.status(StatusCodes.ACCEPTED).send(jwt.sign({ ...token }, process.env.JWT_SECRET_KEY as string, { expiresIn: '3h' }));

    } catch (error: any) {
      Logger.error(error.message);
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, error.message);
    }
  };
}
