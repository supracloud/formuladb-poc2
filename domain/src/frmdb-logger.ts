import * as Debug from "debug";

export class FrmdbLogger {
    private loggers: Map<string,any> = new Map();
    
    constructor(private name: string) {
    }

    private getLogger(func: string, level: string) {
        let key = `formuladb:${this.name}:${func}:${level}`;
        let ret = this.loggers.get(key);
        if (!ret) {
            ret = Debug(key);
            this.loggers.set(key, ret);
        }
        return ret;
    }

    public debug(func: string, msg: string, ...params) {
        this.getLogger(func, "debug")(msg, ...params);
    }
    public log(func: string, msg: string, ...params) {
        this.getLogger(func, "info")(msg, ...params);
    }
    public info(func: string, msg: string, ...params) {
        this.getLogger(func, "info")(msg, ...params);
    }
    public warn(func: string, msg: string, ...params) {
        this.getLogger(func, "warn")(msg, ...params);
    }
    public error(func: string, msg: string, ...params) {
        this.getLogger(func, "error")(msg, ...params);
    }
}
