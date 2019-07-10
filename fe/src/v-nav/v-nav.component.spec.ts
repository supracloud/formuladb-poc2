/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

const { JSDOM } = require('jsdom');

const jsdom = new JSDOM(/* html */`
<!doctype html>
<html>
<body>
    <frmdb-v-nav></frmdb-v-nav>
    <script src="formuladb/frmdb-editor.js"></script>
</body>
</html>
`);
let Doc: Document = jsdom.window.document;

describe('VNavComponent', () => {
    beforeEach(() => {
    });

    fit('should render', () => {
        let cmp = Doc.querySelector('frmdb-v-nav');
        console.error(cmp!.innerHTML);
    })
});
