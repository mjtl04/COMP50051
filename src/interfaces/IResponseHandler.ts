
import type { Response } from "express";

export interface IResponseHandler {
    sendErrorResponse(res: Response, code: number, message: string): Response;
    sendSuccessResponse(res: Response, data: any, code: number): Response;
}
