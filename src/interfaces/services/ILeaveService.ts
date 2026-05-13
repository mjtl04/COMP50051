import { AuthedDTOToken } from "../../entities/DTO/AuthedDTOToken";
import { LeaveRequest } from "../../entities/LeaveRequest";
import { LeaveRequestDTO } from "../../entities/DTO/LeaveRequestDTO";
import { LeaveBalanceDTO } from "../../entities/DTO/LeaveBalanceDTO";

export interface ILeaveService {
    getById(id: number): Promise<LeaveRequest>;

    getByUser(viewer: number, passed_employee: number): Promise<LeaveRequestDTO[] | null>;

    getManaged(token: AuthedDTOToken): Promise<LeaveRequestDTO[]>;

    getBalance(viewer: number, passed_employee: number): Promise<LeaveBalanceDTO>;

    create(start_date: Date, end_date: Date, user_id: number): Promise<LeaveRequestDTO>;

    getOverlap(leave: LeaveRequest): Promise<void>;

    getPending(token: AuthedDTOToken): Promise<LeaveRequestDTO[]>;

    update(
        token: AuthedDTOToken,
        request_id: number,
        reason: string | null,
        status: number
    ): Promise<LeaveRequestDTO>;

}