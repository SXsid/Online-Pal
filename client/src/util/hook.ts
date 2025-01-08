import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export interface MsgProp {
  sender: string;
  content: string;
}

type DataProp =
  | { type: "info"; message: string }
  | { type: "msg"; sender: string; data: string }
  | { type: "typing"; status: boolean; sender: string }
  | { type: "currentUser"; count: number };

export const useSocketConnection = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(false);
  const [socketError, setError] = useState("");
  const [chat, setChat] = useState<MsgProp[]>([]);
  const [userTyping, setTypingUsers] = useState<string[]>([]);
  const [activeUser, setUser] = useState(0);

  useEffect(() => {
    const connectSocket = () => {
      setLoading(true);
      const server = io("https://online-pal-production.up.railway.app/", {
        transports: ["websocket"],
      });

      server.on("connect", () => {
        setLoading(false);
        setSocket(server);
        setError("");
        console.log("Connected to the server");
      });

      server.on("disconnect", () => {
        console.log("Disconnected from the server");
        setSocket(null);
      });

      server.on("message", (res) => {
        console.log(res);
        
        const  data:DataProp =JSON.parse(res)
        const { type } = data;
        switch (type) {
          case "info":
            setChat((prev) => [...prev, { sender: "System", content: data.message }]);
            break;
          case "msg":
            setChat((prev) => [...prev, { sender: data.sender, content: data.data }]);
            break;
          case "typing":
            const { sender, status } = data;
            setTypingUsers((users) => {
              if (status) return [...users, sender];
              return users.filter((user) => user !== sender);
            });
            break;
          case "currentUser":
            setUser(data.count);
            break;
          default:
            console.warn("Unknown message type:", type);
        }
      });

      server.on("connect_error", (err) => {
        console.error("Connection error:", err);
        setError("Connection failed. Please try again later.");
        setLoading(false);
      });

      server.on("error", (err) => {
        console.error("Server error:", err);
        setError("A server error occurred.");
      });

      return server;
    };

    const server = connectSocket();

    return () => {
      if (server) {
        server.disconnect();
      }
    };
  }, []);

  return {
    socket,
    loading,
    activeUser,
    chat,
    userTyping,
    socketError,
    setChat,
  };
};
