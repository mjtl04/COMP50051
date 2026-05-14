import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { LeaveRepository } from "../../src/repositories/LeaveRepository";
import { LeaveRequest } from "../../src/entities/LeaveRequest";
import { LessThanOrEqual, MoreThanOrEqual } from "typeorm";

describe("LeaveRepository tests", () => {
    let repo: LeaveRepository;
    let mockRepository: any;
    let leave: LeaveRequest;

    beforeEach(() => {
        mockRepository = {
            findOne: jest.fn(),
            find: jest.fn(),
        };

        repo = Object.create(LeaveRepository.prototype);
        (repo as any).repository = mockRepository;

        leave = new LeaveRequest();
        leave.id = 1;
        leave.user_id = 10;
        leave.type_id = 2;
        leave.start_date = new Date("2024-01-10");
        leave.end_date = new Date("2024-01-12");
    });

    it("getByUserAndId returns matching leave request", async () => {
        mockRepository.findOne.mockResolvedValue(leave);

        const result = await repo.getByUserAndId(10, 1);

        expect(mockRepository.findOne).toHaveBeenCalledWith({
            where: { user_id: 10, id: 1 },
        });
        expect(result).toBe(leave);
    });

    it("getByUserAndId returns null when not found", async () => {
        mockRepository.findOne.mockResolvedValue(null);

        const result = await repo.getByUserAndId(10, 999);

        expect(result).toBeNull();
    });

    it("getAllByUserAndDates returns matching leave requests", async () => {
        const start = new Date("2024-01-01");
        const end = new Date("2024-01-31");

        mockRepository.find.mockResolvedValue([leave]);

        const result = await repo.getAllByUserAndDates(10, start, end);

        expect(mockRepository.find).toHaveBeenCalledWith({
            where: {
                user_id: 10,
                start_date: MoreThanOrEqual(start),
                end_date: LessThanOrEqual(end),
            },
        });

        expect(result).toEqual([leave]);
    });

    it("getAllByUserAndDates returns empty array when none found", async () => {
        mockRepository.find.mockResolvedValue([]);

        const result = await repo.getAllByUserAndDates(
            10,
            new Date("2024-01-01"),
            new Date("2024-01-31")
        );

        expect(result).toEqual([]);
    });

    it("getAllByUserId returns all leave requests for user", async () => {
        mockRepository.find.mockResolvedValue([leave]);

        const result = await repo.getAllByUserId(10);

        expect(mockRepository.find).toHaveBeenCalledWith({
            where: { user_id: 10 },
        });

        expect(result).toEqual([leave]);
    });

    it("getAllByUserId returns empty array when none found", async () => {
        mockRepository.find.mockResolvedValue([]);

        const result = await repo.getAllByUserId(10);

        expect(result).toEqual([]);
    });

    it("getOverlap returns overlapping leave request", async () => {
        mockRepository.findOne.mockResolvedValue(leave);

        const result = await repo.getOverlap(leave);

        expect(mockRepository.findOne).toHaveBeenCalledWith({
            where: {
                user_id: leave.user_id,
                start_date: LessThanOrEqual(leave.end_date),
                end_date: MoreThanOrEqual(leave.start_date),
            },
        });

        expect(result).toBe(leave);
    });

    it("getOverlap returns null when no overlap exists", async () => {
        mockRepository.findOne.mockResolvedValue(null);

        const result = await repo.getOverlap(leave);

        expect(result).toBeNull();
    });

    it("throws when repository throws", async () => {
        mockRepository.findOne.mockRejectedValue(new Error("database error"));

        await expect(repo.getByUserAndId(10, 1)).rejects.toThrow("database error");
    });
});
