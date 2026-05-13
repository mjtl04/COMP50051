import { describe, it, expect, beforeEach } from '@jest/globals';
import { UserDTO } from '../../src/entities/DTO/UserDTO';
import { User } from '../../src/entities/User';
import { Role } from '../../src/entities/Role';
import { Department } from '../../src/entities/Department';
import { IValidation } from '../../src/interfaces/IValidation';

describe('UserDTO entity tests', () => {
    let user: User;
    let role: Role;
    let department: Department;
    let userDTO: UserDTO;
    let validation: IValidation;

    beforeEach(() => {
        validation = {
            classValidate: async () => { },
            paramId: (id: string) => Number(id),
            email: (email: string) => email.trim().toLowerCase(),
            password: (password: string) => password,
            reason: (reason: string) => reason.trim(),
            formatName: (name: string) =>
                name.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
        };

        role = new Role();
        role.id = 1;
        role.name = "admin";

        department = new Department();
        department.id = 1;
        department.department = "IT";

        user = new User();
        user.id = 1;
        user.first_name = "John";
        user.last_name = "Doe";
        user.email = "john.doe@example.com";
        user.password = 'a'.repeat(10);
        user.leave_balance = 15;
        user.role = role;
        user.role_id = 1;
        user.department = department;
        user.department_id = 1;
    });

    it('Create a UserDTO from a valid User', () => {
        userDTO = UserDTO.init(user, validation);

        expect(userDTO).toBeDefined();
        expect(userDTO.id).toBe(1);
        expect(userDTO.first_name).toBe('John');
        expect(userDTO.last_name).toBe('Doe');
        expect(userDTO.email).toBe('john.doe@example.com');
        expect(userDTO.leave_balance).toBe(15);
        expect(userDTO.role_id).toBe(1);
        expect(userDTO.department_id).toBe(1);
    });

    it('Format names', () => {
        user.first_name = "john";
        user.last_name = "doe";

        userDTO = UserDTO.init(user, validation);

        expect(userDTO.first_name).toBe('John');
        expect(userDTO.last_name).toBe('Doe');
    });

    it('Handle names with multiple words', () => {
        user.first_name = "jean paul";
        user.last_name = "martin rousseau";

        userDTO = UserDTO.init(user, validation);

        expect(userDTO.first_name).toBeTruthy();
        expect(userDTO.last_name).toBeTruthy();
    });

    it('Format email', () => {
        user.email = "JOHN.DOE@EXAMPLE.COM";

        userDTO = UserDTO.init(user, validation);

        expect(userDTO.email).toBe('john.doe@example.com');
    });

    it('Preserve leave balance', () => {
        user.leave_balance = 20;

        userDTO = UserDTO.init(user, validation);

        expect(userDTO.leave_balance).toBe(20);
    });

    it('Preserve role_id', () => {
        user.role_id = 5;

        userDTO = UserDTO.init(user, validation);

        expect(userDTO.role_id).toBe(5);
    });

    it('Preserve department_id', () => {
        user.department_id = 3;

        userDTO = UserDTO.init(user, validation);

        expect(userDTO.department_id).toBe(3);
    });

    it('Exclude password in DTO', () => {
        userDTO = UserDTO.init(user, validation);

        expect(userDTO).not.toHaveProperty('password');
    });

    it('Map all required fields from User to UserDTO', () => {
        userDTO = UserDTO.init(user, validation);

        expect(userDTO.id).toBeDefined();
        expect(userDTO.first_name).toBeDefined();
        expect(userDTO.last_name).toBeDefined();
        expect(userDTO.email).toBeDefined();
        expect(userDTO.leave_balance).toBeDefined();
        expect(userDTO.role_id).toBeDefined();
        expect(userDTO.department_id).toBeDefined();
    });

    it('Create a new UserDTO instance', () => {
        const dto1 = UserDTO.init(user, validation);
        const dto2 = UserDTO.init(user, validation);

        expect(dto1).not.toBe(dto2);
        expect(dto1).toEqual(dto2);
    });

    it('Handle zero leave balance', () => {
        user.leave_balance = 0;

        userDTO = UserDTO.init(user, validation);

        expect(userDTO.leave_balance).toBe(0);
    });
});