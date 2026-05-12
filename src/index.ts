import { ApiRouter } from "./routes/ApiRouter";
import { Server } from "./server";

const server = new Server(new ApiRouter);
server.start();
