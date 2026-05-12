import { Router } from "express";

export abstract class BaseRouter {
    private router: Router = Router();

    getRouter(): Router {
        this.initialise(this.router);
        return this.router;
    }

    protected abstract initialise(router: Router): void;
}