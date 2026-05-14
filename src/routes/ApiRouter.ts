import { IApiRouter } from "../interfaces/IApiRouter";
import { RouteContainer } from "./RouteContainer";
import express from "express";
import rateLimit from "express-rate-limit";
import { IAuthentication } from "../interfaces/IAuthentication";

export class ApiRouter implements IApiRouter {

  constructor(
    private authentication: IAuthentication
  ) { }

  static readonly ERROR_TOO_MANY_REQUESTS = "Too many api requests raised";

  private readonly loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: ApiRouter.ERROR_TOO_MANY_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: any) => {
      return req.body?.email || 'unknown';
    }
  });

  private readonly jwtRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: ApiRouter.ERROR_TOO_MANY_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: any) => {
      return req.authedUser?.email || 'unknown';
    }
  });

  initialise(app: express.Application): void {
    app.use("/api/login", this.loginRateLimiter, RouteContainer.LoginRouter.getRouter());
    app.use("/api/users", this.jwtRateLimiter, this.authentication.authenticateToken, RouteContainer.UserRouter.getRouter());
    app.use("/api/leave-requests", this.jwtRateLimiter, this.authentication.authenticateToken, RouteContainer.LeaveRouter.getRouter());
    app.use("/api/management", this.jwtRateLimiter, this.authentication.authenticateToken, RouteContainer.ManagementRouter.getRouter());
  }
}
