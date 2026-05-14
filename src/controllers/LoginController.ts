import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { ILoginService } from "../interfaces/services/ILoginService";
import jwt from 'jsonwebtoken';
import { Validation } from "../utilities/Validation";
import { AppError } from "../utilities/AppError";

export class LoginController {

  constructor(private loginService: ILoginService) { }

  public login = async (req: Request, res: Response): Promise<void> => {

    if (req.body == null) { throw new AppError(AppError.exceptions.ERROR_BODY_REQUIRED) }
    if (!('email' in req.body)) { throw new AppError(AppError.exceptions.ERROR_EMAIL_REQUIRED) }
    if (!('password' in req.body)) { throw new AppError(AppError.exceptions.ERROR_PASSWORD_REQUIRED) }

    const email = Validation.email(req.body.email);
    const password = Validation.password(req.body.password);
    const token = await this.loginService.login(email, password);

    res.status(StatusCodes.ACCEPTED).send(jwt.sign({ ...token }, process.env.JWT_SECRET_KEY as string, { expiresIn: '3h' }));

  };
}
