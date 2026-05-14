import request from "supertest";
import express from "express";
import { ApiRouter } from "../../src/routes/ApiRouter";
import { ApiAuthentication } from "../../src/utilities/ApiAuthenticate";
import { RouteContainer } from "../../src/routes/RouteContainer";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";

jest.spyOn(ApiAuthentication, "authenticateToken").mockImplementation((req, res, next) => next() as any);

const mockLoginRouter = express.Router();
mockLoginRouter.get("/", (req, res) => res.send("login"));

const mockUserRouter = express.Router();
mockUserRouter.get("/", (req, res) => res.send("users"));

const mockLeaveRouter = express.Router();
mockLeaveRouter.get("/", (req, res) => res.send("leave"));

const mockManagementRouter = express.Router();
mockManagementRouter.get("/", (req, res) => res.send("management"));

jest.spyOn(RouteContainer.LoginRouter, "getRouter").mockReturnValue(mockLoginRouter);
jest.spyOn(RouteContainer.UserRouter, "getRouter").mockReturnValue(mockUserRouter);
jest.spyOn(RouteContainer.LeaveRouter, "getRouter").mockReturnValue(mockLeaveRouter);
jest.spyOn(RouteContainer.ManagementRouter, "getRouter").mockReturnValue(mockManagementRouter);

describe("ApiRouter tests", () => {
    let app: express.Application;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        const router = new ApiRouter();
        router.initialise(app);
    });

    it("registers /api/login route without authentication", async () => {
        const res = await request(app).get("/api/login");

        expect(res.status).toBe(200);
        expect(res.text).toBe("login");
        expect(ApiAuthentication.authenticateToken).not.toHaveBeenCalled();
    });

    it("registers /api/users route with authentication", async () => {
        const res = await request(app).get("/api/users");

        expect(res.status).toBe(200);
        expect(res.text).toBe("users");
        expect(ApiAuthentication.authenticateToken).toHaveBeenCalled();
    });

    it("registers /api/leave-requests route with authentication", async () => {
        const res = await request(app).get("/api/leave-requests");

        expect(res.status).toBe(200);
        expect(res.text).toBe("leave");
        expect(ApiAuthentication.authenticateToken).toHaveBeenCalled();
    });

    it("registers /api/management route with authentication", async () => {
        const res = await request(app).get("/api/management");

        expect(res.status).toBe(200);
        expect(res.text).toBe("management");
        expect(ApiAuthentication.authenticateToken).toHaveBeenCalled();
    });

    it("applies login rate limiter", async () => {
        for (let i = 0; i < 5; i++) {
            await request(app).post("/api/login").send({ email: "test@test.com" });
        }

        const res = await request(app).post("/api/login").send({ email: "test@test.com" });

        expect(res.status).toBe(429);
        expect(res.text).toContain(ApiRouter.ERROR_TOO_MANY_REQUESTS);
    });
});
