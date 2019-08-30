/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as fetch from 'node-fetch';

const TOKEN = "T8fpbohTXHdsE9yVsL1s";

export async function getFiles(tenantName: string, appName: string) {
    return fetch(`https://gitlab.com/api/v4/projects/${tenantName}%2F${appName}/repository/tree?ref=master`, {
        method: 'GET',
        headers: { 'PRIVATE-TOKEN': TOKEN }
    })
        .then(function (response) {
            return response.json();
        });
}

export async function getPages(tenantName: string, appName: string): Promise<string[]> {
    return getFiles(tenantName, appName).then(files => files.map(f => f.name));
}

export async function savePage(tenantName: string, appName: string, pageName: string, html: string) {
    return fetch(`https://gitlab.com/api/v4/projects/${tenantName}%2F${appName}/repository/files/${pageName}?ref=master`, {
        method: 'PUT',
        body: html,
        headers: { 'PRIVATE-TOKEN': TOKEN }
    });
}

export async function getPageContent(tenantName: string, appName: string, pageName: string): Promise<string> {
    return fetch(`https://gitlab.com/api/v4/projects/${tenantName}%2F${appName}/repository/files/${pageName}?ref=master`, {
        method: 'GET',
        headers: { 'PRIVATE-TOKEN': TOKEN }
    }).then((response) => {
        return response.json();
    }).then(res => {
        if (res.encoding != 'base64') throw new Error(`Unknown encoding ${res.encoding} for ${tenantName}/${appName}/${pageName}`)
        return Buffer.from(res.content, 'base64').toString();
    });
}

export async function getFile(tenantName: string, appName: string, filePath: string) {
    return fetch(`https://gitlab.com/api/v4/projects/${tenantName}%2F${appName}/repository/files/${encodeURIComponent(filePath)}/raw?ref=master`, {
        method: 'GET',
        headers: { 'PRIVATE-TOKEN': TOKEN }
    });
}

// Examples:
// curl -s -XGET --header 'PRIVATE-TOKEN: T8fpbohTXHdsE9yVsL1s' https://gitlab.com/api/v4/projects/frmdb-apps%2Fhotel-booking | jq
// curl -s -XGET --header 'PRIVATE-TOKEN: T8fpbohTXHdsE9yVsL1s' https://gitlab.com/api/v4/projects/frmdb-apps%2Fhotel-booking/repository/files/index.html?ref=master | jq
// curl -s -XGET --header 'PRIVATE-TOKEN: T8fpbohTXHdsE9yVsL1s' https://gitlab.com/api/v4/projects/frmdb-apps%2Fhotel-booking/repository/files/index.html/raw?ref=master | jq
// curl -s -XGET --header 'PRIVATE-TOKEN: T8fpbohTXHdsE9yVsL1s' https://gitlab.com/api/v4/projects/frmdb-themes%2Froyal-master/repository/files/js%2Fstellar.js/raw?ref=master | jq
