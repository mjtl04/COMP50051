import { UserManagement } from "../entities/UserManagement";
import { isDateString, validate } from "class-validator";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { IManagementService } from "../interfaces/services/IManagementService";
import { IResponseHandler } from "../interfaces/IResponseHandler";
import { IUserService } from "../interfaces/services/IUserService";

export class ManagementController {
  constructor(
    private managementService: IManagementService,
    private userService: IUserService,
    private responseHandler: IResponseHandler,
  ) { }

  private validateRequest = async (req: Request): Promise<UserManagement> => {

    if (req.body == null) { throw new Error("Request body is required") }
    if (!('start_date' in req.body)) { throw new Error("start_date field is required") }
    if (!('end_date' in req.body)) { throw new Error("end_date field is required") }
    if (!('employee_id' in req.body)) { throw new Error("employee_id field is required") }
    if (!('manager_id' in req.body)) { throw new Error("manager_id field is required") }

    if (!isDateString(req.body.start_date)) {
      throw new Error("Invalid start_date format")
    }

    if (!isDateString(req.body.end_date)) {
      throw new Error("Invalid end_date format")
    }

    if (isNaN(req.body.employee_id)) {
      throw new Error("Invalid employee_id")
    }

    if (isNaN(req.body.manager_id)) {
      throw new Error("Invalid manager_id")
    }

    const user_id: number = Number(req.body.employee_id);
    const manager_id: number = Number(req.body.manager_id);

    let user_management = new UserManagement();

    user_management.user_id = user_id;
    user_management.manager_id = manager_id;
    user_management.start_date = new Date(req.body.start_date);
    user_management.end_date = new Date(req.body.end_date);

    const errors = await validate(user_management);
    if (errors.length > 0) {
      throw new Error(
        errors.map((err) => Object.values(err.constraints || {})).join(", "),
      );
    }

    if (user_management.start_date < new Date() || user_management.end_date < new Date()) {
      throw new Error(`Cannot assign start date in the past`)
    }

    if (user_management.start_date > user_management.end_date) {
      throw new Error(`End date of ${user_management.end_date} is before the start date of ${user_management.start_date}`)
    }

    return user_management;
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    try {

      const management = await this.validateRequest(req);

      const employee = await this.userService.getById(management.user_id);
      const manager = await this.userService.getById(management.manager_id);

      await this.managementService.getOneByEmployeeAndManager(management.user_id, management.manager_id)

      await this.managementService.add(management);

      this.responseHandler.sendSuccessResponse(res, { message: "Created new management entry", data: management }, StatusCodes.CREATED,);
    } catch (error: any) {
      this.responseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, error.message);
    }

  };
}
