import { Context, Schema, Logger, h } from 'koishi'
import { RCON } from './rcon';
import { Ws } from './ws';

export const name = 'mcqq'
export interface Config { 
    RconHost: string,
    RconPort: number,
    RconPassword: string,
    WsEnable: boolean,
    WsPort: number,
    Bot: string,
    QQGroup: string,
    whitelist: string,
    unwhitelist: string
}

export const Config: Schema<Config> = Schema.intersect([
    Schema.object({
        RconHost: Schema.string().default("127.0.0.1").description('RCON服务IP'),
        RconPort: Schema.number().description('RCON服务端口'),
        RconPassword: Schema.string().description('RCON服务密码'),
    }).description('RCON'),
    Schema.object({
        WsEnable: Schema.boolean().description('WebScoket').default(false),
        WsPort: Schema.number().description('WebScoket服务端口'),
        Bot: Schema.string().description('机器人QQ账号[只支持 Chronocat]').default("3759400284"),
        QQGroup: Schema.string().description('群聊账号').default("707019626"),
    }).description('WebScoket'),
    Schema.object({
        whitelist: Schema.string().description('添加白名单指令').default("添加白名单"),
        unwhitelist: Schema.string().description('删除白名单指令').default("删除白名单")
    }).description('指令'),
])

declare module 'koishi' {
}

const log = new Logger(name);
let rcon: RCON;

export function apply(ctx: Context, config: Config) {
    var ws: Ws = new Ws(ctx, config.WsPort, config);
    ctx.command('rcon <message>')
        .action(async ({ session }, message) => {
            if (message == "connect") {
                rcon = new RCON(config.RconHost, config.RconPort, config.RconPassword);
                if (rcon == undefined) {
                    session.send(`连接失败，请检查服务器RCON`);
                    return;
                }
                session.send(`已连接`);
            } else if (message == "stop") {
                if (rcon == undefined) {
                    session.send(`未连接`);
                }else{
                    rcon.close();
                    session.send(`断开连接`);
                }
            } else if (message == "re") {
                rcon = new RCON(config.RconHost, config.RconPort, config.RconPassword);
                if (rcon != undefined) {
                    session.send(`重新连接`);
                }
            } else {
                if (rcon == undefined) {
                    session.send(`未连接`);
                }else{
                    session.send(`已连接`);
                }
            }
        });
    ctx.command('rcon <message>')
        .action(async ({ session }, message) => {
            if (message == "connect") {
                rcon = new RCON(config.RconHost, config.RconPort, config.RconPassword);
                if (rcon == undefined) {
                    session.send(`连接失败，请检查服务器RCON`);
                    return;
                }
                session.send(`已连接`);
            } else if (message == "stop") {
                if (rcon == undefined) {
                    session.send(`未连接`);
                }else{
                    rcon.close();
                    session.send(`断开连接`);
                }
            } else if (message == "re") {
                rcon = new RCON(config.RconHost, config.RconPort, config.RconPassword);
                if (rcon != undefined) {
                    session.send(`重新连接`);
                }
            } else {
                if (rcon == undefined) {
                    session.send(`未连接`);
                }else{
                    session.send(`已连接`);
                }
            }
        });
    ctx.command(`${config.whitelist} <message:text>`)
        .action(async ({ session }, message) => {
            if (rcon == undefined) {
                session.send(`未连接`);
            }else{
                if (message != undefined){
                    session.send(h.at(session.userId) + " " + await rcon.exec(`wl add ${session.userId} ${message}`));
                    return;
                }
                session.send(h.at(session.userId) + ` ${config.whitelist} <id>`);
            }
        });
    ctx.command(`${config.unwhitelist} <message:text>`, { authority: 4})
        .action(async ({ session }, message) => {
            if (rcon == undefined) {
                session.send(`未连接`);
            }else{
                if (message != undefined){
                    session.send(h.at(session.userId) + " " + await rcon.exec(`wl del ${session.userId} ${message}`));
                    return;
                }
                session.send(h.at(session.userId) + ` ${config.unwhitelist} <id>`);
            }
        });
    ctx.command('exec <message:text>', { authority: 4})
        .action(async ({ session }, message) => {
            if (rcon == undefined) {
                session.send(`连接失败，请检查服务器RCON`);
            }else{
                session.send(h.at(session.userId) + " " + await rcon.exec(message));
            }
        });
    ctx.command('测试')
        .action(async ({ session }, message) => {
            session.send(h.at(session.userId));
        });
}
