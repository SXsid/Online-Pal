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

export const useSocketConnection=()=>{
  const [socket,setSocket]=useState<WebSocket|null>(null)
  const [loading,setLoading]=useState(false)
  const [socketError,setError]=useState("")
  const [chat,setChat]=useState<msgProp[]>([])
  const [userTyping,setTypingUsers]=useState<string[]>([])
  const [activeUser,setUser]=useState(0)

  useEffect(()=>{
    const SocketConnect =async()=>{
      setLoading(true)
     try{
      const response = await fetch("https://online-pal-production.up.railway.app/")
      if(response && response.ok){
        const server = new WebSocket("wss://online-pal-production.up.railway.app/")
        console.log(server);
        
        server.onopen=()=>{
          setLoading(false)
          setSocket(server)
          setError("")
        }
        server.onmessage=(message)=>{
          try{
            const data:dataProp= JSON.parse(message.data)
            const {type}=data
            switch(type){
              case"info":{
                setChat(prev=>[...prev,{sender:"System",content:data.message}])
                break
              }
              case "msg":{
                
                setChat(prev=>[...prev,{sender:data.sender,content:data.data}])
                break
              }
              case "typing":{
                const {sender,status}=data
                setTypingUsers(users=>{
                  if(status) return [...users,sender]
                  else if(!status && users.includes(sender)){
                    return users.filter(user=>user!==sender)
                  }
                  return users
                })
                break
              }
              case "activeConnections":{
                setUser(data.activeConnectionsCount)
              }
            }
          }catch(e){
            console.error("Error while parsing",e)
          }
        }
        server.onerror=(error)=>{
          console.error("Server Errror",error)
          setLoading(false)
          setError("Error: server down plzz try again later ")
        }
        server.onclose=()=>{
          console.log("connection closed");
          
          setLoading(false)
          setSocket(null)
        }
        
      }else{
        setError("server is down plzz try later")
        setLoading(false)
        
      }
     }catch(e){
      console.error("fetch failed")
      setError("server crashed try later")
      setLoading(false)
     }

      
    }
    SocketConnect()
    return ()=>{
      if(socket){
        socket.onclose=null
        socket.onerror=null
        socket.close()
       
      }
  
  
  }

  }
  
  
  
  ,[])
  return{
    socket,
    loading,
    activeUser,
    chat,
    userTyping,
    socketError,
    setChat
  }
}
