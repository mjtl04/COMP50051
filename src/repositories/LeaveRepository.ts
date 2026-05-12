import { LeaveRequest } from "../entities/LeaveRequest";
import { LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { BaseRepository } from "./BaseRepository";

export class LeaveRepository extends BaseRepository(LeaveRequest) {

    static getByUserAndId = async (user_id: number, leave_id: number): Promise<LeaveRequest | null> => {
        return await this.repository.findOne({
            where: {
                user_id: user_id,
                id: leave_id
            }
        });
    }

    static getAllByUserAndDates = async (user_id: number, start: Date, end: Date): Promise<LeaveRequest[] | null> => {
        return await this.repository.find({
            where: {
                user_id: user_id,
                start_date: MoreThanOrEqual(start),
                end_date: LessThanOrEqual(end)
            }
        });
    }

    static getAllByUserId = async (user_id: number): Promise<LeaveRequest[] | null> => {
        return await this.repository.find({ where: { user_id: user_id } });
    }

    static getOverlap = async (leave_request: LeaveRequest): Promise<LeaveRequest | null> => {
        return await this.repository.findOne({
            where: {
                user_id: leave_request.user_id,
                start_date: LessThanOrEqual(leave_request.end_date),
                end_date: MoreThanOrEqual(leave_request.start_date)
            }
        });
    }

}