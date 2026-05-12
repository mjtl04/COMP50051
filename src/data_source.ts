import { UserManagement } from "./entities/UserManagement";
import { LeaveRequest } from "./entities/LeaveRequest";
import { LeaveStatus } from "./entities/LeaveStatus";
import { DataSourceOptions } from "typeorm/browser";
import { Department } from "./entities/Department";
import { LeaveType } from "./entities/LeaveType";
import { Role } from "./entities/Role";
import { User } from "./entities/User";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import "reflect-metadata";
dotenv.config({ quiet: true });

export const AppDataSource = new DataSource({
  type: process.env.DB_TYPE,
  url: process.env.CONNECTION_STRING,
  ssl: true,
  entities: [Role, User, LeaveRequest, LeaveType, LeaveStatus, UserManagement, Department],
} as DataSourceOptions);
