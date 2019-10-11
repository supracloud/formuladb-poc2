const http = require('http');
const express = require("express");
const proxy = require('http-proxy-middleware');
const path = require('path');

var app = express();

const mapFiles = ['frmdb-data-grid.js.map', 'frmdb-fe.js.map', 'frmdb-editor.js.map'];
for (let f of mapFiles) {
    app.get(`/formuladb/${f}`, function (req, res, next) {
        res.sendFile(path.join(__dirname, 'dist-fe', f));
    });    
}

app.use(proxy({
    target: 'https://88fcb75324de986d97b18634d37fcc7b7262d6dd.formuladb.io/',
    changeOrigin: true,
    proxyTimeout: 500,
    secure: false,
    logLevel: "debug",
}));

const server = http.createServer(app);

const port = 8082;
server.listen(port);

server.on('error', (e) => {
    console.log('Error starting server' + e);
});

server.on('listening', () => {
    console.log('Server started on port ' + port);
});
