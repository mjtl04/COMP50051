import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { IValidation } from "../interfaces/IValidation";
import { ILoginService } from "../interfaces/services/ILoginService";
import { IResponseHandler } from "../interfaces/IResponseHandler";
import jwt from 'jsonwebtoken';

export class LoginController {

  constructor(
    private loginService: ILoginService,
    private validation: IValidation,
    private responseHandler: IResponseHandler,
  ) { }

  public login = async (req: Request, res: Response): Promise<void> => {
    try {

      if (req.body == null) { throw new Error("Request body is required") }
      if (!('email' in req.body)) { throw new Error("email field is required") }
      if (!('password' in req.body)) { throw new Error("password field is required") }

      const email = this.validation.email(req.body.email);
      const password = this.validation.password(req.body.password);
      const token = await this.loginService.login(email, password);

      res.status(StatusCodes.ACCEPTED).send(jwt.sign({ ...token }, process.env.JWT_SECRET_KEY as string, { expiresIn: '3h' }));

    } catch (error: any) {
      this.responseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, error.message);
    }
  };
}
