import { useEffect, useState } from "react";

export interface msgProp {
  sender: string;
  content: string;
}

 type dataProp =
  | { type: "info"; message: string }
  | { type: "msg"; sender: string; data: string }
  | { type: "typing"; status: boolean; sender: string }
  | { type: "activeConnections"; activeConnectionsCount: number };

export function useSocketConnection() {
  const [laoding,setLoading]=useState(false)
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [socketError, setSocketError] = useState<string>("");
  const [allMessage, setMessages] = useState<msgProp[]>([]);
  const [someoneTyping, setSomeoneTyping] = useState<string[]>([]);
  const [activeConnections, setActiveConnections] = useState<number>(0);

  useEffect(() => {
    const checkServerAndConnectSocket = async () => {
      try {
        setLoading(true)
        const response = await fetch("https://chatapp-19uj.onrender.com");
        if (response &&response.ok) {
          console.log("Server is available. Connecting to WebSocket...");

          const connection = new WebSocket("wss://chatapp-19uj.onrender.com");

          connection.onopen = () => {
            console.log("Socket connection established.");
            setSocket(connection);
            setSocketError("");
            setLoading(false)
          };

          connection.onmessage = (message) => {
            try {
              const data: dataProp = JSON.parse(message.data);

              if (data.type === "info") {
                setMessages((prev) => [
                  ...prev,
                  { sender: "System", content: data.message },
                ]);
              } else if (data.type === "msg") {
                setMessages((prev) => [
                  ...prev,
                  { sender: data.sender, content: data.data },
                ]);
              } else if (data.type === "typing") {
                setSomeoneTyping((prevUser) => {
                  if (data.status && !prevUser.includes(data.sender)) {
                    return [...prevUser, data.sender];
                  } else if (!data.status) {
                    return prevUser.filter((userName) => userName !== data.sender);
                  }
                  return prevUser;
                });
              } else if (data.type === "activeConnections") {
                setActiveConnections(data.activeConnectionsCount);
              }
            } catch (error) {
              console.error("Error parsing message:", error);
            }
          };

          connection.onerror = (error) => {
            
            console.error("Socket error:", error);
            setSocketError("Failed to connect to the server. Please retry.");
            setSocket(null);
            setLoading(false)
            
          };

          connection.onclose = () => {
            console.log("Socket connection closed.");
            setSocket(null);
            setLoading(false)
          };

          return connection;
        } else {
          throw new Error("Server is down");
        }
      } catch (error) {
       setLoading(false)
        
        console.error("Error checking server availability:", error);
        setSocketError("Server is down. Please wait for couple of min .");
      }
    };

    const connection = checkServerAndConnectSocket();

    return () => {
      connection?.then((conn) => conn?.close());
    };
  }, []);

  return { socket, socketError, allMessage, someoneTyping, activeConnections,setMessages,laoding };
}
