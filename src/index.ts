import { Context, Schema, Logger, Random, h } from 'koishi'
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
    Item: Array<{item: string, possibility: number, cmd: string}>,
    whitelist: string,
    unwhitelist: string,
    luck: string
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
        Item: Schema.array(Schema.object({
            item: Schema.string().description("奖励"),
            possibility: Schema.number().description("权重"),
            cmd: Schema.string().description("服务器命令\n%player% 代替玩家名称"),
        })).role('table'),
    }).description('抽奖'),
    Schema.object({
        whitelist: Schema.string().description('添加白名单指令').default("添加白名单"),
        unwhitelist: Schema.string().description('删除白名单指令').default("删除白名单"),
        luck: Schema.string().description('抽奖指令').default("抽奖")
    }).description('指令'),
])

declare module 'koishi' {
}

function lucky(config: Config){
    var length = config.Item.length;
    for (var i = 0; i < length; i++) {
        if (Random.bool(config.Item[i].possibility)) {
            return config.Item[i];
        }
    }
    return config.Item[length-1];
}

async function getLuckData(rcon: RCON, qq: string){
    return await rcon.exec(`luck getLuckData ${qq}`);
}

const log = new Logger(name);
let rcon: RCON;
var msg;

export function apply(ctx: Context, config: Config) {
    var ws: Ws = new Ws(ctx, config.WsPort, config);
    ctx.command(`${config.whitelist} <message:text>`)
        .action(async ({ session }, message) => {
            try {
                rcon = RCON.getRcon(config);
            } catch {
                session.send("MC服务器RCON错误！！！");
                return;
            }
            msg = h.at(session.userId) + ` ${config.whitelist} <id>`
            if (message != undefined){
                msg = h.at(session.userId) + " " + await rcon.exec(`wl add ${message} ${session.userId}`)
                log.debug(`wl add ${message} ${session.userId}`);
            }
            session.send(msg);
            rcon.close();
        });
    ctx.command(`${config.unwhitelist} <message:text>`, { authority: 4})
        .action(async ({ session }, message) => {
            try {
                rcon = RCON.getRcon(config);
            } catch {
                session.send("MC服务器RCON错误！！！");
                return;
            }
            msg = h.at(session.userId) + ` ${config.unwhitelist} <id>`;
            if (message != undefined){
                msg = h.at(session.userId) + " " + await rcon.exec(`wl del ${message} ${session.userId}`);
            }
            session.send(msg);
            rcon.close();
        });
    ctx.command('exec <message:text>', { authority: 4})
        .action(async ({ session }, message) => {
            try {
                rcon = RCON.getRcon(config);
            } catch {
                session.send("MC服务器RCON错误！！！");
                return;
            }
            msg = h.at(session.userId) + " " + await rcon.exec(message);
            session.send(msg);
            rcon.close();
        });
    ctx.command(`${config.luck}`)
        .action(async ({ session }) => {
            try {
                rcon = RCON.getRcon(config);
            } catch {
                session.send("MC服务器RCON错误！！！");
                return;
            }
            var luckData = (await getLuckData(rcon, session.userId)).split(" ");
            var player = luckData[0];
            var status = luckData[1];
            var result;
            var cmd;
            var McResult;
            if (player === "NULL") {
                msg = h.at(session.userId) + " 未绑定白名单";
            } 
            else if (status === "HAVE_LUCK") {
                msg = h.at(session.userId) + ` [${player}] ` + "今日抽奖次数用完了！！！";
            }
            else if (status === "VERY_LUCK") {
                cmd = config.Item[0].cmd.replace("%player%", player)
                McResult = await rcon.exec(cmd)
                msg = h.at(session.userId) + ` [${player}] ` + config.Item[0].item + "\n保底来喽！！！" + "\n" + McResult;
            }
            else {
                result = lucky(config);
                cmd = result.cmd.replace("%player%", player);
                McResult = await rcon.exec(cmd);
                msg = h.at(session.userId) + ` [${player}] ` + result.item + "\n" + McResult;
            }
            session.send(msg);
            rcon.close();
        });
    ctx.command('奖池')
        .action(async ({ session }) => {
            var message = ""
            var length = config.Item.length
            for (var i = 0; i < length; i++) {
                message += `奖励: ${config.Item[i].item}\n权重: ${config.Item[i].possibility}%\n`
            }
            session.send(message);
        });
    // ctx.command('测试')
    //     .action(async ({ session }, message) => {
    //         // session.send((String)state);
    //     });
}
