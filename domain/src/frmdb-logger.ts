import * as Debug from "debug";

export class FrmdbLogger {
    private debugLogger;
    private infoLogger;
    private warnLogger;
    private errorLogger;
    
    constructor(name: string) {
        this.debugLogger = Debug("formuladb:" + name + ":debug");
        this.infoLogger = Debug("formuladb:" + name + ":info");
        this.warnLogger = Debug("formuladb:" + name + ":warn");
        this.errorLogger = Debug("formuladb:" + name + ":err");
    }

    public debug(func: string, msg: string, ...params) {
        this.debugLogger(func, msg, ...params);
    }
    public log(func: string, msg: string, ...params) {
        this.infoLogger(func, msg, ...params);
    }
    public info(func: string, msg: string, ...params) {
        this.infoLogger(func, msg, ...params);
    }
    public warn(func: string, msg: string, ...params) {
        this.warnLogger(func, msg, ...params);
    }
    public error(func: string, msg: string, ...params) {
        this.errorLogger(func, msg, ...params);
    }
}
