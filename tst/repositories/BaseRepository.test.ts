import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { BaseRepository } from "../../src/repositories/BaseRepository";
import { AppDataSource } from "../../src/data_source";
import { Repository } from "typeorm";

class TestEntity {
    id!: number;
    name!: string;
}

describe("BaseRepository tests", () => {
    let mockedRepository: jest.Mocked<Repository<TestEntity>>;
    let BaseRepoClass: any;
    let baseRepositoryInstance: any;

    beforeEach(() => {
        mockedRepository = {
            findOneBy: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            find: jest.fn(),
        } as unknown as jest.Mocked<Repository<TestEntity>>;

        jest.spyOn(AppDataSource, "getRepository").mockReturnValue(mockedRepository as any);

        BaseRepoClass = BaseRepository(TestEntity);
        baseRepositoryInstance = new BaseRepoClass();

        jest.clearAllMocks();
    });

    it("getById calls findOneBy", async () => {
        mockedRepository.findOneBy.mockResolvedValue({ id: 1, name: "A" } as TestEntity);

        const result = await baseRepositoryInstance.getById(1);

        expect(mockedRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
        expect(result).toEqual({ id: 1, name: "A" });
    });

    it("create saves entity", async () => {
        const testEntity = { id: 1, name: "New" } as TestEntity;
        mockedRepository.save.mockResolvedValue(testEntity);

        const result = await baseRepositoryInstance.create(testEntity);

        expect(mockedRepository.save).toHaveBeenCalledWith(testEntity);
        expect(result).toEqual(testEntity);
    });

    it("update saves entity", async () => {
        const testEntity = { id: 1, name: "Updated" } as TestEntity;
        mockedRepository.save.mockResolvedValue(testEntity);

        const result = await baseRepositoryInstance.update(testEntity);

        expect(mockedRepository.save).toHaveBeenCalledWith(testEntity);
        expect(result).toEqual(testEntity);
    });

    it("delete removes entity by id", async () => {
        mockedRepository.delete.mockResolvedValue({} as any);

        await baseRepositoryInstance.delete(5);

        expect(mockedRepository.delete).toHaveBeenCalledWith({ id: 5 });
    });

    it("getAll returns all entities", async () => {
        const testEntityList: TestEntity[] = [
            { id: 1, name: "A" },
            { id: 2, name: "B" },
        ];

        mockedRepository.find.mockResolvedValue(testEntityList);

        const result = await baseRepositoryInstance.getAll();

        expect(mockedRepository.find).toHaveBeenCalled();
        expect(result).toEqual(testEntityList);
    });
});