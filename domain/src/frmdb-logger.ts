import * as Debug from "debug";

export class FrmdbLogger {
    private debugLogger;
    private infoLogger;
    private warnLogger;
    private errorLogger;
    
    constructor(name: string) {
        this.debugLogger = Debug(name + ":debug");
        this.infoLogger = Debug(name + ":info");
        this.warnLogger = Debug(name + ":warn");
        this.errorLogger = Debug(name + ":err");
    }

    public debug(string, ...params) {
        this.debugLogger(string, ...params);
    }
    public log(string, ...params) {
        this.infoLogger(string, ...params);
    }
    public info(string, ...params) {
        this.infoLogger(string, ...params);
    }
    public warn(string, ...params) {
        this.warnLogger(string, ...params);
    }
    public error(string, ...params) {
        this.errorLogger(string, ...params);
    }
}
