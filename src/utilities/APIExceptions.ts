
export class AppError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

export class APIExceptions {

    static readonly auth = {
        unauthorized: 'You are not authorized to perform this action',
        invalidCredentials: 'Invalid email or password',
        tokenExpired: 'Your session has expired, please log in again',
    };

    static readonly validation = {
        required: (field: string) => `${field} is required`,
        invalid: (field: string) => `${field} is invalid`,
        tooLong: (field: string, max: number) => `${field} must be at most ${max} characters`,
        tooShort: (field: string, min: number) => `${field} must be at least ${min} characters`,
    };

    static readonly entity = {
        idNotProvided: `Id not provided`,
        notFound: (entity: string) => `${entity} not found`,
        entitiesNotFound: (entity: string) => `Failed to retrieve ${entity}`,
        alreadyExists: (entity: string) => `${entity} already exists`,
        createFailed: (entity: string) => `Failed to create ${entity}`,
        updateFailed: (entity: string) => `Failed to update ${entity}`,
        deleteFailed: (entity: string) => `Failed to delete ${entity}`,
    };

    static readonly server = {
        internal: 'An unexpected error occurred, please try again later',
        unavailable: 'Service is temporarily unavailable',
    };
}