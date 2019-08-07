const TOKEN = "T8fpbohTXHdsE9yVsL1s";

import { RepositoryFiles, Projects } from 'gitlab';

const repositoryFiles = new RepositoryFiles({
    host: 'http://gitlab.com',
    token: TOKEN,
});

export async function savePage(tenantName: string, appName: string, pageName: string, html: string) {
    return repositoryFiles.edit(`${tenantName}/${appName}`, `${pageName}.html`, 'master', html, "n/a");
}

export async function getPage(tenantName: string, appName: string, pageName: string) {
    return repositoryFiles.showRaw(`${tenantName}/${appName}`, `${pageName}.html`, 'master');
}

export async function getFile(tenantName: string, appName: string, filePath: string) {
    return repositoryFiles.showRaw(`${tenantName}/${appName}`, filePath, 'master');
}

// Examples:
// curl -s -XGET --header 'PRIVATE-TOKEN: T8fpbohTXHdsE9yVsL1s' https://gitlab.com/api/v4/projects/frmdb-apps%2Fhotel-booking | jq
// curl -s -XGET --header 'PRIVATE-TOKEN: T8fpbohTXHdsE9yVsL1s' https://gitlab.com/api/v4/projects/frmdb-apps%2Fhotel-booking/repository/files/index.html?ref=master | jq
// curl -s -XGET --header 'PRIVATE-TOKEN: T8fpbohTXHdsE9yVsL1s' https://gitlab.com/api/v4/projects/frmdb-apps%2Fhotel-booking/repository/files/index.html/raw?ref=master | jq
// curl -s -XGET --header 'PRIVATE-TOKEN: T8fpbohTXHdsE9yVsL1s' https://gitlab.com/api/v4/projects/frmdb-themes%2Froyal-master/repository/files/js%2Fstellar.js/raw?ref=master | jq
