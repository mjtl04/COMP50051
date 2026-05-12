export class LeaveBalanceDTO {
    user_id!: number;
    total_year_leave!: number;
    used_leave!: number;
    pending_leave!: number;
    available_leave!: number;
    remaining_after_pending!: number;

    static init(data: {
        user_id: number;
        total_year_leave: number;
        used_leave: number;
        pending_leave: number;
        available_leave: number;
        remaining_after_pending: number;
    }): LeaveBalanceDTO {
        const dto = new LeaveBalanceDTO();
        Object.assign(dto, data);
        return dto;
    }
}
