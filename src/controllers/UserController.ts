import { instanceToPlain, plainToInstance } from "class-transformer";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { UserDTO } from "../entities/DTO/UserDTO";
import { User } from "../entities/User";
import { IManagementService } from "../interfaces/services/IManagementService";
import { IUserService } from "../interfaces/services/IUserService";
import { ResponseHandler } from "../utilities/ResponseHandler";
import { Validation } from "../utilities/Validation";

export class UserController {

  constructor(private managementService: IManagementService, private userService: IUserService) { }

  public getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.managementService.getManagedEmployees(req.authedUser.employee_id)
      ResponseHandler.sendSuccessResponse(res, instanceToPlain(users), StatusCodes.OK);
    } catch (error: any) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, error.message);
    }
  }

  public getById = async (req: Request, res: Response): Promise<void> => {
    try {
      let id = Validation.paramId(req.params.id as string);
      let user = await this.userService.getById(id);
      ResponseHandler.sendSuccessResponse(res, instanceToPlain(user), StatusCodes.OK);
    } catch (error: any) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, error.message);
    }
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    try {
      if (req.body == null) { throw new Error("Request body is required") }
      if (!('email' in req.body)) { throw new Error("email field is required") }
      if (!('password' in req.body)) { throw new Error("password field is required") }
      if (!('first_name' in req.body)) { throw new Error("first_name field is required") }
      if (!('last_name' in req.body)) { throw new Error("last_name field is required") }
      if (!('role_id' in req.body)) { throw new Error("role_id field is required") }
      if (!('department_id' in req.body)) { throw new Error("department_id field is required") }

      const user = plainToInstance(User, req.body);
      const dto = await this.userService.create(req.authedUser, user);
      ResponseHandler.sendSuccessResponse(res, instanceToPlain(dto), StatusCodes.CREATED);
    } catch (error: any) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, error.message);
    }
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    try {
      let id = Validation.paramId(req.params.id as string);
      if (req.body == null) { throw new Error("Request body is required") }
      if (!('role_id' in req.body)) { throw new Error("role_id field is required") }
      if (!('department_id' in req.body)) { throw new Error("department_id field is required") }
      if (!('leave_balance' in req.body)) { throw new Error("leave_balance field is required") }

      const dto = req.body as UserDTO;
      dto.id = Number(id);

      const user = await this.userService.update(dto);
      ResponseHandler.sendSuccessResponse(res, instanceToPlain(user), StatusCodes.OK);
    } catch (error: any) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, error.message);
    }
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Validation.paramId(req.params.id as string);
      let user = await this.userService.getById(id);
      await this.userService.delete(id);
      ResponseHandler.sendSuccessResponse(res, { message: `User with Id: ${id} deleted` }, StatusCodes.OK);
    } catch (error: any) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, error.message);
    }
  };
}
