import { ApiRouter } from "./routes/ApiRouter";
import { Server } from "./server";
import { ApiAuthentication } from "./utilities/ApiAuthenticate";

const authentication = new ApiAuthentication();

const router = new ApiRouter(authentication);

const server = new Server(router);
server.start();
