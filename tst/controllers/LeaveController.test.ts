import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { LeaveController } from "../../src/controllers/LeaveController";
import { StatusCodes } from "http-status-codes";
import { StatusEnum } from "../../src/utilities/enums/StatusEnum";
import { ResponseHandler } from "../../src/utilities/ResponseHandler";
import { Validation } from "../../src/utilities/Validation";

describe("LeaveController tests", () => {
    let controller: LeaveController;
    let leaveService: any;
    let req: any;
    let res: any;

    const mockSuccess = ((res: any) => res) as any;
    const mockError = ((res: any) => res) as any;

    beforeEach(() => {

        jest.clearAllMocks();

        leaveService = {
            getBalance: jest.fn(),
            getByUser: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            getPending: jest.fn(),
        };

        controller = new LeaveController(leaveService);

        req = {
            params: {},
            body: {},
            authedUser: { employee_id: 1 },
        };

        res = {};

        jest.spyOn(ResponseHandler, "sendSuccessResponse").mockImplementation(mockSuccess);
        jest.spyOn(ResponseHandler, "sendErrorResponse").mockImplementation(mockError);
        jest.spyOn(Validation, "reason").mockImplementation(((reason: string) => { }) as any);

    });

    it("should return leave balance", async () => {
        req.params.user_id = "5";
        leaveService.getBalance.mockResolvedValue(20);

        await controller.balance(req, res);

        expect(leaveService.getBalance).toHaveBeenCalledWith(1, 5);
        expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
            res,
            20,
            StatusCodes.OK
        );
    });


    it("should return error for invalid employee ID in balance", async () => {
        req.params.user_id = "abc";
        await expect(controller.balance(req, res)).rejects.toThrow("Invalid Employee ID");
    });

    it("should return leave requests", async () => {
        req.params.user_id = "5";
        const testRequests = [{ id: 1 }];

        leaveService.getByUser.mockResolvedValue(testRequests);

        await controller.get(req, res);

        expect(leaveService.getByUser).toHaveBeenCalledWith(1, 5);
        expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
            res,
            testRequests,
            StatusCodes.OK
        );
    });


    it("should return error for invalid employee ID in get", async () => {
        req.params.user_id = "invalid";
        await expect(controller.get(req, res)).rejects.toThrow("Invalid Employee ID");
    });

    it("should create a leave request", async () => {
        req.body = {
            start_date: "2024-01-10",
            end_date: "2024-01-12",
        };

        const dto = { id: 1 };
        leaveService.create.mockResolvedValue(dto);

        await controller.create(req, res);

        expect(leaveService.create).toHaveBeenCalled();
        expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
            res,
            { message: "Leave Request has been submitted for review", data: dto },
            StatusCodes.CREATED
        );
    });

    it("should return error if required fields missing in create", async () => {
        req.body = { start_date: "2024-01-10" };
        await expect(controller.create(req, res)).rejects.toThrow("end_date field is required");
    });

    it("should cancel a leave request", async () => {
        req.body = {
            leave_request_id: "7",
            reason: "No longer needed",
        };

        const dto = { id: 7, comment: "No longer needed" };
        leaveService.update.mockResolvedValue(dto);

        await controller.cancel(req, res);

        expect(Validation.reason).toHaveBeenCalledWith("No longer needed");
        expect(leaveService.update).toHaveBeenCalledWith(
            req.authedUser,
            7,
            "No longer needed",
            StatusEnum.Cancelled
        );

        expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
            res,
            {
                message: `Leave Request with id: ${dto.id} has been Cancelled`,
                reason: dto.comment,
                data: dto,
            },
            StatusCodes.OK
        );
    });

    it("should return error if required fields missing in cancel", async () => {
        req.body = { reason: "Missing ID" };
        await expect(controller.cancel(req, res)).rejects.toThrow("leave_request_id field is required");
    });

    it("should approve a leave request", async () => {
        req.params.leave_id = "10";

        leaveService.update.mockResolvedValue({});

        await controller.approve(req, res);

        expect(leaveService.update).toHaveBeenCalledWith(
            req.authedUser,
            10,
            null,
            StatusEnum.Approved
        );

        expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
            res,
            { message: "Leave Request with id: 10 has been Approved" },
            StatusCodes.OK
        );
    });

    it("should return error for invalid leave ID in approve", async () => {
        req.params.leave_id = "invalid";
        await expect(controller.approve(req, res)).rejects.toThrow("Invalid Employee ID");
    });

    it("should reject a leave request", async () => {
        req.body = {
            leave_request_id: "8",
            reason: "Insufficient staffing",
        };

        await controller.reject(req, res);

        expect(Validation.reason).toHaveBeenCalledWith("Insufficient staffing");
        expect(leaveService.update).toHaveBeenCalledWith(
            req.authedUser,
            8,
            "Insufficient staffing",
            StatusEnum.Rejected
        );

        expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
            res,
            { message: "Leave Request with id: 8 has been Rejected" },
            StatusCodes.OK
        );
    });

    it("should return error if required fields missing in reject", async () => {
        req.body = { reason: "Missing ID" };
        await expect(controller.reject(req, res)).rejects.toThrow("leave_request_id field is required");
    });

    it("should return pending leave requests", async () => {
        const pending = [{ id: 1 }];
        leaveService.getPending.mockResolvedValue(pending);

        await controller.pending(req, res);

        expect(leaveService.getPending).toHaveBeenCalledWith(req.authedUser);
        expect(ResponseHandler.sendSuccessResponse).toHaveBeenCalledWith(
            res,
            pending,
            StatusCodes.OK
        );
    });
});
