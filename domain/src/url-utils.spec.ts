import { parsePageUrl, PageOpts } from "./url-utils";

describe('url-utils', () => {
    it('should parse page URL', () => {
        let ret = parsePageUrl('/en-basic-1a1a1a-ffffff-Clean-e/frmdb-apps/testApp/test-page.html');

        let expectedPageOpts: PageOpts = { 
            lang: 'en', 
            look: 'basic', 
            primaryColor: "1a1a1a", 
            secondaryColor: "ffffff", 
            theme: "Clean" ,
            editorOpts: '$E$',
            tenantName: 'apps',
            appName: 'testApp',
            pageName: 'test-page.html',
        };

        expect(ret).toEqual(expectedPageOpts);

    });
});
