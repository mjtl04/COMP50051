import { LeaveRequest } from "../../entities/LeaveRequest";
import { IBaseRepository } from "./IBaseRepository";

export interface ILeaveRepository extends IBaseRepository<LeaveRequest> {
    getByUserAndId(user_id: number, leave_id: number): Promise<LeaveRequest | null>;
    getAllByUserAndDates(user_id: number, start: Date, end: Date): Promise<LeaveRequest[] | null>;
    getAllByUserId(user_id: number): Promise<LeaveRequest[] | null>;
    getOverlap(leave_request: LeaveRequest): Promise<LeaveRequest | null>;
}