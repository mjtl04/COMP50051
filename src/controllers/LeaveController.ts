import { StatusEnum } from "../utilities/enums/StatusEnum";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { ILeaveService } from "../interfaces/services/ILeaveService";
import { ResponseHandler } from "../utilities/ResponseHandler";
import { Validation } from "../utilities/Validation";
import { AppError } from "../utilities/AppError";
import { DateValidation } from "../utilities/DateValidation";

export class LeaveController {

  public static readonly SUCCESS_REJECTED = (id: number) => `Leave Request with id: ${id} has been Rejected`;
  public static readonly SUCCESS_APPROVED = (id: number) => `Leave Request with id: ${id} has been Approved`;
  public static readonly SUCCESS_CANCELLED = (id: number) => `Leave Request with id: ${id} has been Cancelled`;
  public static readonly SUCCESS_SUBMITTED = `Leave Request has been submitted for review`;
  public static readonly ERROR_LEAVE_ID_REQUIRED = "leave_request_id field is required";
  public static readonly ERROR_LEAVE_ID_FORMAT = "leave_request_id must be a number";

  constructor(private leaveService: ILeaveService) { }

  public balance = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.user_id);

      if (isNaN(id)) { throw new AppError(AppError.exceptions.ERROR_EMPLOYEE_ID) }

      const balance = await this.leaveService.getBalance(req.authedUser.employee_id, id);
      ResponseHandler.sendSuccessResponse(res, balance, StatusCodes.OK);
    } catch (error: any) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, error.message);
    }
  }

  public get = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.user_id);
      if (isNaN(id)) { throw new AppError(AppError.exceptions.ERROR_EMPLOYEE_ID) }

      const leave_requests = await this.leaveService.getByUser(req.authedUser.employee_id, id);
      ResponseHandler.sendSuccessResponse(res, leave_requests, StatusCodes.OK);

    } catch (error: any) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, error.message);
    }

  }

  public create = async (req: Request, res: Response): Promise<void> => {
    try {

      if (req.body == null) { throw new AppError(AppError.exceptions.ERROR_BODY_REQUIRED) }
      if (!('start_date' in req.body)) { throw new AppError(AppError.exceptions.ERROR_START_DATE_REQUIRED) }
      if (!('end_date' in req.body)) { throw new AppError(AppError.exceptions.ERROR_END_DATE_REQUIRED) }

      const start_date = DateValidation.isDate(req.body.start_date);
      const end_date = DateValidation.isDate(req.body.end_date);

      let leave_dto = await this.leaveService.create(start_date, end_date, req.authedUser.employee_id);
      ResponseHandler.sendSuccessResponse(res, { message: LeaveController.SUCCESS_SUBMITTED, data: leave_dto }, StatusCodes.CREATED);

    } catch (error: any) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, error.message);
    }
  };

  public cancel = async (req: Request, res: Response): Promise<void> => {
    try {

      if (req.body == null) { throw new AppError(AppError.exceptions.ERROR_BODY_REQUIRED) }
      if (!('leave_request_id' in req.body)) { throw new AppError(LeaveController.ERROR_LEAVE_ID_REQUIRED) }
      if (!('reason' in req.body)) { throw new AppError(AppError.exceptions.ERROR_REASON_REQUIRED) }

      const id = Number(req.body.leave_request_id);
      if (isNaN(id)) { throw new AppError(LeaveController.ERROR_LEAVE_ID_FORMAT) }

      Validation.reason(req.body.reason);
      let leave_dto = await this.leaveService.update(req.authedUser, id, req.body.reason, StatusEnum.Cancelled);

      ResponseHandler.sendSuccessResponse(res, { message: LeaveController.SUCCESS_CANCELLED(id), reason: leave_dto.comment, data: leave_dto }, StatusCodes.OK);
    } catch (error: any) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, error.message);
    }
  };

  public approve = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.leave_id);
      if (isNaN(id)) { throw new AppError(LeaveController.ERROR_LEAVE_ID_FORMAT) }

      let leave_dto = await this.leaveService.update(req.authedUser, id, null, StatusEnum.Approved);
      ResponseHandler.sendSuccessResponse(res, { message: LeaveController.SUCCESS_APPROVED(id) }, StatusCodes.OK);
    } catch (error: any) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, error.message);
    }
  }

  public reject = async (req: Request, res: Response): Promise<void> => {
    try {

      if (req.body == null) { throw new AppError(AppError.exceptions.ERROR_BODY_REQUIRED) }
      if (!('leave_request_id' in req.body)) { throw new AppError(LeaveController.ERROR_LEAVE_ID_REQUIRED) }
      if (!('reason' in req.body)) { throw new AppError(AppError.exceptions.ERROR_REASON_REQUIRED) }

      const id = Number(req.body.leave_request_id);
      if (isNaN(id)) { throw new AppError(LeaveController.ERROR_LEAVE_ID_FORMAT) }

      Validation.reason(req.body.reason);
      await this.leaveService.update(req.authedUser, id, req.body.reason, StatusEnum.Rejected);
      ResponseHandler.sendSuccessResponse(res, { message: LeaveController.SUCCESS_REJECTED(id) }, StatusCodes.OK);

    } catch (error: any) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, error.message);
    }
  };

  public pending = async (req: Request, res: Response): Promise<void> => {
    try {
      const pending = await this.leaveService.getPending(req.authedUser);
      ResponseHandler.sendSuccessResponse(res, pending, StatusCodes.OK);
    } catch (error: any) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, error.message);
    }
  }
}