import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { LeaveService } from "../../src/services/LeaveService";
import { StatusEnum } from "../../src/utilities/enums/StatusEnum";
import { LeaveRequest } from "../../src/entities/LeaveRequest";
import { LeaveRequestDTO } from "../../src/entities/DTO/LeaveRequestDTO";
import { LeaveBalanceDTO } from "../../src/entities/DTO/LeaveBalanceDTO";
import { DateValidation } from "../../src/utilities/DateValidation";
import { AuthedDTOToken } from "../../src/entities/DTO/AuthedDTOToken";
import { AppError } from "../../src/utilities/AppError";
import { TypeEnum } from "../../src/utilities/enums/TypeEnum";

describe("LeaveService tests", () => {
    let service: LeaveService;
    let userService: any;
    let managementService: any;
    let repository: any;

    const testToken: AuthedDTOToken = {
        employee_id: 1,
        first_name: "Test",
        last_name: "User",
        email: "test@test.com",
        role: { id: 1, name: "Admin" }
    };

    const start = new Date(Date.now() + 86400000);
    const end = new Date(Date.now() + 2 * 86400000);

    beforeEach(() => {
        userService = {
            getById: jest.fn(),
            update: jest.fn(),
        };

        managementService = {
            isManagedEmployee: jest.fn(),
            getManagedEmployees: jest.fn(),
        };

        repository = {
            getById: jest.fn(),
            getAllByUserId: jest.fn(),
            getAllByUserAndDates: jest.fn(),
            getOverlap: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        };

        service = new LeaveService(userService, managementService, repository);

        jest.spyOn(DateValidation, "dayDifference").mockImplementation(() => 1);
        jest.spyOn(DateValidation, "isInPast").mockImplementation(() => false);
        jest.spyOn(DateValidation, "getFinancialYearRange").mockReturnValue({ start: new Date("2024-01-01"), end: new Date("2024-12-31") });
    });

    it("getById returns record", async () => {
        const leave = new LeaveRequest();
        repository.getById.mockResolvedValue(leave);

        const result = await service.getById(1);
        expect(result).toBe(leave);
    });

    it("getById throws when not found", async () => {
        repository.getById.mockResolvedValue(null);

        await expect(service.getById(99)).rejects.toThrow(AppError);
    });

    it("getByUser returns mapped DTOs", async () => {
        const leave = new LeaveRequest();
        leave.id = 1;
        leave.start_date = new Date("2024-01-10");
        leave.end_date = new Date("2024-01-12");
        leave.raised_date = new Date();

        userService.getById.mockResolvedValue({ id: 5 });
        repository.getAllByUserId.mockResolvedValue([leave]);

        const result = await service.getByUser(5, 5);

        expect(result?.length).toBe(1);
        expect(result?.[0]).toBeInstanceOf(LeaveRequestDTO);
    });

    it("getByUser returns null when no records", async () => {
        userService.getById.mockResolvedValue({ id: 5 });
        repository.getAllByUserId.mockResolvedValue([]);

        const result = await service.getByUser(5, 5);
        expect(result).toBeNull();
    });

    it("getByUser checks managed employee when viewer != employee", async () => {
        userService.getById.mockResolvedValue({ id: 10 });
        repository.getAllByUserId.mockResolvedValue([]);

        await service.getByUser(1, 10);

        expect(managementService.isManagedEmployee).toHaveBeenCalledWith(1, 10);
    });

    it("getManaged returns all requests for managed employees", async () => {
        managementService.getManagedEmployees.mockResolvedValue([{ id: 10 }]);
        jest.spyOn(service, "getByUser").mockResolvedValue([{ id: 1 } as any]);

        const result = await service.getManaged(testToken);

        expect(result.length).toBe(1);
    });

    it("getManaged throws when no managed employees", async () => {
        managementService.getManagedEmployees.mockResolvedValue([]);

        await expect(service.getManaged(testToken)).rejects.toThrow(AppError);
    });

    it("getBalance calculates leave correctly", async () => {
        userService.getById.mockResolvedValue({ id: 10, leave_balance: 20 });

        repository.getAllByUserAndDates.mockResolvedValue([
            { status_id: StatusEnum.Approved, start_date: new Date(), end_date: new Date() },
            { status_id: StatusEnum.Pending, start_date: new Date(), end_date: new Date() },
        ]);

        const result = await service.getBalance(10, 10);

        expect(result).toBeInstanceOf(LeaveBalanceDTO);
        expect(result.used_leave).toBe(1);
        expect(result.pending_leave).toBe(1);
    });

    it("getBalance throws when no records", async () => {
        userService.getById.mockResolvedValue({ id: 10 });
        repository.getAllByUserAndDates.mockResolvedValue([]);

        await expect(service.getBalance(10, 10)).rejects.toThrow(AppError);
    });

    it("create throws when dates overlap", async () => {
        repository.getOverlap.mockResolvedValue(new LeaveRequest());
        await expect(
            service.create(start, end, 1)
        ).rejects.toThrow(AppError);
    });

    it("create throws when leave exceeds balance", async () => {

        repository.getOverlap.mockResolvedValue(null);
        userService.getById.mockResolvedValue({ leave_balance: 0 });

        await expect(
            service.create(start, end, 1)
        ).rejects.toThrow("Days requested exceed remaining balance");
    });


    it("create succeeds", async () => {
        repository.getOverlap.mockResolvedValue(null);
        userService.getById.mockResolvedValue({ leave_balance: 10 });

        repository.create.mockResolvedValue({
            id: 1,
            user_id: 1,
            type_id: TypeEnum.AnnualLeave,
            status_id: StatusEnum.Pending,
            raised_date: new Date(),
            start_date: start,
            end_date: end,
            comment: null,
            reviewed_by: 1,
            reviewed_date: new Date()
        });

        const result = await service.create(start, end, 1);

        expect(result).toBeInstanceOf(LeaveRequestDTO);
    });


    it("update throws when request not found", async () => {
        repository.getById.mockResolvedValue(null);

        await expect(
            service.update(testToken, 99, null, StatusEnum.Approved)
        ).rejects.toThrow(AppError);
    });

    it("update prevents self-approval", async () => {
        repository.getById.mockResolvedValue({
            user_id: 1,
            status_id: StatusEnum.Pending,
            start_date: new Date(),
            end_date: new Date(),
        });

        userService.getById.mockResolvedValue({ id: 1 });

        await expect(
            service.update(testToken, 1, null, StatusEnum.Approved)
        ).rejects.toThrow("You cannot approve or reject your own leave request");
    });

    it("update approves request", async () => {
        repository.getById.mockResolvedValue({
            user_id: 10,
            status_id: StatusEnum.Pending,
            start_date: new Date(),
            end_date: new Date(),
            raised_date: new Date()
        });

        userService.getById.mockResolvedValue({ id: 10, leave_balance: 10 });
        repository.update.mockResolvedValue(undefined);

        const result = await service.update(
            testToken,
            1,
            null,
            StatusEnum.Approved
        );

        expect(result).toBeInstanceOf(LeaveRequestDTO);
    });

    it("getOverlap throws when overlap exists", async () => {
        repository.getOverlap.mockResolvedValue(new LeaveRequest());

        await expect(service.getOverlap(new LeaveRequest())).rejects.toThrow(AppError);
    });

    it("getOverlap passes when no overlap", async () => {
        repository.getOverlap.mockResolvedValue(null);

        await expect(service.getOverlap(new LeaveRequest())).resolves.not.toThrow();
    });

    it("getPending filters pending requests", async () => {
        jest.spyOn(service, "getManaged").mockResolvedValue([
            { status: "Pending" },
            { status: "Approved" },
        ] as any);

        const result = await service.getPending(testToken);

        expect(result.length).toBe(1);
    });
});
