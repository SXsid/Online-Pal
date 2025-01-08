
import { Socket } from "socket.io";
import {  redis} from "../Config/redis";

class UserServices {
  static async getUser(socket: Socket): Promise<string | null> {
    try {
      return await redis.get(`user:${socket.id}`); 
    } catch (error) {
      console.error("Error fetching user from Redis:", error);
      return null;
    }
  }

  static async removeUser(socket: Socket){
   
    
    try {
      const userName = await redis.get(`user:${socket.id}`);
      await redis.del(`user:${socket.id}`); 
      const activeUsers=await redis.decr("active-user")
      return {userName,activeUsers}
    } catch (error) {
      console.error("Error removing user from Redis:", error);
      return null;
    }
  }

  static async addUser(socket: Socket, userName: string): Promise<number|null> {
    
    try {
     
      await redis.set(`user:${socket.id}`, userName, "EX", 2* 60 * 60);
      const activeUsers=await redis.incr("active-user")
   
       return activeUsers;
    } catch (error) {
      console.error("Error adding user to Redis:", error);
      return null
    }
   
  }
}

export default UserServices;
