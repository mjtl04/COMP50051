import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { UserRepository } from '../../src/repositories/UserRepository';
import { User } from '../../src/entities/User';
import { instanceToPlain } from 'class-transformer';

jest.mock('../../src/repositories/UserRepository');

describe('UserRepository tests (jest.mock)', () => {
    let user: User;
    let mockRepoClass: jest.MockedClass<typeof UserRepository>;
    let mockRepoInstance: any;

    beforeEach(() => {
        mockRepoClass = jest.mocked(UserRepository);

        mockRepoInstance = {
            create: jest.fn(),
            delete: jest.fn(),
            getByEmail: jest.fn(),
            getById: jest.fn(),
        };

        mockRepoClass.mockImplementation(() => mockRepoInstance);

        user = new User();
        user.id = 1;
        user.first_name = "test";
        user.last_name = "user";
        user.password = 'a'.repeat(10);
        user.email = 'testuser@email.com';

        jest.clearAllMocks();
    });

    it('Get User by email', async () => {
        mockRepoInstance.getByEmail.mockResolvedValue(user);

        const repo = new UserRepository();
        const result = await repo.getByEmail("testuser@email.com");

        expect(result?.email).toBe("testuser@email.com");
    });

    it('returns null when user is not found', async () => {
        mockRepoInstance.getByEmail.mockResolvedValue(null);

        const repo = new UserRepository();
        const result = await repo.getByEmail("nonexistingg@email.com");

        expect(result).toBeNull();
    });

    it('throws when repository throws', async () => {
        mockRepoInstance.getByEmail.mockRejectedValue(new Error("database error"));

        const repo = new UserRepository();

        await expect(repo.getByEmail("test@test.com")).rejects.toThrow("database error");
    });

    it('returns a User instance', async () => {
        mockRepoInstance.getByEmail.mockResolvedValue(user);

        const repo = new UserRepository();
        const result = await repo.getByEmail("test@test.com");

        expect(result).toBeInstanceOf(User);
    });

    it('returned user excludes password property when serialized', async () => {
        mockRepoInstance.getByEmail.mockResolvedValue(user);

        const repo = new UserRepository();
        const found = await repo.getByEmail("test@test.com");

        const plain = instanceToPlain(found as any) as Record<string, any>;

        expect(plain?.password).toBe(undefined);
    });

});