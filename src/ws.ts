import { WebSocket, WebSocketServer } from 'ws';
import { Context } from 'koishi'
import { Config } from './index'

export class Ws {
    private wss: WebSocketServer;

    constructor(ctx:Context, port: number, config: Config) {
        if (config.WsEnable) {
            this.wss = new WebSocket.Server({ port });
            this.wss.on('connection', ws => {
                ws.on('message', (message: string) => {
                    if (message === "PING") {
                        // 心跳检测
                        ws.send("PONG");
                    } else {
                        ctx.bots[`chronocat:${config.Bot}`].sendMessage(config.QQGroup, message);
                    }
                });
                // 当客户端连接关闭时
                ws.on('close', () => {
                    ctx.bots[`chronocat:${config.Bot}`].sendMessage(config.QQGroup, "与MC服务器断开");
                });
            });
        }
        
    }
    // 向所有连接的客户端广播消息
    public sendMessage(message: string): void {
        this.wss.clients.forEach((client: WebSocket) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }
}