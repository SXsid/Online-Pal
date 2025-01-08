"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("../Config/redis");
class UserServices {
    static async getUser(socket) {
        try {
            return await redis_1.redis.get(`user:${socket.id}`);
        }
        catch (error) {
            console.error("Error fetching user from Redis:", error);
            return null;
        }
    }
    static async removeUser(socket) {
        try {
            const userName = await redis_1.redis.get(`user:${socket.id}`);
            await redis_1.redis.del(`user:${socket.id}`);
            const activeUsers = await redis_1.redis.decr("active-user");
            return { userName, activeUsers };
        }
        catch (error) {
            console.error("Error removing user from Redis:", error);
            return null;
        }
    }
    static async addUser(socket, userName) {
        try {
            await redis_1.redis.set(`user:${socket.id}`, userName, "EX", 2 * 60 * 60);
            const activeUsers = await redis_1.redis.incr("active-user");
            return activeUsers;
        }
        catch (error) {
            console.error("Error adding user to Redis:", error);
            return null;
        }
    }
}
exports.default = UserServices;
