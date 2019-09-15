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
