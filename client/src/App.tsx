import { useEffect, useState } from "react";

interface msgProp {
  sender: string;
  content: string;
}

type dataProp = { type: "info"; message: string } | { type: "msg"; sender: string; data: string };

function App() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [allMessage, setMessage] = useState<msgProp[]>([]);
  const [myMessage, setMy] = useState("");
  const [name, setName] = useState<string>("");
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [socketError, setSocketError] = useState<string>(""); // New state to handle socket error

  useEffect(() => {
    const socketConnect = () => {
      const connection = new WebSocket("wss://chatapp-19uj.onrender.com");

      connection.onopen = () => {
        console.log("Socket connection established.");
        setSocket(connection);
        setSocketError(""); // Reset error if connection is successful
      };

      connection.onmessage = (message) => {
        try {
          const data: dataProp = JSON.parse(message.data);

          if (data.type === "info") {
            setMessage((prev) => [...prev, { sender: "System", content: data.message }]);
          } else if (data.type === "msg") {
            setMessage((prev) => [...prev, { sender: data.sender, content: data.data }]);
          }
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };

      connection.onerror = (error) => {
        console.error("Socket error:", error);
        setSocketError("Failed to connect to the server. Please try again later.");
        setSocket(null);
      };

      connection.onclose = () => {
        console.log("Socket connection closed.");
        setSocket(null);
      };

      return connection;
    };

    const connection = socketConnect();

    return () => {
      connection?.close();
    };
  }, []);

  const handleJoin = () => {
    if (!name.trim()) {
      alert("Please enter a valid username.");
      return;
    }

    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "userName", userName: name }));
      setIsJoined(true);
    } else {
      console.error("Socket is not connected yet.");
    }
  };

  const handleSendMessage = () => {
    if (!myMessage.trim()) {
      alert("Cannot send an empty message.");
      return;
    }

    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "message", content: myMessage }));
      setMessage((m) => [...m, { sender: name, content: myMessage }]);
      setMy("");
    } else {
      console.error("Socket is not connected yet.");
    }
  };

  if (!socket) {
    return <div className="h-screen flex items-center justify-center text-white">Connecting the socket...</div>;
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {socketError ? ( 
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <h2 className="text-2xl font-semibold text-red-600">Error: {socketError}</h2>
        </div>
      ) : !isJoined ? (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <h2 className="text-2xl font-semibold">Enter your username to join the chat</h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter username"
            className="px-4 py-2 rounded bg-gray-800 text-white focus:outline-none focus:ring focus:ring-blue-500"
          />
          <button
            onClick={handleJoin}
            className="px-6 py-2 bg-blue-600 rounded text-white hover:bg-blue-700"
          >
            Join
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between p-4 bg-gray-800">
            <h2 className="text-lg font-semibold">Welcome, {name}!</h2>
          </div>
          <div className="flex flex-col flex-1 overflow-y-auto space-y-2 p-4">
            {allMessage.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === name
                    ? "justify-end"
                    : msg.sender === "System"
                    ? "justify-center"
                    : "justify-start"
                }`}
              >
                <div
                  className={` ${
                    msg.sender === name
                      ? "bg-blue-600 text-white p-3 rounded-lg max-w-xs"
                      : msg.sender === "System"
                      ? "bg-gray-700 text-white bg-transparent"
                      : "bg-gray-800 text-white p-3 rounded-lg max-w-xs"
                  }`}
                >
                  {msg.sender !== "System" ? msg.sender : ""}
                  {msg.sender === "System" ? (
                    <p className="text-center text-white text-sm">{msg.content}</p>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-gray-800 flex space-x-2">
            <input
              value={myMessage}
              type="text"
              placeholder="Type your message"
              onChange={(e) => setMy(e.target.value)}
              className="flex-1 px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              className="px-6 py-2 bg-blue-600 rounded text-white hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
