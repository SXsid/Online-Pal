
import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

class RedisClient {
  private static instance: RedisClient;
  public redis: Redis;
  public pub: Redis;
  public sub: Redis;

  private constructor() {
    const url = process.env.URL;
    if (!url) {
      throw new Error("Redis URL is not defined. Please set the URL environment variable.");
    }

    
    this.redis = new Redis(url);
    this.pub = this.redis.duplicate();
    this.sub = this.redis.duplicate();

    
    this.redis.on("connect", () => console.log("redis is up"));
    this.pub.on("connect", () => console.log("publisher is up"));
    this.sub.on("connect", () => console.log("subscriber is up"));

  
    this.redis.on("error", (error) => console.error("Redis error:", error));
    this.pub.on("error", (error) => console.error("Publisher error:", error));
    this.sub.on("error", (error) => console.error("Subscriber error:", error));
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public async  cleanup(): Promise<void> {
    return Promise.all([
      this.redis.quit(),
      this.pub.quit(),
      this.sub.quit()
    ]).then(() => {});
  }
}

export const redisClient = RedisClient.getInstance();
export const { redis, pub, sub } = redisClient;