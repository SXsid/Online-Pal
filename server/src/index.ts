import express from "express";
import http from "http";
import cors from "cors"
import { WebSocketServer, WebSocket } from "ws";

type msgProp =
  | { type: "userName"; userName: string }
  | { type: "message"; content: string }
  | { type: "typing"; isTyping: boolean };

const app = express();


app.use(cors());

app.get("/", (req, res) => {
  res.send("Express server is running!");
});

const server = http.createServer(app); 

const ws = new WebSocketServer({ server });
const users = new Map<WebSocket, string>();

const broadcast = (data: object, senderSocket: WebSocket) => {
  ws.clients.forEach((client) => {
    if (client !== senderSocket && client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(data));
      } catch (error) {
        console.error("Error broadcasting message:", error);
      }
    }
  });
};

ws.on("connection", (socket) => {
  console.log("New WebSocket connection established");

  socket.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  socket.on("message", (msg) => {
    try {
      const parsedMsg: msgProp = JSON.parse(msg.toString());
      const { type } = parsedMsg;

      switch (type) {
        case "userName": {
          const userName = parsedMsg.userName.trim();
          if (userName) {
            users.set(socket, userName);
            broadcast(
              { type: "info", message: `${userName} has joined the chat.` },
              socket
            );
            const activeConnectionsCount = ws.clients.size;
            socket.send(
              JSON.stringify({ type: "activeConnections", activeConnectionsCount })
            );
            broadcast(
              { type: "activeConnections", activeConnectionsCount },
              socket
            );
          } else {
            socket.send(
              JSON.stringify({ type: "error", message: "Invalid username" })
            );
          }
          break;
        }
        case "message": {
          const sender = users.get(socket);
          const data = parsedMsg.content.trim();
          if (sender && data) {
            broadcast({ type: "msg", sender, data }, socket);
          } else {
            socket.send(
              JSON.stringify({ type: "error", message: "Message content is empty" })
            );
          }
          break;
        }
        case "typing": {
          const userName = users.get(socket);
          if (userName) {
            broadcast(
              { type: "typing", status: parsedMsg.isTyping, sender: userName },
              socket
            );
          }
          break;
        }
        default:
          socket.send(
            JSON.stringify({ type: "error", message: "Unknown message type" })
          );
          break;
      }
    } catch (error) {
      console.error("Error processing message:", error);
      socket.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
    }
  });

  socket.on("close", () => {
    const userName = users.get(socket);
    const activeConnectionsCount = ws.clients.size;
    if (userName) {
      users.delete(socket);
      broadcast(
        { type: "info", message: `${userName} has left the chat.` },
        socket
      );
      broadcast({ type: "typing", status: false, sender: userName }, socket);
      broadcast(
        { type: "activeConnections", activeConnectionsCount },
        socket
      );
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}`);
});
