import { StatusCodes } from "http-status-codes";
import { AuthedDTOToken } from "../entities/DTO/AuthedDTOToken";
import { LeaveRequest } from "../entities/LeaveRequest";
import { DateValidation } from "../utilities/DateValidation";
import { LeaveRequestDTO } from "../entities/DTO/LeaveRequestDTO";
import { LeaveBalanceDTO } from "../entities/DTO/LeaveBalanceDTO";
import { TypeEnum } from "../utilities/enums/TypeEnum";
import { RoleEnum } from "../utilities/enums/RoleEnum";
import { IUserService } from "../interfaces/services/IUserService";
import { ILeaveRepository } from "../interfaces/repositories/ILeaveRepository";
import { IManagementService } from "../interfaces/services/IManagementService";
import { StatusEnum } from "../utilities/enums/StatusEnum";
import { AppError } from "../utilities/AppError";

export class LeaveService {

    constructor(
        private userService: IUserService,
        private managementService: IManagementService,
        private repository: ILeaveRepository,
    ) { }

    public static readonly ERROR_NOT_FOUND_ID = (id: number) => `Leave Request not found with id: ${id}`;
    public static readonly ERROR_RECORD_EXISTS = "Date range of request overlaps with existing leave request";
    public static readonly ERROR_NON_EMPLOYEE = "Employee is not managed by you";
    public static readonly ERROR_NO_REQUESTS = (user_id: number) => `Leave Request(s) not found for employee id: ${user_id}`;
    public static readonly ERROR_NO_MANAGED_REQUESTS = `No Leave Request(s) found`;

    public async getById(id: number): Promise<LeaveRequest> {
        const record = await this.repository.getById(id);
        if (!record) {
            throw new AppError(LeaveService.ERROR_NOT_FOUND_ID(id), StatusCodes.NOT_FOUND);
        }
        return record;
    }

    public async getByUser(viewer: number, passed_employee: number): Promise<LeaveRequestDTO[] | null> {

        const employee = await this.userService.getById(passed_employee);

        if (viewer != passed_employee) {
            await this.managementService.isManagedEmployee(viewer, passed_employee)
        }

        const records = await this.repository.getAllByUserId(passed_employee);
        if (!records || records.length === 0) {
            return null;
        }
        return records.map(LeaveRequestDTO.init)
    }

    public async getManaged(token: AuthedDTOToken): Promise<LeaveRequestDTO[]> {

        const managedEmployees = await this.managementService.getManagedEmployees(token.employee_id);

        if (!managedEmployees || managedEmployees.length === 0) {
            throw new AppError(LeaveService.ERROR_NO_MANAGED_REQUESTS, StatusCodes.NOT_FOUND);
        }

        const allRequests: LeaveRequestDTO[] = [];

        for (const employee of managedEmployees) {
            const requests = await this.getByUser(token.employee_id, employee.id);
            if (requests) {
                allRequests.push(...requests);
            }
        }

        return allRequests;
    }

    public async getBalance(viewer: number, passed_employee: number): Promise<LeaveBalanceDTO> {
        const employee = await this.userService.getById(passed_employee);

        if (viewer != passed_employee) {
            await this.managementService.isManagedEmployee(viewer, passed_employee)
        }

        const { start, end } = DateValidation.getFinancialYearRange();
        const records = await this.repository.getAllByUserAndDates(passed_employee, start, end);

        if (!records || records.length === 0) {
            throw new AppError(LeaveService.ERROR_NO_REQUESTS(passed_employee), StatusCodes.NOT_FOUND);
        }

        const used_leave = records
            .filter(r => r.status_id === StatusEnum.Approved)
            .reduce((sum, r) => sum + DateValidation.dayDifference(r.start_date, r.end_date), 0);

        const pending_leave = records
            .filter(r => r.status_id === StatusEnum.Pending)
            .reduce((sum, r) => sum + DateValidation.dayDifference(r.start_date, r.end_date), 0);

        const total_year_leave = employee.leave_balance;
        const available_leave = total_year_leave - used_leave;
        const remaining_after_pending = available_leave - pending_leave;

        return LeaveBalanceDTO.init({
            user_id: passed_employee,
            total_year_leave,
            used_leave,
            pending_leave,
            available_leave,
            remaining_after_pending
        });
    }

