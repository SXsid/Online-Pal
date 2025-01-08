"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("../Config/redis");
const socketUserServices_1 = __importDefault(require("../services/socketUserServices"));
class socketService {
    static async handleUserName({ socket, userName }) {
        const currentUser = await socketUserServices_1.default.addUser(socket, userName);
        const data = { type: "info", senderID: socket.id, message: `${userName} has joined the chat.` };
        redis_1.pub.publish("MESSAGES", JSON.stringify(data));
        if (currentUser) {
            redis_1.pub.publish("MESSAGES", JSON.stringify({ type: "currentUser", count: currentUser }));
        }
    }
    static async handelMessage({ socket, content }) {
        try {
            const userName = await socketUserServices_1.default.getUser(socket);
            if (userName) {
                const data = { type: "msg", senderID: socket.id, sender: userName, data: content };
                redis_1.pub.publish("MESSAGES", JSON.stringify(data));
            }
            else {
                socket.emit("error", { type: "error", message: "You are not registered." });
            }
        }
        catch (error) {
            console.error("Error handling message:", error);
            socket.emit("error", { type: "error", message: "An error occurred while processing your message." });
        }
    }
    static async handelTyping({ socket, status }) {
        const userName = await socketUserServices_1.default.getUser(socket);
        console.log(userName);
        if (userName) {
            const data = { type: "typing", senderID: socket.id, sender: userName, status: status };
            redis_1.pub.publish("MESSAGES", JSON.stringify(data));
        }
        else {
            socket.emit("error", { type: "error", message: "You are not registered." });
        }
    }
    static async handelDisconnect({ socket }) {
        const res = await socketUserServices_1.default.removeUser(socket);
        if (res?.userName) {
            const data = { type: "info", senderID: socket.id, message: `${res?.userName} has left the chat.` };
            redis_1.pub.publish("MESSAGES", JSON.stringify(data));
        }
        if (res?.activeUsers) {
            redis_1.pub.publish("MESSAGES", JSON.stringify({ type: "currentUser", count: res.activeUsers }));
        }
    }
}
exports.default = socketService;
