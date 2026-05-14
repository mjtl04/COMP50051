import { ManagementController } from "../controllers/ManagementController";
import { IAuthorisation } from "../interfaces/IAuthorisation";
import { RoleEnum } from "../utilities/enums/RoleEnum";
import { BaseRouter } from "./BaseRouter";
import { Router } from "express";

export class ManagementRouter extends BaseRouter {
  constructor(private controller: ManagementController, private authorisation: IAuthorisation) { super() }

  protected initialise(router: Router): void {
    router.post("/", this.authorisation.authoriseRole(RoleEnum.Admin), this.controller.create);
  }
}