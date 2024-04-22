import Rcon from 'rcon-ts';

export class MCQQ {
    private rcon: Rcon;

    constructor(port: number, password: string) {
        this.rcon = new Rcon({
            host: "127.0.0.1",
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