/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as fetch from 'node-fetch';
import { GitStorageI } from './git-storage-i';

const TOKEN = "T8fpbohTXHdsE9yVsL1s";

export class GitStorage implements GitStorageI {
    async getFiles(tenantName: string, appName: string) {
        return fetch(`https://gitlab.com/api/v4/projects/${tenantName}%2F${appName}/repository/tree?ref=develop`, {
            method: 'GET',
            headers: { 'PRIVATE-TOKEN': TOKEN }
        })
            .then(function (response) {
                return response.json();
            });
    }

    async getPages(tenantName: string, appName: string): Promise<string[]> {
        return this.getFiles(tenantName, appName).then(files => files.map(f => f.name));
    }

    async savePage(tenantName: string, appName: string, pageName: string, html: string) {
        return fetch(`https://gitlab.com/api/v4/projects/metawiz%2Ffebe/repository/files/apps/${tenantName}/${appName}/${pageName}`, {
            method: 'PUT',
            body: JSON.stringify({
                branch: "develop",
                // author_email: "cristualexandru@gmail.com",
                content: html,
                commit_message: "update via frmdb-editor"
            }),
            headers: {
                'Content-Type': 'application/json',
                'PRIVATE-TOKEN': TOKEN,
            }
        }).catch(err => {
            console.error(err);
            throw err;
        }).then(x => {
            console.warn(x);
            return x;
        });
    }


    async getPageContent(tenantName: string, appName: string, pageName: string): Promise<string> {
        return fetch(`https://gitlab.com/api/v4/projects/${tenantName}%2F${appName}/repository/files/${pageName}?ref=develop`, {
            method: 'GET',
            headers: { 'PRIVATE-TOKEN': TOKEN }
        }).then((response) => {
            return response.json();
        }).then(res => {
            if (res.encoding != 'base64') throw new Error(`Unknown encoding ${res.encoding} for ${tenantName}/${appName}/${pageName}`)
            return Buffer.from(res.content, 'base64').toString();
        });
    }

    async getFile(tenantName: string, appName: string, filePath: string) {
        return fetch(`https://gitlab.com/api/v4/projects/${tenantName}%2F${appName}/repository/files/${encodeURIComponent(filePath)}/raw?ref=develop`, {
            method: 'GET',
            headers: { 'PRIVATE-TOKEN': TOKEN }
        });
    }
}

/*
Examples:
curl -s -XGET --header 'PRIVATE-TOKEN: T8fpbohTXHdsE9yVsL1s' https://gitlab.com/api/v4/projects/frmdb-apps%2Fhotel-booking | jq
curl -s -XGET --header 'PRIVATE-TOKEN: T8fpbohTXHdsE9yVsL1s' https://gitlab.com/api/v4/projects/frmdb-apps%2Fhotel-booking/repository/files/index.html?ref=develop | jq
curl -s -XGET --header 'PRIVATE-TOKEN: T8fpbohTXHdsE9yVsL1s' https://gitlab.com/api/v4/projects/frmdb-apps%2Fhotel-booking/repository/files/index.html/raw?ref=develop | jq
curl -s -XGET --header 'PRIVATE-TOKEN: T8fpbohTXHdsE9yVsL1s' https://gitlab.com/api/v4/projects/frmdb-themes%2Froyal-master/repository/files/js%2Fstellar.js/raw?ref=develop | jq

curl -v --request PUT --header 'PRIVATE-TOKEN: T8fpbohTXHdsE9yVsL1s' --header "Content-Type: application/json" \
    --data '{"branch": "develop", "author_email": "cristualexandru@gmail.com", "content": "<html>blasdaa bla</html>", "commit_message": "update file"}' \
    'https://gitlab.com/api/v4/projects/frmdb-apps%2Fhotel-booking/repository/files/tst'
*/
