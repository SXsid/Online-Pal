import { useEffect, useState } from "react";
import { useSocketConnection } from "./util/hook";





function App() {
  
  const [myMessage, setMy] = useState("");
  const [name, setName] = useState<string>("");
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [isTyping,setTyping]=useState(false)
  const {socket,socketError,activeConnections,someoneTyping,allMessage,setMessages}=useSocketConnection()
  

  
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
      sendTyping(false);
      socket.send(JSON.stringify({ type: "message", content: myMessage }));
      setMessages((m) => [...m, { sender: name, content: myMessage }]);
      setMy("");
      setTyping(false);
    } else {
      console.error("Socket is not connected yet.");
    }
  };

  function sendTyping(status: boolean) {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "typing", isTyping: status }));
    }
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMy(e.target.value);
    if (!isTyping) {
      setTyping(true);
      sendTyping(true);
    }
  };

  useEffect(() => {
    let interval: number;
    if (isTyping) {
      interval = setTimeout(() => {
        setTyping(false);
        sendTyping(false);
      }, 1500);
    }
    return () => clearTimeout(interval);
  }, [myMessage, isTyping]);

  if (!socket && !socketError) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Connecting to the server...
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {socketError ? (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <h2 className="text-2xl font-semibold text-red-600">
            Error: {socketError}
          </h2>
        </div>
      ) : !isJoined ? (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <h2 className="text-2xl font-semibold">
            Enter your username to join the chat
          </h2>
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
            {isJoined && (
              <span className="text-green-400 text-sm ml-2">
                {activeConnections} user{activeConnections > 1 ? "s" : ""} online
              </span>
            )}
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
            {someoneTyping.map((someone) => {
              return (
                <div className="text-sm text-blue-400">{someone} is typing...</div>
              );
            })}
          </div>
          <div className="p-4 bg-gray-800 flex space-x-2">
            <input
              value={myMessage}
              type="text"
              placeholder="Type your message"
              onChange={(e) => handleTyping(e)}
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
