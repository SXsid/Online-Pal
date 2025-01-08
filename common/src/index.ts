    export  type serverProp =
    | { type: "info"; message: string }
    | { type: "msg"; sender: string; data: string }
    | { type: "typing"; status: boolean; sender: string }
    | { type: "activeConnections"; activeConnectionsCount: number };

   export  type clientProp =
  | { type: "userName"; userName: string }
  | { type: "message"; content: string }
  | { type: "typing"; isTyping: boolean };

    export interface msgProp {
        sender: string;
        content: string;
      } 