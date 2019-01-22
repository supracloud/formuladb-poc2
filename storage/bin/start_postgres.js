// Starting Postgres container, cross platform
var shell = require('shelljs');

if (!shell.which('docker')) {
    shell.echo('Sorry, this script requires git');
    shell.exit(1);
} else {
    shell.echo('Docker found. Starting postgres container ...')
}

if (shell.exec('docker inspect --format="{{ .State.Status }}" formuladb-pg').code == 0) {

    shell.echo('formuladb-pg container already present. Starting it, just in case ...');
    shell.exec('docker start formuladb-pg');

} else if (shell.exec('docker run -d --name formuladb-pg -p 5432:5432 -e \'POSTGRES_PASSWORD=p@ssw0rd42\' postgres:latest').code !== 0) {

        shell.echo('Error: Failed to start Postgres container');
        shell.exit(1);
} else {
    shell.echo('Successfuly started FormulaDB potgres container');
}

shell.exit(0);
