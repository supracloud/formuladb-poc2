const fetch = require('node-fetch');

fetch('https://elasticsearch.formuladb.io/_cat/indices', {
	headers: {
		'Authorization': 'Basic ' + Buffer.from("formuladb:HEwAXwhG5Tqd").toString('base64'),
	},
})
	.then(async (response) => {
		let res = await response.text();
		console.log(res);
	});



const timestamp = moment();
fetch(`https://elasticsearch.formuladb.io/page-${timestamp.format('YYYY-MM-DD')}/_doc`, {
	method: "POST",
	body: JSON.stringify({
		envName: this.envName,
		tenantName,
		appName,
		pageName,
		newPageName,
		newHtml,
		diff,
		'@timestamp': timestamp.format(/*ISO8601*/),
	}),
	headers: {
		'Content-Type': 'application/json',
		'Authorization': 'Basic ' + Buffer.from("formuladb:HEwAXwhG5Tqd").toString('base64'),
	},
})
	.then(async (response) => {
		let res = await response.text();
		console.log(res);
	});
