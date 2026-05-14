import { IApiRouter } from "./interfaces/IApiRouter";
import express, { NextFunction, Request, Response } from "express";
import morgan, { StreamOptions } from "morgan";
import { AppDataSource } from "./data_source";
import { Logger } from "./utilities/Logger";
import helmet from "helmet";
import { ErrorHandler } from "./utilities/ErrorHandler";
import { AppError } from "./utilities/AppError";

export class Server {

  private readonly ERROR_SERVER = `Failed to start server - database initialisation failed`;

  public readonly port = process.env.PORT;
  private readonly source = AppDataSource;
  private readonly app: express.Application = express();

  constructor(private router: IApiRouter) {
    this.app.use(helmet.hidePoweredBy());
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
    this.app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
      ErrorHandler.handle(err, res);
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
