import { Socket } from "socket.io";

export interface handlerProp{
    socket:Socket,
   
}
export type parsedProp =
  | { type: "userName"; userName: string }
  | { type: "message"; content: string }
  | { type: "typing"; isTyping: boolean };

export interface HandleuserNameProp extends handlerProp{
    userName:string
}
export interface HandleMessageProp extends handlerProp{
    content:string
}
export interface HandleTypingProp extends handlerProp{
    status:boolean
}

export interface brodCastProp{
    
    data:object,
    socket:Socket
}