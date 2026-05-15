import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { AppError } from "../../src/utilities/AppError";
import { UserService } from "../../src/services/UserService";
import { User } from "../../src/entities/User";
import { UserDTO } from "../../src/entities/DTO/UserDTO";
import { Validation } from "../../src/utilities/Validation";
import { plainToInstance } from "class-transformer";

jest.mock("class-transformer", () => {
    const actual = jest.requireActual("class-transformer") as any;
    return { ...actual, plainToInstance: jest.fn() };
});

describe("UserService tests", () => {
    let service: UserService;
    let repository: any;
    let roleService: any;
    let departmentService: any;

    beforeEach(() => {
        repository = {
            getByEmail: jest.fn(),
            getById: jest.fn(),
            getAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        roleService = { getById: jest.fn() };
        departmentService = { getById: jest.fn() };

        service = new UserService(repository, roleService, departmentService);

        jest.spyOn(Validation, "formatName").mockImplementation((x) => x);
        jest.spyOn(Validation, "email").mockImplementation((x) => x);
        jest.spyOn(Validation, "classValidate").mockImplementation(async () => { });
    });

    it("login returns user", async () => {
        const user = new User();
        repository.getByEmail.mockResolvedValue(user);

        const result = await service.login("test@test.com");
        expect(result).toBe(user);
    });

    it("login throws when user not found", async () => {
        repository.getByEmail.mockResolvedValue(null);

        await expect(service.login("missing@test.com")).rejects.toThrow(AppError);
    });

    it("getByEmail returns DTO", async () => {
        const user = new User();
        repository.getByEmail.mockResolvedValue(user);

        const result = await service.getByEmail("test@test.com");

        expect(result).toBeInstanceOf(UserDTO);
    });

    it("getByEmail throws when not found", async () => {
        repository.getByEmail.mockResolvedValue(null);

        await expect(service.getByEmail("missing@test.com")).rejects.toThrow(AppError);
    });

    it("getAll returns mapped DTOs", async () => {
        repository.getAll.mockResolvedValue([new User()]);

        const result = await service.getAll();

        expect(result.length).toBe(1);
        expect(result[0]).toBeInstanceOf(UserDTO);
    });

    it("getAll throws when no users", async () => {
        repository.getAll.mockResolvedValue(null);

        await expect(service.getAll()).rejects.toThrow(AppError);
    });

    it("getById returns DTO", async () => {
        repository.getById.mockResolvedValue(new User());

        const result = await service.getById(1);

        expect(result).toBeInstanceOf(UserDTO);
    });

    it("getById throws when not found", async () => {
        repository.getById.mockResolvedValue(null);

        await expect(service.getById(99)).rejects.toThrow(AppError);
    });

    it("update throws when user not found", async () => {
        repository.getById.mockResolvedValue(null);

        await expect(
            service.update({ id: 1 } as any)
        ).rejects.toThrow(AppError);
    });

    it("update throws when leave balance < 0", async () => {
        repository.getById.mockResolvedValue(new User());
        departmentService.getById.mockResolvedValue({});
        roleService.getById.mockResolvedValue({});

        await expect(
            service.update({ id: 1, department_id: 1, role_id: 1, leave_balance: -5 } as any)
        ).rejects.toThrow(UserService.ERROR_MIN_LEAVE_BALANCE);
    });

    it("update succeeds", async () => {
        const user = new User();
        repository.getById.mockResolvedValue(user);
        departmentService.getById.mockResolvedValue({});
        roleService.getById.mockResolvedValue({});
        repository.update.mockResolvedValue(user);

        const dto = { id: 1, department_id: 2, role_id: 3, leave_balance: 10 } as any;

        const result = await service.update(dto);

        expect(repository.update).toHaveBeenCalled();
        expect(result).toBeInstanceOf(UserDTO);
    });

    it("create formats and validates user", async () => {
        const body = {
            first_name: "John",
            last_name: "Doe",
            email: "test@test.com",
            department_id: 1,
            role_id: 2,
        };

        const user = new User();
        (plainToInstance as jest.Mock).mockReturnValue(user);

        repository.getByEmail.mockResolvedValue(null);
        departmentService.getById.mockResolvedValue({});
        roleService.getById.mockResolvedValue({});
        repository.create.mockResolvedValue(undefined);

        const token = {
            employee_id: 1,
            first_name: "Test",
            last_name: "User",
            email: "test@test.com",
            role: { id: 1, name: "Admin" },
        };

        const result = await service.create(token, body as any);

        expect(repository.create).toHaveBeenCalled();
        expect(result).toBeInstanceOf(UserDTO);
    });

    it("create throws when email already exists", async () => {
        const body = {
            first_name: "John",
            last_name: "Doe",
            email: "test@test.com",
            department_id: 1,
            role_id: 2,
        };

        const user = new User();
        (plainToInstance as jest.Mock).mockReturnValue(user);

        repository.getByEmail.mockResolvedValue({});

        const token = {
            employee_id: 1,
            first_name: "Test",
            last_name: "User",
            email: "test@test.com",
            role: { id: 1, name: "Admin" },
        };

        await expect(service.create(token, body as any)).rejects.toThrow(AppError);
    });

    it("delete calls repository.delete", async () => {
        await service.delete(5);

        expect(repository.delete).toHaveBeenCalledWith(5);
    });
});
