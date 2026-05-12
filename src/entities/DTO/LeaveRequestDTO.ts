import { DateValidation } from "../../utilities/DateValidation";
import { StatusEnum } from "../../utilities/enums/StatusEnum";
import { LeaveRequest } from "../LeaveRequest";

export class LeaveRequestDTO {
    id!: number;
    employee_id!: number;
    start_date!: string;
    end_date!: string;
    status!: string;
    comment!: string;

    static init(entity: LeaveRequest): LeaveRequestDTO {
        const dto = new LeaveRequestDTO();
        dto.id = entity.id;
        dto.employee_id = entity.user_id;
        dto.start_date = DateValidation.format(entity.start_date);
        dto.end_date = DateValidation.format(entity.end_date);
        dto.status = StatusEnum[entity.status_id];
        dto.comment = entity.comment;
        return dto;
    }
}