import { Socket } from "socket.io";
import { parsedProp } from "../Types/socketTypes";
import socketService from "./services";

export const socketHandler=(socket:Socket)=>{
    console.log("new connectoon came");
    socket.on("message", (msg:parsedProp)=>{
        try{
          
            
            const {type}= msg
            console.log(msg);
            
            switch (type) {
                case "userName":
                const {userName}=msg
              
                  if(userName){ socketService.handleUserName({socket, userName});}
                  else throw new Error
                 
                  break;
                case "message":
                    const {content}= msg
                   
                    
                  if(content){ socketService.handelMessage({socket, content});}
                  else throw new Error
                  
                  break;
                case "typing":
                    const {isTyping}=msg
                      
                 socketService.handelTyping({socket, status:isTyping})
                  
                  
                  
                  break;
                default:
                  socket.emit("error",JSON.stringify({error: "Unknown message type" }));
              }
        }catch(e){
            console.error("Error processing message:", e);
            socket.emit("error",JSON.stringify({message: "Invalid message format" }));
        }
    })
    socket.on("disconnect",()=>{
        socketService.handelDisconnect({socket})
    })
    
}