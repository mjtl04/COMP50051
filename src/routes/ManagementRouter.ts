import { ManagementController } from "../controllers/ManagementController";
import { ApiAuthorisation } from "../utilities/ApiAuthorisation";
import { RoleEnum } from "../utilities/enums/RoleEnum";
import { BaseRouter } from "./BaseRouter";
import { Router } from "express";

export class ManagementRouter extends BaseRouter {
  constructor(private controller: ManagementController) { super() }

  protected initialise(router: Router): void {
    router.post("/", ApiAuthorisation.authoriseRole(RoleEnum.Admin), this.controller.create);
  }
}