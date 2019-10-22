/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

const fetchMock = require('fetch-mock');

import "./data-frmdb-select.directive";

export const frmdbSelectHtml = /* html */`
<div class="dropdown" data-frmdb-select="i">
  <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" 
        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
    opt
  </button>
  <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
    <a class="dropdown-item" href="#">opt1</a>
    <a class="dropdown-item" href="#">opt2</a>
    <a class="dropdown-item" href="#"><i class="icon3"></i>opt3</a>
    <a class="dropdown-item" href="#">opt4</a>
  </div>
</div>   
`;

describe('data-frmdb-select', () => {
    it('should work ok', async (done) => { 
        document.body.innerHTML = frmdbSelectHtml;

        let frmdbSelectValue: HTMLElement = document.querySelector('[data-frmdb-select] .dropdown-toggle') as any;
        expect(frmdbSelectValue.innerHTML.trim()).toEqual('opt');

        (document.querySelector('[data-frmdb-select] .dropdown-item:nth-child(2)') as HTMLElement).click();
        expect(frmdbSelectValue.innerHTML.trim()).toEqual('opt2');

        (document.querySelector('[data-frmdb-select] .dropdown-item:nth-child(3)') as HTMLElement).click();
        expect(frmdbSelectValue.innerHTML.trim()).toEqual('<i class="icon3"></i>');

        done();
    });
});
