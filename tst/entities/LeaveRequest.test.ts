import { describe, it, expect, beforeEach } from "@jest/globals";
import { validate } from "class-validator";
import { LeaveRequest } from "../../src/entities/LeaveRequest";
import { User } from "../../src/entities/User";
import { LeaveType } from "../../src/entities/LeaveType";
import { LeaveStatus } from "../../src/entities/LeaveStatus";

describe("LeaveRequest entity tests", () => {
    let request: LeaveRequest;
    let user: User;
    let reviewer: User;
    let leaveType: LeaveType;
    let leaveStatus: LeaveStatus;

    beforeEach(() => {
        user = new User();
        user.id = 1;

        reviewer = new User();
        reviewer.id = 2;

        leaveType = new LeaveType();
        leaveType.id = 1;

        leaveStatus = new LeaveStatus();
        leaveStatus.id = 1;

        request = new LeaveRequest();
        request.id = 1;
        request.user_id = 1;
        request.type_id = 1;
        request.status_id = 1;
        request.start_date = new Date("2024-01-10");
        request.end_date = new Date("2024-01-12");
        request.comment = "Annual leave";
        request.reviewed_by = 2;
        request.reviewed_date = new Date("2024-01-05");

        request.user = user;
        request.reviewer = reviewer;
        request.leaveType = leaveType;
        request.leaveStatus = leaveStatus;
    });

    it("A missing user_id is invalid", async () => {
        request.user_id = undefined as any;
        const errors = await validate(request);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty("isNotEmpty");
    });

    it("A missing type_id is invalid", async () => {
        request.type_id = undefined as any;
        const errors = await validate(request);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty("isNotEmpty");
    });

    it("A missing start_date is invalid", async () => {
        request.start_date = undefined as any;
        const errors = await validate(request);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty("isNotEmpty");
    });

    it("A missing end_date is invalid", async () => {
        request.end_date = undefined as any;
        const errors = await validate(request);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty("isNotEmpty");
    });

    it("A non-integer type_id is invalid", async () => {
        request.type_id = "abc" as any;
        const errors = await validate(request);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty("isInt");
    });

    it("A non-integer status_id is invalid", async () => {
        request.status_id = "not-int" as any;
        const errors = await validate(request);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty("isInt");
    });

    it("A missing user relation is invalid", async () => {
        request.user = null as any;
        const errors = await validate(request);
        expect(errors.length).toBeGreaterThan(0);
    });

    it("A missing reviewer relation is invalid", async () => {
        request.reviewer = null as any;
        const errors = await validate(request);
        expect(errors.length).toBeGreaterThan(0);
    });

    it("A missing leaveType relation is invalid", async () => {
        request.leaveType = null as any;
        const errors = await validate(request);
        expect(errors.length).toBeGreaterThan(0);
    });

    it("A missing leaveStatus relation is invalid", async () => {
        request.leaveStatus = null as any;
        const errors = await validate(request);
        expect(errors.length).toBeGreaterThan(0);
    });

    it("setRaisedDate() sets raised_date before insert", () => {
        const before = new Date();
        request.setRaisedDate();
        expect(request.raised_date).toBeInstanceOf(Date);
        expect(request.raised_date.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });


    it("A valid LeaveRequest passes validation", async () => {
        const errors = await validate(request);
        expect(errors.length).toBe(0);
    });
});
