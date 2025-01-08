"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = void 0;
const http_1 = require("http");
const app_1 = require("../app");
const socket_1 = require("../WebSocket/socket");
const redis_1 = require("./redis");
const server = (0, http_1.createServer)(app_1.app);
const PORT = process.env.PORT || 8080;
const startServer = async () => {
    const io = await (0, socket_1.initSocketServer)(server);
    server.listen(PORT, () => {
        console.log("server is up ");
    });
    const shutdown = async () => {
        console.log("Shutting down gracefully...");
        try {
            if (io) {
                await io.close();
            }
            await redis_1.redisClient.cleanup();
            await new Promise((resolve, reject) => {
                server.close((err) => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
            });
            console.log("Server closed");
            process.exit(0);
        }
        catch (error) {
            console.error("Error during shutdown:", error);
            process.exit(1);
        }
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
    process.on("SIGHUP", shutdown);
};
exports.startServer = startServer;
