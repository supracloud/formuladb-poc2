var fs = require('fs');
var obj = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
var rawConfig = obj[process.env.NODE_ENV || 'development'];

export default class Config {
	public static env: string = process.env.NODE_ENV || 'development';
	public static port: number = rawConfig.port;
	public static transactionsDBUrl: string = rawConfig.transactionsDBUrl;
	public static historyDBUrl: string = rawConfig.historyDBUrl;
}
