import { Socket } from "socket.io";
import { redis } from "../Config/redis";

class UserServices {
  static async getUser(socket: Socket): Promise<string | null> {
    try {
      return await redis.get(`user:${socket.id}`);
    } catch (error) {
      console.error("Error fetching user from Redis:", error);
      return null;
    }
  }

  static async removeUser(socket: Socket) {
    try {
      const userName = await redis.get(`user:${socket.id}`);
      if (!userName) {
        return null; // User doesn't exist
      }

      await redis.del(`user:${socket.id}`);
      
      // Get current count before decrementing
      const currentCount = await redis.get("active-user");
      
      // Only decrement if count is greater than 0
      if (currentCount && parseInt(currentCount) > 0) {
        const activeUsers = await redis.decr("active-user");
        return { userName, activeUsers };
      } else {
        // Reset to 0 if somehow went negative
        await redis.set("active-user", "0");
        return { userName, activeUsers: 0 };
      }
    } catch (error) {
      console.error("Error removing user from Redis:", error);
      return null;
    }
  }

  static async addUser(socket: Socket, userName: string): Promise<number | null> {
    try {
      // Check if user already exists
      const existingUser = await redis.get(`user:${socket.id}`);
      if (existingUser) {
        return parseInt(await redis.get("active-user") || "0");
      }

      await redis.set(`user:${socket.id}`, userName, "EX", 2 * 60 * 60);
      const activeUsers = await redis.incr("active-user");
      return activeUsers;
    } catch (error) {
      console.error("Error adding user to Redis:", error);
      return null;
    }
  }
}

export default UserServices;