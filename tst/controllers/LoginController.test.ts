import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { LoginController } from "../../src/controllers/LoginController";
import { StatusCodes } from "http-status-codes";
import { Validation } from "../../src/utilities/Validation";
import { ResponseHandler } from "../../src/utilities/ResponseHandler";
import { Logger } from "../../src/utilities/Logger";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken", () => ({
    sign: jest.fn().mockReturnValue("signed.jwt.token"),
}));

describe("LoginController tests", () => {


    let controller: LoginController;
    let loginService: any;
    let req: any;
    let res: any;

    beforeEach(() => {
        loginService = {
            login: jest.fn(),
        };

        controller = new LoginController(loginService);

        req = { body: {} };

        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };

        jest.spyOn(Validation, "email").mockImplementation((x) => x);
        jest.spyOn(Validation, "password").mockImplementation((x) => x);

        jest.spyOn(ResponseHandler, "sendErrorResponse")
            .mockImplementation(((res: any) => res) as any);

        jest.spyOn(Logger, "error").mockImplementation(() => { });


    });

    it("returns error when body is missing", async () => {
        req.body = null;

        await controller.login(req, res);

        expect(Logger.error).toHaveBeenCalled();
        expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
            res,
            StatusCodes.BAD_REQUEST,
            "Request body is required"
        );
    });

    it("returns error when email is missing", async () => {
        req.body = { password: "123456" };

        await controller.login(req, res);

        expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
            res,
            StatusCodes.BAD_REQUEST,
            "email field is required"
        );
    });

    it("returns error when password is missing", async () => {
        req.body = { email: "test@test.com" };

        await controller.login(req, res);

        expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
            res,
            StatusCodes.BAD_REQUEST,
            "password field is required"
        );
    });

    it("logs in successfully and returns JWT", async () => {
        req.body = {
            email: "test@test.com",
            password: "123456",
        };

        loginService.login.mockResolvedValue({ id: 1, email: "test@test.com" });

        process.env.JWT_SECRET_KEY = "secret";

        await controller.login(req, res);

        expect(Validation.email).toHaveBeenCalledWith("test@test.com");
        expect(Validation.password).toHaveBeenCalledWith("123456");

        expect(loginService.login).toHaveBeenCalledWith("test@test.com", "123456");

        expect(jwt.sign).toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(StatusCodes.ACCEPTED);
        expect(res.send).toHaveBeenCalledWith("signed.jwt.token");
    });

    it("handles loginService errors", async () => {
        req.body = {
            email: "test@test.com",
            password: "123456",
        };

        loginService.login.mockRejectedValue(new Error("Invalid credentials"));

        await controller.login(req, res);

        expect(Logger.error).toHaveBeenCalledWith("Invalid credentials");
        expect(ResponseHandler.sendErrorResponse).toHaveBeenCalledWith(
            res,
            StatusCodes.BAD_REQUEST,
            "Invalid credentials"
        );
    });
});
