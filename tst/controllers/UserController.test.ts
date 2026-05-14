import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { UserController } from "../../src/controllers/UserController";
import { StatusCodes } from "http-status-codes";
import { ResponseHandler } from "../../src/utilities/ResponseHandler";
import { Validation } from "../../src/utilities/Validation";

describe("UserController tests", () => {
    let controller: UserController;
    let managementService: any;
    let userService: any;
    let req: any;
    let res: any;

    const mockSuccess = ((res: any) => res) as any;
    const mockError = ((res: any) => res) as any;

    beforeEach(() => {
        managementService = {
            getManagedEmployees: jest.fn(),
        };

        userService = {
            getById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        controller = new UserController(
            managementService,
            userService,
        );

        req = {
            params: {},
            body: {},
            authedUser: { employee_id: 1 },
        };

        res = {};

        jest.spyOn(ResponseHandler, "sendSuccessResponse").mockImplementation(mockSuccess);
        jest.spyOn(ResponseHandler, "sendErrorResponse").mockImplementation(mockError);

    });

    it("should return managed employees", async () => {
        const testUser = [{ id: 1, name: "John" }];
        managementService.getManagedEmployees.mockResolvedValue(testUser);

        await controller.getAll(req, res);

        expect(managementService.getManagedEmployees).toHaveBeenCalledWith(1);
        expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
            res,
            testUser,
            StatusCodes.OK
        );
    });

    it("should return user by id", async () => {
        req.params.id = "5";
        jest.spyOn(Validation, "paramId").mockReturnValue(5);


        const testUser = { id: 5, name: "Alice" };
        userService.getById.mockResolvedValue(testUser);

        await controller.getById(req, res);

        expect(Validation.paramId).toHaveBeenCalledWith("5");
        expect(userService.getById).toHaveBeenCalledWith(5);
        expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
            res,
            testUser,
            StatusCodes.OK
        );
    });

    it("should create a user", async () => {
        req.body = {
            email: "test@test.com",
            password: "123456",
            first_name: "John",
            last_name: "Doe",
            role_id: 2,
            department_id: 3,
        };

        const createdUser = { id: 10, ...req.body };
        userService.create.mockResolvedValue(createdUser);

        await controller.create(req, res);

        expect(userService.create).toHaveBeenCalled();
        expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
            res,
            createdUser,
            StatusCodes.CREATED
        );
    });

    it("should return error if required fields missing", async () => {
        req.body = { email: "missing fields" };

        await controller.create(req, res);

        expect(ResponseHandler.sendErrorResponse).toHaveBeenCalled();
    });

    it("should update a user", async () => {
        req.params.id = "7";
        jest.spyOn(Validation, "paramId").mockReturnValue(7);

        req.body = {
            role_id: 2,
            department_id: 3,
            leave_balance: 10,
        };

        const updatedUser = { id: 7, ...req.body };
        userService.update.mockResolvedValue(updatedUser);

        await controller.update(req, res);

        expect(userService.update).toHaveBeenCalledWith({
            id: 7,
            role_id: 2,
            department_id: 3,
            leave_balance: 10,
        });

        expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
            res,
            updatedUser,
            StatusCodes.OK
        );
    });

    it("should delete a user", async () => {
        req.params.id = "9";
        jest.spyOn(Validation, "paramId").mockReturnValue(9);

        userService.getById.mockResolvedValue({ id: 9 });
        userService.delete.mockResolvedValue(undefined);

        await controller.delete(req, res);

        expect(userService.delete).toHaveBeenCalledWith(9);
        expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
            res,
            { message: "User with Id: 9 deleted" },
            StatusCodes.OK
        );
    });
});
