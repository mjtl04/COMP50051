import { UserManagement } from "../entities/UserManagement";
import { isDateString, validate } from "class-validator";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { IManagementService } from "../interfaces/services/IManagementService";
import { IUserService } from "../interfaces/services/IUserService";
import { ResponseHandler } from "../utilities/ResponseHandler";
import { AppError } from "../utilities/AppError";
import { DateValidation } from "../utilities/DateValidation";

export class ManagementController {

  public static readonly SUCCESS_CREATED = "Management entry create";

  constructor(private managementService: IManagementService, private userService: IUserService) { }

  private validateRequest = async (req: Request): Promise<UserManagement> => {
    if (req.body == null) { throw new AppError(AppError.exceptions.ERROR_BODY_REQUIRED) }
    if (!('start_date' in req.body)) { throw new AppError(AppError.exceptions.ERROR_START_DATE_REQUIRED) }
    if (!('end_date' in req.body)) { throw new AppError(AppError.exceptions.ERROR_END_DATE_REQUIRED) }
    if (!('manager_id' in req.body)) { throw new AppError(AppError.exceptions.ERROR_MANAGER_ID_REQUIRED) }
    if (!('employee_id' in req.body)) { throw new AppError(AppError.exceptions.ERROR_EMPLOYEE_ID_REQUIRED) }

    if (isNaN(req.body.employee_id)) {
      throw new AppError(AppError.exceptions.ERROR_EMPLOYEE_ID)
    }

    if (isNaN(req.body.manager_id)) {
      throw new AppError(AppError.exceptions.ERROR_MANAGER_ID)
    }

    const user_id: number = Number(req.body.employee_id);
    const manager_id: number = Number(req.body.manager_id);

    let user_management = new UserManagement();

    user_management.user_id = user_id;
    user_management.manager_id = manager_id;

    user_management.start_date = DateValidation.isDate(req.body.start_date);
    user_management.end_date = DateValidation.isDate(req.body.end_date);

    const errors = await validate(user_management);
    if (errors.length > 0) {
      throw new AppError(
        errors.map((err) => Object.values(err.constraints || {})).join(", "),
      );
    }

    if (user_management.start_date < new Date() || user_management.end_date < new Date()) {
      throw new AppError(AppError.exceptions.ERROR_PAST_DATE)
    }

    if (user_management.start_date > user_management.end_date) {
      throw new AppError(AppError.exceptions.ERROR_DATE_ORDER(user_management.start_date, user_management.end_date))
    }

    return user_management;
  }

  public create = async (req: Request, res: Response): Promise<void> => {

    const management = await this.validateRequest(req);
    const employee = await this.userService.getById(management.user_id);
    const manager = await this.userService.getById(management.manager_id);

    await this.managementService.getOneByEmployeeAndManager(management.user_id, management.manager_id)
    await this.managementService.add(management);

    ResponseHandler.sendSuccessResponse(res, { message: ManagementController.SUCCESS_CREATED, data: management }, StatusCodes.CREATED,);
  };
}
