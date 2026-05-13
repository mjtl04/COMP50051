import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { User } from '../../src/entities/User';
import { validate } from 'class-validator';
import { Role } from '../../src/entities/Role';
import { Department } from '../../src/entities/Department';

describe('User entity tests', () => {
    let user: User;
    let role: Role;
    let department: Department;

    beforeEach(() => {

        role = new Role();
        role.id = 1;
        role.name = "admin";

        department = new Department();
        department.id = 1;
        department.department = "IT";

        user = new User();
        user.id = 1;
        user.first_name = "admin"
        user.last_name = "nimda"
        user.email = "test@email.com";
        user.password = 'a'.repeat(10);
        user.role = role;
        user.department = department;
    });


    it('A blank name is considered invalid', async () => {
        user.first_name = '';
        user.last_name = '';
        const errors = await validate(user);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('A blank password is considered invalid', async () => {
        user.password = '';
        const errors = await validate(user);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it("A password that is not a string is considered invalid", async () => {
        user.password = 1234 as any;
        const errors = await validate(user);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty("isString");
    });

    it('A password containing only whitespace is invalid', async () => {
        user.password = ' ';
        const errors = await validate(user);
        expect(errors.length).toBe(1);
        const constraints = errors[0].constraints;
        expect(constraints).toHaveProperty('matches');
        expect(constraints?.matches).toBe('Password cannot be empty or whitespace');
    });

    it("A user with no role is considered invalid", async () => {
        user.role = null!;
        const errors = await validate(user);
        expect(errors.length).toBe(1);
        expect(errors[0].constraints).toHaveProperty("isNotEmpty");
    });

    it("A user with no department is considered invalid", async () => {
        user.department = null!;
        const errors = await validate(user);
        expect(errors.length).toBe(1);
        expect(errors[0].constraints).toHaveProperty("isNotEmpty");
    });

    it("A poorly formed email is considered invalid", async () => {
        user.email = "not a valid email address";
        const errors = await validate(user);
        expect(errors.length).toBe(1);
        expect(errors[0].constraints).toHaveProperty("isEmail");
    })

    it("A password less than 10 characters is considered invalid", async () => {
        user.password = 'a'.repeat(5);
        const errors = await validate(user);
        expect(errors.length).toBe(1);
        expect(errors[0].constraints).toHaveProperty("minLength");
    });

    it('A name containing only spaces is considered invalid', async () => {
        user.first_name = ' ';
        user.last_name = ' ';
        const errors = await validate(user);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('matches');
    });

    it('A name containing number(s) is considered invalid', async () => {
        user.first_name = '123';
        user.last_name = '123';
        const errors = await validate(user);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('matches');
    });

    it('A name exceeding 30 characters is considered invalid', async () => {
        user.first_name = 'a'.repeat(31);
        user.last_name = 'a'.repeat(31);
        const errors = await validate(user);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('maxLength');
    })

    it("A user with valid details will be accepted", async () => {
        const errors = await validate(user);
        expect(errors.length).toBe(0);
    })

});