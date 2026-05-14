import { ManagementController } from "../controllers/ManagementController";
import { LeaveController } from "../controllers/LeaveController";
import { LoginController } from "../controllers/LoginController";
import { UserController } from "../controllers/UserController";
import { ManagementRouter } from "./ManagementRouter";
import { LeaveRouter } from "./LeaveRouter";
import { LoginRouter } from "./LogInRouter";
import { UserRouter } from "./UserRouter";
import { LoginService } from "../services/LoginService";
import { UserService } from "../services/UserService";
import { ManagementService } from "../services/ManagementService";
import { LeaveService } from "../services/LeaveService";
import { RoleService } from "../services/RoleService";
import { DepartmentService } from "../services/DepartmentService";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { ILeaveRepository } from "../interfaces/repositories/ILeaveRepository";
import { LeaveRepository } from "../repositories/LeaveRepository";
import { IRoleService } from "../interfaces/services/IRoleService";
import { IRoleRepository } from "../interfaces/repositories/IRoleRepository";
import { RoleRepository } from "../repositories/RoleRepository";
import { IDepartmentService } from "../interfaces/services/IDepartmentService";
import { IDepartmentRepository } from "../interfaces/repositories/IDepartmentRepository";
import { DepartmentRepository } from "../repositories/DepartmentRepository";
import { IManagementRepository } from "../interfaces/repositories/IManagementRepository";
import { ManagementRepository } from "../repositories/ManagementRepository";
import { UserRepository } from "../repositories/UserRepository";
import { ApiAuthorisation } from "../utilities/ApiAuthorisation";
import { IAuthorisation } from "../interfaces/IAuthorisation";

const userRepository: IUserRepository = new UserRepository;
const roleRepository: IRoleRepository = new RoleRepository;
const departmentRepository: IDepartmentRepository = new DepartmentRepository;
const leaveRepository: ILeaveRepository = new LeaveRepository;
const managementRepository: IManagementRepository = new ManagementRepository;

const authorisation: IAuthorisation = new ApiAuthorisation();

const roleService: IRoleService = new RoleService(roleRepository);
const departmentService: IDepartmentService = new DepartmentService(departmentRepository);
const userService = new UserService(userRepository, roleService, departmentService);

const managementService = new ManagementService(managementRepository, userService);
const loginService = new LoginService(userService);
const leaveService = new LeaveService(userService, managementService, leaveRepository);

const loginController = new LoginController(loginService);
const userController = new UserController(managementService, userService);
const leaveController = new LeaveController(leaveService);
const managementController = new ManagementController(managementService, userService);

export const RouteContainer = {
    LoginRouter: new LoginRouter(loginController),
    UserRouter: new UserRouter(userController, authorisation),
    LeaveRouter: new LeaveRouter(leaveController),
    ManagementRouter: new ManagementRouter(managementController, authorisation),
};