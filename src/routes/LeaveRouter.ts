import { LeaveController } from "../controllers/LeaveController";
import { BaseRouter } from "./BaseRouter";
import { Router } from "express";

export class LeaveRouter extends BaseRouter {
  constructor(private controller: LeaveController) { super() }

  protected initialise(router: Router): void {
    router.get("/user/balance/:user_id", this.controller.balance);
    router.patch("/approve/:leave_id", this.controller.approve);
    router.patch("/reject", this.controller.reject);
    router.get("/pending", this.controller.pending);
    router.get("/user/:user_id", this.controller.get);
    router.post("/", this.controller.create);
    router.delete("/", this.controller.cancel);
  }
}
