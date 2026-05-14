import { ApiRouter } from "./routes/ApiRouter";
import { Server } from "./server";

const router = new ApiRouter();
const server = new Server(router);
server.start();
