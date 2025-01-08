
import { pub } from "../Config/redis";
import userServices from "../services/socketUserServices";
import {  HandleMessageProp, handlerProp, HandleTypingProp, HandleuserNameProp } from "../Types/socketTypes";

class socketService{
    static async handleUserName({socket,userName}:HandleuserNameProp){
         const currentUser= await userServices.addUser(socket,userName)
        const data ={ type: "info", senderID:socket.id,message: `${userName} has joined the chat.` }
        
        pub.publish("MESSAGES",JSON.stringify(data))
        if(currentUser){
            pub.publish("MESSAGES",JSON.stringify({type:"currentUser",count:currentUser}))
        }
    } 
    
    
    
    static async handelMessage({socket,content}:HandleMessageProp){
        try{
            const userName =  await userServices.getUser(socket)
        
        if (userName) {
            const data = { type: "msg", senderID: socket.id, sender: userName, data: content }

            
            pub.publish("MESSAGES", JSON.stringify(data));
        } else {
           
            socket.emit("error", { type: "error", message: "You are not registered." });
        }
    } catch (error) {
        
        console.error("Error handling message:", error);
        socket.emit("error", { type: "error", message: "An error occurred while processing your message." });
    }

        

    } 
    
    
    
    
    
    static async  handelTyping({socket,status}:HandleTypingProp){
        const userName =  await userServices.getUser(socket)
        console.log(userName);
        
        if(userName){
            const data= { type: "typing", senderID:socket.id,sender: userName, status: status }
            pub.publish("MESSAGES",JSON.stringify(data))
        }else{
            socket.emit("error", { type: "error", message: "You are not registered." });

        }


    } 
    static async handelDisconnect({socket}:handlerProp){
        const res =  await userServices.removeUser(socket)
        if(res?.userName){
            const data =  { type: "info",senderID:socket.id, message: `${res?.userName} has left the chat.` }
            pub.publish("MESSAGES",JSON.stringify(data))
        }
        if(res?.activeUsers){
            pub.publish("MESSAGES",JSON.stringify({type:"currentUser",count:res.activeUsers}))
        }
    }
}



export default socketService