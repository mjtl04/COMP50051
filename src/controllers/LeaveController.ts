import { ResponseHandler } from "../utilities/ResponseHandler";
import { StatusEnum } from "../utilities/enums/StatusEnum";
import { Validation } from "../utilities/Validation";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { LeaveService } from "../services/LeaveService";

export class LeaveController {

  public balance = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.user_id);

      if (isNaN(id)) {
        throw new Error("Invalid employee ID");
      }

      const balance = await LeaveService.getBalance(req.authedUser.employee_id, id);
      ResponseHandler.sendSuccessResponse(res, balance, StatusCodes.OK);

    } catch (error: any) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, error.message);
    }
  }

  public get = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.user_id);
      if (isNaN(id)) { throw new Error("Invalid employee ID") }

      const leave_requests = await LeaveService.getByUser(req.authedUser.employee_id, id);
      ResponseHandler.sendSuccessResponse(res, leave_requests, StatusCodes.OK);

    } catch (error: any) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, error.message);
    }
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    try {

      if (!('start_date' in req.body)) { throw new Error("start_date field is required") }
      if (!('end_date' in req.body)) { throw new Error("end_date field is required") }

      const start_date = new Date(req.body.start_date);
      const end_date = new Date(req.body.end_date);

      let leave_dto = await LeaveService.create(start_date, end_date, req.authedUser.employee_id);

      ResponseHandler.sendSuccessResponse(res, { message: "Leave request submitted for review", data: leave_dto }, StatusCodes.CREATED);

    } catch (error: any) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, error.message);
    }
  };

  public cancel = async (req: Request, res: Response): Promise<void> => {
    try {

      if (!('leave_request_id' in req.body)) { throw new Error("leave_request_id field is required") }
      if (!('reason' in req.body)) { throw new Error("reason field is required") }

      const id = Number(req.body.leave_request_id);
      if (isNaN(id)) { throw new Error("Invalid Leave Request ID"); }

      Validation.reason(req.body.reason);

      let leave_dto = await LeaveService.update(req.authedUser, id, req.body.reason, StatusEnum.Cancelled);

      ResponseHandler.sendSuccessResponse(
        res, { message: "Leave request has been Cancelled", reason: leave_dto.comment, data: leave_dto }, StatusCodes.ACCEPTED,
      );

    } catch (error: any) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, error.message);
    }
  };

  public approve = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.leave_id);
      if (isNaN(id)) { throw new Error("Invalid Leave Request ID") }

      let leave_dto = await LeaveService.update(req.authedUser, id, null, StatusEnum.Approved);

      ResponseHandler.sendSuccessResponse(res, { message: `Leave Request with id: ${id} has been Approved` }, StatusCodes.OK);
    }
    catch (error: any) {
      ResponseHandler.sendErrorResponse(
        res, StatusCodes.BAD_REQUEST, error.message,
      );
    }
  }

  public reject = async (req: Request, res: Response): Promise<void> => {
    try {

      if (!('leave_request_id' in req.body)) { throw new Error("leave_request_id field is required") }
      if (!('reason' in req.body)) { throw new Error("reason field is required") }

      const id = Number(req.body.leave_request_id);
      if (isNaN(id)) { throw new Error("Invalid Leave Request ID") }

      Validation.reason(req.body.reason);

      await LeaveService.update(req.authedUser, id, req.body.reason, StatusEnum.Rejected);

      ResponseHandler.sendSuccessResponse(res, { message: `Leave Request with id: ${id} has been Rejected` }, StatusCodes.OK);

    } catch (error: any) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, error.message);
    }
  };

  public pending = async (req: Request, res: Response): Promise<void> => {
    try {
      const pending = await LeaveService.getPending(req.authedUser);
      ResponseHandler.sendSuccessResponse(res, pending, StatusCodes.OK);

    } catch (error: any) {
      ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, error.message);
    }
  }
}