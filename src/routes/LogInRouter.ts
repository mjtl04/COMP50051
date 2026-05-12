import { LoginController } from "../controllers/LoginController";
import { BaseRouter } from "./BaseRouter";
import { Router } from "express";

export class LoginRouter extends BaseRouter {
  constructor(private controller: LoginController) { super() }

  protected initialise(router: Router): void {
    router.post("/", this.controller.login);
  }
}
