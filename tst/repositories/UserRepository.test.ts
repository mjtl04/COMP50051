import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { IUserRepository } from '../../src/interfaces/repositories/IUserRepository';
import { User } from '../../src/entities/User';
import { Role } from '../../src/entities/Role';
import { Department } from '../../src/entities/Department';
import { instanceToPlain } from 'class-transformer';

describe('UserRepository tests (mocked instance)', () => {
    let user: User;
    let mockRepository: jest.Mocked<IUserRepository>;

    beforeEach(() => {
        user = new User();
        user.id = 1;
        user.first_name = "test";
        user.last_name = "user";
        user.password = 'a'.repeat(10);
        user.email = 'testuser@email.com';
        user.role = new Role();
        user.department = new Department();

        mockRepository = {
            create: jest.fn(),
            delete: jest.fn(),
            getByEmail: jest.fn(),
            getById: jest.fn(),
        } as unknown as jest.Mocked<IUserRepository>;

        jest.clearAllMocks();
    });

    it('Get User by email', async () => {
        mockRepository.getByEmail.mockResolvedValue(user);

        const result = await mockRepository.getByEmail("testuser@email.com");

        expect(result?.email).toBe("testuser@email.com");
    });

    it('returns null when user is not found', async () => {
        mockRepository.getByEmail.mockResolvedValue(null);

        const result = await mockRepository.getByEmail("nonexistingg@email.com");

        expect(result).toBeNull();
    });

    it('throws when repository throws', async () => {
        mockRepository.getByEmail.mockRejectedValue(new Error("database error"));

        await expect(mockRepository.getByEmail("test@test.com")).rejects.toThrow("database error");
    });

    it('returns a User instance', async () => {
        mockRepository.getByEmail.mockResolvedValue(user);

        const result = await mockRepository.getByEmail("test@test.com");

        expect(result).toBeInstanceOf(User);
    });

    it('returned user excludes password property', async () => {
        mockRepository.getByEmail.mockResolvedValue(user);

        const result = instanceToPlain(await mockRepository.getByEmail("test@test.com") as any);

        expect(result?.password).toBe(undefined);
    });
});