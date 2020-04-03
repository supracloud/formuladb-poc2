import { parsePageUrl, PageOpts } from "./url-utils";

describe('url-utils', () => {
    it('should parse page URL', () => {
        let ret = parsePageUrl('/en-basic-1a1a1a-ffffff-Clean/kvsf-test-app-for-specs/test-page.html');

        let expectedPageOpts: PageOpts = { 
            lang: 'en', 
            look: 'basic', 
            primaryColor: "1a1a1a", 
            secondaryColor: "ffffff", 
            theme: "Clean" ,
            appName: 'kvsf-test-app-for-specs',
            pageName: 'test-page',
        };

        expect(ret).toEqual(expectedPageOpts);

    });
});
