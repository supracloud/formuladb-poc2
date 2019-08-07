/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as fetch from 'node-fetch';

const TOKEN = "T8fpbohTXHdsE9yVsL1s";

export async function savePage(tenantName: string, appName: string, pageName: string, html: string) {
    return fetch(`https://gitlab.com/api/v4/projects/${tenantName}%2F${appName}/repository/files/${pageName}.html?ref=master`, {
        method: 'PUT',
        body: html,
        headers: {'PRIVATE-TOKEN': TOKEN}
    });
}

export async function getPage(tenantName: string, appName: string, pageName: string) {
    return fetch(`https://gitlab.com/api/v4/projects/${tenantName}%2F${appName}/repository/files/${pageName}.html?ref=master`, {
        method: 'GET',
        headers: {'PRIVATE-TOKEN': TOKEN}
    });
}

export async function getFile(tenantName: string, appName: string, filePath: string) {
    return fetch(`https://gitlab.com/api/v4/projects/${tenantName}%2F${appName}/repository/files/${encodeURIComponent(filePath)}/raw?ref=master`, {
        method: 'GET',
        headers: {'PRIVATE-TOKEN': TOKEN}
    });
}

// Examples:
// curl -s -XGET --header 'PRIVATE-TOKEN: T8fpbohTXHdsE9yVsL1s' https://gitlab.com/api/v4/projects/frmdb-apps%2Fhotel-booking | jq
// curl -s -XGET --header 'PRIVATE-TOKEN: T8fpbohTXHdsE9yVsL1s' https://gitlab.com/api/v4/projects/frmdb-apps%2Fhotel-booking/repository/files/index.html?ref=master | jq
// curl -s -XGET --header 'PRIVATE-TOKEN: T8fpbohTXHdsE9yVsL1s' https://gitlab.com/api/v4/projects/frmdb-apps%2Fhotel-booking/repository/files/index.html/raw?ref=master | jq
// curl -s -XGET --header 'PRIVATE-TOKEN: T8fpbohTXHdsE9yVsL1s' https://gitlab.com/api/v4/projects/frmdb-themes%2Froyal-master/repository/files/js%2Fstellar.js/raw?ref=master | jq
