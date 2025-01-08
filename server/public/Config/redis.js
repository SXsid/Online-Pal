"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sub = exports.pub = exports.redis = exports.redisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class RedisClient {
    constructor() {
        const url = process.env.URL;
        if (!url) {
            throw new Error("Redis URL is not defined. Please set the URL environment variable.");
        }
        this.redis = new ioredis_1.default(url);
        this.pub = this.redis.duplicate();
        this.sub = this.redis.duplicate();
        this.redis.on("connect", () => console.log("redis is up"));
        this.pub.on("connect", () => console.log("publisher is up"));
        this.sub.on("connect", () => console.log("subscriber is up"));
        this.redis.on("error", (error) => console.error("Redis error:", error));
        this.pub.on("error", (error) => console.error("Publisher error:", error));
        this.sub.on("error", (error) => console.error("Subscriber error:", error));
    }
    static getInstance() {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }
        return RedisClient.instance;
    }
    async cleanup() {
        return Promise.all([
            this.redis.quit(),
            this.pub.quit(),
            this.sub.quit()
        ]).then(() => { });
    }
}
exports.redisClient = RedisClient.getInstance();
exports.redis = exports.redisClient.redis, exports.pub = exports.redisClient.pub, exports.sub = exports.redisClient.sub;
