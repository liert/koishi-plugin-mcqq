import Rcon from 'rcon-ts';

export class RCON {
    private rcon: Rcon;

    constructor(host: string, port: number, password: string) {
        this.rcon = new Rcon({
            host: host,
            port: port, 
            password: password,
            timeout: 5000
        });
        this.rcon.connect();
    }
    public exec(command: string) {
        return this.rcon.send(command);
    }
    public close(){
        this.rcon.disconnect();
    }
}