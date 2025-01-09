import { Server as HTTPServer } from "http";
import { Server } from "socket.io";
import { socketHandler } from "./controller";
import {  sub } from "../Config/redis";

export const initSocketServer =async (server: HTTPServer) => {
  
  await sub.subscribe("MESSAGES", (err) => {
    if (err) console.error('Subscribe error:', err);
  });
  
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socketHandler(socket);
  });

  console.log("websocket is up");

  

  
  sub.on("message", (channel, data) => {
    if (channel === "MESSAGES") {
      io.sockets.sockets.forEach(ConnectedSocket => {
        if (ConnectedSocket.id !==JSON.parse(data).senderID) {
          ConnectedSocket.emit("message", data);
        }
      });
    }
  });

  
  return io;
};