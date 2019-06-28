const pretty = require('pretty');

import { parseHTML, writeHTML } from "./dom-node";
import { updateDOM } from "./live-dom-template";

const template = /*html*/`
<div data-frmdb-foreach="tableName[]">
    <ul data-frmdb-attr="style.background-color:tableName[].bg">
        <li data-frmdb-attr="my-attr:tableName[].atr" data-frmdb-value="tableName[].name"><label data-frmdb-label></label></li>
        <li data-frmdb-attr="class.my-class:tableName[].cls" data-frmdb-value="tableName[].description"><label data-frmdb-label></label></li>
    </ul>
    <div data-frmdb-foreach="tableName[].childTable[]">
        <div data-frmdb-value="tableName[].childTable[].x" data-frmdb-attr="attr-from-parent:topObj.a" data-frmdb-attr2="second-attr:my-attr:tableName[].atr">blabla</div>
    </div>    
</div>
`;

let data = {
    topObj: {a: 12},
    tableName: [
        { name: "row1", description: "desc of row 1", bg: "red", cls: true, atr: "attr1", childTable: [{x: "1.1"}, {x: "1.2"}] },
        { name: "row2", description: "desc of row 2", bg: "blue", cls: false, atr: "attr2", childTable: [{x: "2.1"}, {x: "2.1"}] },
    ]
};

function normalizeHTML(html: string): string[] {
    return pretty(html.replace(/\n\s*/g, '')).split(/\n\s*/);
}

describe('FrmdbTemplate', () => {
    beforeEach(() => {
    });

    fit('should update view when template OR data changes', () => {
        let el = parseHTML(template);
        updateDOM(data, el)
        let renderedHtml = writeHTML(el);
        expect(normalizeHTML(renderedHtml)).toEqual(normalizeHTML(/*html*/`
            <body xmlns="http://www.w3.org/1999/xhtml">
                <div data-frmdb-foreach="tableName[]">
                    <ul data-frmdb-attr="style.background-color:tableName[].bg" style="background-color: red;">
                        <li data-frmdb-attr="my-attr:tableName[].atr" data-frmdb-value="tableName[].name" my-attr="attr1"><label data-frmdb-label=""></label>row1</li>
                        <li data-frmdb-attr="class.my-class:tableName[].cls" data-frmdb-value="tableName[].description" class="my-class"><label data-frmdb-label=""></label>desc of row 1</li>
                    </ul>
                    <div data-frmdb-foreach="tableName[].childTable[]">
                        <div data-frmdb-value="tableName[].childTable[].x" data-frmdb-attr2="second-attr:my-attr:tableName[].atr" data-frmdb-attr="attr-with-value-from-parent:topObj.a" attr-from-parent="12" second-attr="attr1">1.1</div>
                    </div>
                    <div data-frmdb-foreach="tableName[].childTable[]">
                        <div data-frmdb-value="tableName[].childTable[].x" data-frmdb-attr2="second-attr:my-attr:tableName[].atr" data-frmdb-attr="attr-with-value-from-parent:topObj.a" attr-from-parent="12" second-attr="attr1">1.2</div>
                    </div>
                </div>
                <div data-frmdb-foreach="tableName[]">
                    <ul data-frmdb-attr="style.background-color:tableName[].bg" style="background-color: blue;">
                        <li data-frmdb-attr="my-attr:tableName[].atr" data-frmdb-value="tableName[].name" my-attr="attr2"><label data-frmdb-label=""></label>row2</li>
                        <li data-frmdb-attr="class.my-class:tableName[].cls" data-frmdb-value="tableName[].description" class=""><label data-frmdb-label=""></label>desc of row 2</li>
                    </ul>
                    <div data-frmdb-foreach="tableName[].childTable[]">
                        <div data-frmdb-value="tableName[].childTable[].x" data-frmdb-attr2="second-attr:my-attr:tableName[].atr" data-frmdb-attr="attr-with-value-from-parent:topObj.a" attr-from-parent="12" second-attr="attr2">2.1</div>
                    </div>
                    <div data-frmdb-foreach="tableName[].childTable[]">
                        <div data-frmdb-value="tableName[].childTable[].x" data-frmdb-attr2="second-attr:my-attr:tableName[].atr" data-frmdb-attr="attr-with-value-from-parent:topObj.a" attr-from-parent="12" second-attr="attr2">2.1</div>
                    </div>
                </div>
            </body> 
        `));
    })
});
