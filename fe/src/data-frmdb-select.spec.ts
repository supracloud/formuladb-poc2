/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

const fetchMock = require('fetch-mock');

import { normalizeHTML } from "@fe/fe-test-urils.spec";
import { FrmdbSelect } from "./data-frmdb-select";

export const frmdbSelectHtml = /* html */`
<div class="dropdown" data-frmdb-select>
  <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
    Dropdown button
  </button>
  <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
    <a class="dropdown-item" href="#">Action</a>
    <a class="dropdown-item" href="#">Another action</a>
    <a class="dropdown-item" href="#">Something else here</a>
  </div>
</div>   
`;

describe('data-frmdb-select', () => {
    it('should work ok', async (done) => { 
        let root = document.createElement('div');
        root.innerHTML = frmdbSelectHtml;

        let frmdbSelect = new FrmdbSelect(root.querySelector('[data-frmdb-select]') as any);

        done();
    });
});
