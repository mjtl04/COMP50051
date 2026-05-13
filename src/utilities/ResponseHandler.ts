import { Response } from "express";
import { Logger } from "./Logger";
import { StatusCodes } from "http-status-codes";
import { IResponseHandler } from "../interfaces/IResponseHandler";

export class ResponseHandler implements IResponseHandler {
  public sendErrorResponse(res: Response, statusCode: number, message: string = "Unexpected error"): Response {
    const timestamp = new Date().toISOString();
    Logger.error(`[Error]: ${message}`, `${timestamp}`);

    const errorResponse = {
      error: {
        message: message,
        status: statusCode,
        timestamp: timestamp,
      },
    };
    return res.status(statusCode).send(errorResponse);
  }

  public sendSuccessResponse(res: Response, data: any, statusCode: number = StatusCodes.OK): Response {
    return res.status(statusCode).send(data);
  }
}
