import { StatusCodes } from 'http-status-codes';

export class AppError extends Error {
    public statusCode: number;

    constructor(message: string, statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }

    static exceptions = {
        ERROR_BODY_REQUIRED: "request body is required",
        ERROR_START_DATE_REQUIRED: "start_date field is required",
        ERROR_END_DATE_REQUIRED: "end_date field is required",
        ERROR_REASON_REQUIRED: "reason field is required",
        ERROR_EMAIL_REQUIRED: "email field is required",
        ERROR_PASSWORD_REQUIRED: "password field is required",
        ERROR_MANAGER_ID_REQUIRED: "manager_id field is required",
        ERROR_EMPLOYEE_ID_REQUIRED: "employee_id field is required",
        ERROR_FIRST_NAME_ID_REQUIRED: "first_name field is required",
        ERROR_LAST_NAME_ID_REQUIRED: "last_name field is required",
        ERROR_ROLE_ID_REQUIRED: "role_id field is required",
        ERROR_DEPARTMENT_ID_REQUIRED: "department_id field is required",
        ERROR_LEAVE_BALANCE_REQUIRED: "leave_balance field is required",

        ERROR_EMPLOYEE_ID: "Invalid Employee ID",
        ERROR_START_DATE: "Invalid start_date format",
        ERROR_END_DATE: "Invalid end_date format",
        ERROR_MANAGER_ID: "Invalid manager_id format",
        ERROR_PAST_DATE: "Cannot assign date in the past",
        ERROR_DATE_ORDER: (start: Date, end: Date) => `End date: ${end} is before the start date: ${start}`,
    }
}
