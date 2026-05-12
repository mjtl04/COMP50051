import { ManagementController } from "../controllers/ManagementController";
import { LeaveController } from "../controllers/LeaveController";
import { LoginController } from "../controllers/LoginController";
import { UserController } from "../controllers/UserController";
import { ManagementRouter } from "./ManagementRouter";
import { LeaveRouter } from "./LeaveRouter";
import { LoginRouter } from "./LogInRouter";
import { UserRouter } from "./UserRouter";

export const RouteContainer = {
    LoginRouter: new LoginRouter(new LoginController()),
    UserRouter: new UserRouter(new UserController()),
    LeaveRouter: new LeaveRouter(new LeaveController()),
    ManagementRouter: new ManagementRouter(new ManagementController()),
};