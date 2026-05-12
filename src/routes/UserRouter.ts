import { UserController } from "../controllers/UserController";
import { ApiAuthorisation } from "../utilities/ApiAuthorisation";
import { RoleEnum } from "../utilities/enums/RoleEnum";
import { BaseRouter } from "./BaseRouter";
import { Router } from "express";

export class UserRouter extends BaseRouter {
  constructor(private controller: UserController) { super() }

  protected initialise(router: Router): void {
    router.get("/", this.controller.getAll);
    router.get("/:id", this.controller.getById);
    router.post("/", ApiAuthorisation.authoriseRole(RoleEnum.Admin), this.controller.create);
    router.delete("/:id", ApiAuthorisation.authoriseRole(RoleEnum.Admin), this.controller.delete);
    router.patch("/:id", ApiAuthorisation.authoriseRole(RoleEnum.Admin), this.controller.update);
  }
}