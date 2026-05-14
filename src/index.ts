import { ApiRouter } from "./routes/ApiRouter";
import { Server } from "./server";
import { ApiAuthentication } from "./utilities/ApiAuthenticate";
import { ResponseHandler } from "./utilities/ResponseHandler";

const responseHandler = new ResponseHandler();

const authentication = new ApiAuthentication(responseHandler);

const router = new ApiRouter(authentication);

const server = new Server(router, responseHandler);
server.start();
