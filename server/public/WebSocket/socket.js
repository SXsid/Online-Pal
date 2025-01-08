"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocketServer = void 0;
const socket_io_1 = require("socket.io");
const controller_1 = require("./controller");
const redis_1 = require("../Config/redis");
const initSocketServer = async (server) => {
    await redis_1.sub.subscribe("MESSAGES", (err) => {
        if (err)
            console.error('Subscribe error:', err);
    });
    await redis_1.redis.set("active-user", 0);
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });
    io.on("connection", (socket) => {
        (0, controller_1.socketHandler)(socket);
    });
    console.log("websocket is up");
    redis_1.sub.on("message", (channel, data) => {
        if (channel === "MESSAGES") {
            io.sockets.sockets.forEach(ConnectedSocket => {
                if (ConnectedSocket.id !== JSON.parse(data).senderID) {
                    ConnectedSocket.emit("message", data);
                }
            });
        }
    });
    return io;
};
exports.initSocketServer = initSocketServer;
