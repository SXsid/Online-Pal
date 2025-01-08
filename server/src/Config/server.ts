import {createServer} from "http"
import { app } from "../app"
import { initSocketServer } from "../WebSocket/socket"
import { redisClient } from "./redis";

const server = createServer(app)
const PORT = process.env.PORT || 8080;
export  const startServer = async()=>{
    const io=await initSocketServer(server)
    server.listen(PORT,()=>{
        console.log("server is up ")
    })

    const shutdown = async () => {
        console.log("Shutting down gracefully...")
        
        try {
            
            if (io) {
                await io.close()
            }

            
            await redisClient.cleanup()

            
            await new Promise<void>((resolve, reject) => {
                server.close((err) => {
                    if (err) reject(err)
                    else resolve()
                })
            })

            console.log("Server closed")
            process.exit(0)
        } catch (error) {
            console.error("Error during shutdown:", error)
            process.exit(1)
        }
    
}
        process.on("SIGINT", shutdown)  
        process.on("SIGTERM", shutdown) 
        process.on("SIGHUP", shutdown) 
}