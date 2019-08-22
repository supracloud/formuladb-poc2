/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

const fetchMock = require('fetch-mock');

import "./data-frmdb-select";

export const frmdbSelectHtml = /* html */`
<div class="dropdown" data-frmdb-select>
  <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" 
        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
        data-frmdb-select-value>
    opt
  </button>
  <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
    <a class="dropdown-item" data-frmdb-action="select" href="#">opt1</a>
    <a class="dropdown-item" data-frmdb-action="select" href="#">opt2</a>
    <a class="dropdown-item" data-frmdb-action="select" href="#">opt3</a>
    <a class="dropdown-item" data-frmdb-action="select" href="#">opt4</a>
  </div>
</div>   
`;

describe('data-frmdb-select', () => {
    it('should work ok', async (done) => { 
        document.body.innerHTML = frmdbSelectHtml;

        let frmdbSelectValue: HTMLElement = document.querySelector('[data-frmdb-select-value]') as any;
        expect(frmdbSelectValue.innerHTML.trim()).toEqual('opt');

        (document.querySelector('[data-frmdb-action="select"]') as HTMLElement).click();
        expect(frmdbSelectValue.innerHTML.trim()).toEqual('opt1');

        done();
    });
});
