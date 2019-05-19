import * as isNode from 'detect-node';

export async function getJqueryImpl(): Promise<JQueryStatic> {
    if (isNode) {
        return await import("cheerio");
    } else {
        return await import("jquery");
    }
}