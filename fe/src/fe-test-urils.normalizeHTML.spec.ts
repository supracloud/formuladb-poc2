import { HTMLTools } from "@core/html-tools";

const htmlTools = new HTMLTools(document, new DOMParser());

describe('normalizeHtml', () => {
    beforeEach(() => {
    });
    
    it('should indent html correctly', () => {
        expect(htmlTools.normalizeHTML(/*html*/`<div>
            <a data-frmdb-table="asyncFunc[]" data-frmdb-value="asyncFunc[]"></a></div>
        `)).toEqual([
            '',
            '<div>',
            '    <a data-frmdb-table="asyncFunc[]" data-frmdb-value="asyncFunc[]"></a>',
            '</div>',
            ''
        ]);
    })
});
