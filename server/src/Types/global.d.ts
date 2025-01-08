import Redis from "ioredis";


declare namespace NodeJS{
    interface Global{
        redis?:{
            redis: Redis;
            pub: Redis;
            sub: Redis;
        }
    }
}