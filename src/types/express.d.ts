import { AuthedDTOToken } from '../entities/DTO/AuthedDTOToken'

declare global {
    namespace Express {
        interface Request {
            authedUser: AuthedDTOToken
        }
    }
}

export { }
