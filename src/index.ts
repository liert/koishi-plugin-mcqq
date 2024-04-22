import { Context, Schema, Logger } from 'koishi'
// import {} from '@koishijs/plugin-adapter-satori'
import { MCQQ } from './mcqq';
const koi = require('koishi')

declare module 'koishi' {
    interface Tables {
        mcusers: Users
    }
    interface Users {
        name: string
        player: string
    }
}
export const name = 'cpuz'
export const inject = ['database']
export interface Config { }
export const Config: Schema<Config> = Schema.object({})
const token = '03c6a26425fe97097eb8aa60be3c838fd48150034d6e03881f1ea6685bc36f1b'
const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Content-Type": "application/json"
}
const log = new Logger(name);
let mcqq: MCQQ;

async function initialMcUserTable(ctx: Context) {
    try{
        if (ctx.model.tables.mcusers == undefined) {
            ctx.model.extend('mcusers', {
                name: { type: 'string' },
                player: { type: 'string' },
            }, {
                primary: 'name',
                unique: ['name'],
            })
            return "初始化成功"
        }
    } catch {
        return "初始化失败"
    }
    return "已完成初始化"
}

async function getUser(ctx: Context, user) {
    try {
        const response = await ctx.http.post("http://127.0.0.1/koishi/API", {
            token: token,
            user: user,
			mode: "getUser"
        }, {
            timeout: 0,
            headers: headers,
        });
        if (typeof response === 'string') {
            return response;
        } else if (response.code === 0) {
            return false;
        } else if (response.code === 1) {
            return true;
        }
        return "未知错误，请联系管理员";
    } catch (e) {
        log.error(e);
        return "连接失败";
    }
}

export function apply(ctx: Context) {

    mcqq = new MCQQ(11223, "liert");
    log.info("RCON服务[11223]");
    ctx.command('初始化')
        .action(async ({ session }, message) => {
            session.send(await initialMcUserTable(ctx));
        });
    // ctx.command('测试')
    //     .action(async ({ session }, message) => {
    //         session.send("channelId" + session.channelId);
    //         session.send("guildId" + session.guildId);
    //         mcqq.sendMessage(message);
    //     });
    ctx.command('send <message:text>')
        .action(async ({ session }, message) => {
            session.send(await mcqq.exec(message));
        });
    ctx.command('绑定 <message>')
        .action(async ({ session }, message) => {
            try {
                if (ctx.model.tables.mcusers == undefined) {
                    return session.send("数据库未初始化");
                }
                const result = await getUser(ctx, message);
                if (typeof(result) === 'string') {
                    return session.send(result)
                }
                if (result) {
                    await ctx.database.create('mcusers', { name: session.userId, player: message });
                    session.send("绑定成功: " + message);
                } else {
                    session.send("用户 " + message + " 未在服务器注册");
                }
                
            } catch (error) {
                session.send("一个QQ只能绑定一个MC账号。");
            }
        });
    // ctx.command('重载')
    //     .action(async ({ session }, message) => {
    //         await ctx.database.drop('mcusers');
    //         await initialMcUserTable(ctx);
    //         session.send("重载成功，Debug阶段使用");
    //     });
    ctx.command('查询')
        .action(async ({ session }, message) => {
            if (ctx.model.tables.mcusers == undefined) {
                return session.send("数据库未初始化");
            }
            const results = await ctx.database.get('mcusers', {name: session.userId});
            if (results.length == 0) {
                return session.send('未绑定用户');
            }
            session.send("当前绑定用户: " + results[0].player);
        });
    
}