    public async create(start_date: Date, end_date: Date, user_id: number): Promise<LeaveRequestDTO> {

        const leave_request = new LeaveRequest();
        leave_request.start_date = new Date(start_date);
        leave_request.end_date = new Date(end_date);
        leave_request.user_id = user_id;
        leave_request.status_id = StatusEnum.Pending;
        leave_request.type_id = TypeEnum.AnnualLeave;

        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

        if (leave_request.start_date > oneYearFromNow || leave_request.end_date > oneYearFromNow) {
            throw new Error(`Cannot raise leave request more than one year in advance`);
        }

        if (leave_request.start_date < new Date() || leave_request.end_date < new Date()) {
            throw new Error(AppError.exceptions.ERROR_PAST_DATE)
        }

        if (leave_request.start_date > leave_request.end_date) {
            throw new Error(`End date of ${leave_request.end_date} is before the start date of ${leave_request.start_date}`)
        }

        await this.getOverlap(leave_request);

        let user = await this.userService.getById(leave_request.user_id);
        let leave_range = DateValidation.dayDifference(leave_request.end_date, leave_request.start_date);

        if (leave_range > user.leave_balance) {
            throw new Error("Days requested exceed remaining balance")
        }

        await this.repository.create(leave_request);

        return LeaveRequestDTO.init(leave_request)

    }

    public async update(token: AuthedDTOToken, request_id: number, reason: string | null, status: number): Promise<LeaveRequestDTO> {

        const leave_request = await this.repository.getById(request_id);
        if (!leave_request) {
            throw new AppError(LeaveService.ERROR_NOT_FOUND_ID(request_id), StatusCodes.NOT_FOUND);
        }

        const employee = await this.userService.getById(leave_request.user_id);

        const isSelf = token.employee_id === employee.id;
        const isAdmin = token.role.id === RoleEnum.Admin;

        if (isSelf) {
            if (status !== StatusEnum.Cancelled) {
                throw new AppError("You cannot approve or reject your own leave request", StatusCodes.FORBIDDEN);
            }
        }
        else if (!isAdmin) {
            if (token.employee_id !== employee.id) {
                await this.managementService.isManagedEmployee(token.employee_id, employee.id);
            }
        }

        if (DateValidation.isInPast(leave_request.start_date) || DateValidation.isInPast(leave_request.end_date)) {
            throw new AppError("Cannot modify a leave request in the past", StatusCodes.CONFLICT);
        }

        if (leave_request.status_id === status) {
            throw new AppError(`Request is already ${StatusEnum[status]}`, StatusCodes.CONFLICT,);
        }

        if (status === StatusEnum.Cancelled) {
            if (leave_request.status_id === StatusEnum.Approved) {
                const days = DateValidation.dayDifference(leave_request.start_date, leave_request.end_date);
                employee.leave_balance += days;
                await this.userService.update(employee);
            }
            if (reason) leave_request.comment = reason;
        }

        if (status === StatusEnum.Rejected) {
            if (reason) leave_request.comment = reason;
        }

        if (status === StatusEnum.Approved) {
            if (leave_request.status_id !== StatusEnum.Pending) {
                throw new AppError("Only pending requests may be approved", StatusCodes.CONFLICT);
            }

            const days = DateValidation.dayDifference(leave_request.start_date, leave_request.end_date);
            employee.leave_balance -= days;
            await this.userService.update(employee);
        }

        leave_request.status_id = status;
        leave_request.reviewed_by = token.employee_id;
        leave_request.reviewed_date = new Date();

        await this.repository.update(leave_request);

        return LeaveRequestDTO.init(leave_request);
    };


    public async getOverlap(leave: LeaveRequest) {
        const record = await this.repository.getOverlap(leave);
        if (record) {
            throw new AppError(LeaveService.ERROR_RECORD_EXISTS, StatusCodes.CONFLICT);
        }
    }

    public async getPending(token: AuthedDTOToken): Promise<LeaveRequestDTO[]> {
        let pending = await this.getManaged(token);
        pending = pending.filter(r => r.status == StatusEnum[StatusEnum.Pending])
        return pending;

    }
}