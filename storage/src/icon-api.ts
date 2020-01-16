var OAuth = require('oauth')
// `npm install oauth` to satisfy
// website: https://github.com/ciaranj/node-oauth

var KEY = "03f31006c08243aa8ed4ddeb0070621b"
var SECRET = "0e79c46aea304f398c6dd02be671e049"

var oauth = new OAuth.OAuth(
	'http://api.thenounproject.com',
	'http://api.thenounproject.com',
	KEY,
	SECRET,
	'1.0',
	null,
	'HMAC-SHA1'
)
oauth.get(
	'http://api.thenounproject.com/icon/6324',
	null,
	null,
	function (e, data, res){
		if (e) console.error(e)
		console.log(require('util').inspect(data))
	}
)