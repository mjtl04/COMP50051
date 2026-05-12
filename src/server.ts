import { ResponseHandler } from "./utilities/ResponseHandler";
import { IApiRouter } from "./interfaces/IApiRouter";
import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import morgan, { StreamOptions } from "morgan";
import { AppDataSource } from "./data_source";
import { Logger } from "./utilities/Logger";
import requestIP, { rateLimit } from 'express-rate-limit';

export class Server {

  private readonly ERROR_SERVER = `Failed to start server - database initialisation failed`;

  public readonly port: number = 8900;
  private readonly source = AppDataSource;
  private readonly app: express.Application = express();
  private readonly helmet = require('helmet');


  constructor(private router: IApiRouter) {
    this.app.use(this.helmet.hidePoweredBy());
    this.initialiseMiddlewares();
    this.router.initialise(this.app);
    this.initialiseErrorHandling();
  }

  public async start() {
    try {
      await this.initialiseDataSource();
      this.app.listen(this.port, () => {
        Logger.info(`Server running on http://localhost:${this.port}`);
        console.log(`\nServer listening on http://localhost:${this.port}\n`);
      });
    } catch (error) {
      Logger.error(`${this.ERROR_SERVER}, ${error}`);
      process.exit(1);
    }
  }

  private initialiseMiddlewares() {
    const morganStream: StreamOptions = {
      write: (message: string): void => Logger.info(message.trim()),
    };
    this.app.use(express.json());
    this.app.use(morgan("combined", { stream: morganStream }));
  }

  private initialiseErrorHandling() {
    this.app.use((req: Request, res: Response) => {
      const requestedUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
      ResponseHandler.sendErrorResponse(
        res,
        StatusCodes.NOT_FOUND,
        "Route " + requestedUrl + " not found",
      );
    });
  }

  private async initialiseDataSource() {
    try {
      await this.source.initialize();
      Logger.info("Data Source initialised");
    } catch (error) {
      Logger.error("Error during initialisation:", error);
      throw error;
    }
  }
}
