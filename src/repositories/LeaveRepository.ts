import { LeaveRequest } from "../entities/LeaveRequest";
import { LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { BaseRepository } from "./BaseRepository";
import { ILeaveRepository } from "../interfaces/repositories/ILeaveRepository";

export class LeaveRepository extends BaseRepository(LeaveRequest) implements ILeaveRepository {
    public async getByUserAndId(user_id: number, leave_id: number): Promise<LeaveRequest | null> {
        return await this.repository.findOne({
            where: { user_id, id: leave_id }
        });
    }

    public async getAllByUserAndDates(user_id: number, start: Date, end: Date): Promise<LeaveRequest[] | null> {
        return await this.repository.find({
            where: {
                user_id,
                start_date: MoreThanOrEqual(start),
                end_date: LessThanOrEqual(end)
            }
        });
    }

    public async getAllByUserId(user_id: number): Promise<LeaveRequest[] | null> {
        return await this.repository.find({ where: { user_id } });
    }

    public async getOverlap(leave_request: LeaveRequest): Promise<LeaveRequest | null> {
        return await this.repository.findOne({
            where: {
                user_id: leave_request.user_id,
                start_date: LessThanOrEqual(leave_request.end_date),
                end_date: MoreThanOrEqual(leave_request.start_date)
            }
        });
    }
}