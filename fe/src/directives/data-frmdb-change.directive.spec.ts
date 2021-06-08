/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

const fetchMock = require('fetch-mock');
import { DirectivesService } from "./directives.service";

export const html = /* html */`
<section data-frmdb-bind-to-record="$FRMDB.A~~">
<input type="text" data-frmdb-value="$FRMDB.A{}.a1" />
<p data-frmdb-value="$FRMDB.A{}.a2"></p>
<article>
<div data-frmdb-table="$FRMDB.B[]">
<a href="javascript:void()" data-frmdb-change="click:$FRMDB.B[].b1:$FRMDB.A{}.a1" data-frmdb-value="$FRMDB.B[].b1">val1</a>
</div>
<div data-frmdb-table="$FRMDB.B[]" data-frmdb-record="B~~abcde">
<a href="javascript:void()" data-frmdb-value="$FRMDB.B[].b2">val2</a>
<button data-frmdb-change="click:$FRMDB.B[]._id:$FRMDB.A{}.a2">
</div>
</article>
</section>
`;

describe('data-frmdb-change', () => {
    beforeEach(() => {
        fetchMock.post(/\/formuladb-api\/.*/, (url, req) => {
            console.log("api call: " + url + " " + JSON.stringify(req.body));
            return req.body;
        });
    });
    afterEach(() => {
        fetchMock.restore();
    });
    it('should work ok', async () => {
        document.body.innerHTML = html;
        new DirectivesService(document.body).init();
        
        let a = document.querySelector<HTMLAnchorElement>(`[data-frmdb-table="$FRMDB.B[]"]:nth-child(1) a`);
        let inp = document.querySelector<HTMLInputElement>(`[data-frmdb-value="$FRMDB.A{}.a1"]`);
        a?.dispatchEvent(new Event('click'));
        expect(inp?.value).toEqual('val1');
        
        let b = document.querySelector<HTMLButtonElement>(`[data-frmdb-table="$FRMDB.B[]"]:nth-child(2) button`);
        let p = document.querySelector<HTMLParagraphElement>(`[data-frmdb-value="$FRMDB.A{}.a2"]`);
        b?.dispatchEvent(new Event('click'));
        expect(p?.innerHTML).toEqual('B~~abcde');

        await new Promise(resolve => setTimeout(resolve, 400));//wait for change event to be processed
    });
});
