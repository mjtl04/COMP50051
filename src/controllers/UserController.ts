import { instanceToPlain, plainToInstance } from "class-transformer";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { UserDTO } from "../entities/DTO/UserDTO";
import { User } from "../entities/User";
import { IManagementService } from "../interfaces/services/IManagementService";
import { IUserService } from "../interfaces/services/IUserService";
import { ResponseHandler } from "../utilities/ResponseHandler";
import { Validation } from "../utilities/Validation";
import { AppError } from "../utilities/AppError";

export class UserController {

  public static readonly SUCCESS_DELETED = (id: number) => `User with id: ${id} has been Deleted`;

  constructor(private managementService: IManagementService, private userService: IUserService) { }

  public getAll = async (req: Request, res: Response): Promise<void> => {
    const users = await this.managementService.getManagedEmployees(req.authedUser.employee_id)
    ResponseHandler.sendSuccessResponse(res, instanceToPlain(users), StatusCodes.OK);
  }

  public getById = async (req: Request, res: Response): Promise<void> => {
    let id = Validation.paramId(req.params.id as string);
    let user = await this.userService.getById(id);
    ResponseHandler.sendSuccessResponse(res, instanceToPlain(user), StatusCodes.OK);
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    if (req.body == null) { throw new AppError(AppError.exceptions.ERROR_BODY_REQUIRED) }
    if (!('email' in req.body)) { throw new AppError(AppError.exceptions.ERROR_EMAIL_REQUIRED) }
    if (!('password' in req.body)) { throw new AppError(AppError.exceptions.ERROR_PASSWORD_REQUIRED) }
    if (!('first_name' in req.body)) { throw new AppError(AppError.exceptions.ERROR_FIRST_NAME_ID_REQUIRED) }
    if (!('last_name' in req.body)) { throw new AppError(AppError.exceptions.ERROR_LAST_NAME_ID_REQUIRED) }
    if (!('role_id' in req.body)) { throw new AppError(AppError.exceptions.ERROR_ROLE_ID_REQUIRED) }
    if (!('department_id' in req.body)) { throw new AppError(AppError.exceptions.ERROR_DEPARTMENT_ID_REQUIRED) }

    const user = plainToInstance(User, req.body);
    const dto = await this.userService.create(req.authedUser, user);
    ResponseHandler.sendSuccessResponse(res, instanceToPlain(dto), StatusCodes.CREATED);
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    let id = Validation.paramId(req.params.id as string);
    if (req.body == null) { throw new AppError(AppError.exceptions.ERROR_BODY_REQUIRED) }
    if (!('role_id' in req.body)) { throw new AppError(AppError.exceptions.ERROR_ROLE_ID_REQUIRED) }
    if (!('leave_balance' in req.body)) { throw new AppError(AppError.exceptions.ERROR_LEAVE_BALANCE_REQUIRED) }
    if (!('department_id' in req.body)) { throw new AppError(AppError.exceptions.ERROR_DEPARTMENT_ID_REQUIRED) }

    const dto = req.body as UserDTO;
    dto.id = Number(id);

    const user = await this.userService.update(dto);
    ResponseHandler.sendSuccessResponse(res, instanceToPlain(user), StatusCodes.OK);
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    const id = Validation.paramId(req.params.id as string);
    let user = await this.userService.getById(id);
    await this.userService.delete(id);
    ResponseHandler.sendSuccessResponse(res, { message: UserController.SUCCESS_DELETED(id) }, StatusCodes.OK);
  };
}
