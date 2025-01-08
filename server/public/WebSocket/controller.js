"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketHandler = void 0;
const services_1 = __importDefault(require("./services"));
const socketHandler = (socket) => {
    console.log("new connectoon came");
    socket.on("message", (msg) => {
        try {
            const { type } = msg;
            console.log(msg);
            switch (type) {
                case "userName":
                    const { userName } = msg;
                    if (userName) {
                        services_1.default.handleUserName({ socket, userName });
                    }
                    else
                        throw new Error;
                    break;
                case "message":
                    const { content } = msg;
                    if (content) {
                        services_1.default.handelMessage({ socket, content });
                    }
                    else
                        throw new Error;
                    break;
                case "typing":
                    const { isTyping } = msg;
                    services_1.default.handelTyping({ socket, status: isTyping });
                    break;
                default:
                    socket.emit("error", JSON.stringify({ error: "Unknown message type" }));
            }
        }
        catch (e) {
            console.error("Error processing message:", e);
            socket.emit("error", JSON.stringify({ message: "Invalid message format" }));
        }
    });
    socket.on("disconnect", () => {
        services_1.default.handelDisconnect({ socket });
    });
};
exports.socketHandler = socketHandler;
