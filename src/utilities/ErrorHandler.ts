import { Response } from 'express';
import { AppError } from '../utilities/AppError';
import { ResponseHandler } from '../utilities/ResponseHandler';
import { StatusCodes } from 'http-status-codes';
import { Logger } from './Logger';

export class ErrorHandler {

    static handle = (err: Error, res: Response) => {
        Logger.error(err.message);

        if (err instanceof AppError) {
            return ResponseHandler.sendErrorResponse(res, err.statusCode, err.message);
        }

        return ResponseHandler.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Internal Server Error');
    };
}