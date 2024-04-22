// import { WebSocket, WebSocketServer } from 'ws';
// import { Context, Logger } from 'koishi'
import Rcon from 'rcon-ts';

// const log = new Logger("MCQQ");
export class MCQQ {
    // private wss: WebSocketServer;
    private rcon: Rcon;

    constructor(port: number, password: string) {
        this.rcon = new Rcon({
            host: "127.0.0.1",
            port: port, 
            password: password,
            timeout: 5000
        });
        this.rcon.connect();
        // this.wss = new WebSocket.Server({ port });
        // 当有客户端连接时
        // this.wss.on('connection', ws => {
        //     log.info('Client connected');
        //     // 当收到该客户端发送的消息时
        //     ws.on('message', (message: string) => {
        //         if (message === "PING") {
        //             ws.send("PONG");
        //         } else {
        //             ctx.bots["chronocat:177670834"].sendMessage("765979297", message);
        //         }
        //     });
        //     // 当客户端连接关闭时
        //     ws.on('close', () => {
        //         log.info('Client disconnected');
        //     });
        // });
        // log.info(`WebSocket server started at ws://localhost:${port}`);
    }
    public exec(command: string) {
        return this.rcon.send(command);
    }
    public close(){
        this.rcon.disconnect();
    }
    // 向所有连接的客户端广播消息
    // public sendMessage(message: string): void {
    //     this.wss.clients.forEach((client: WebSocket) => {
    //         if (client.readyState === WebSocket.OPEN) {
    //             client.send(message);
    //         }
    //     });
    // }
    
}