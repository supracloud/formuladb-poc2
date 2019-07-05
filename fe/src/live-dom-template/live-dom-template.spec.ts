const pretty = require('pretty');

import { parseHTML, writeHTML, getValueForDomExpandedKey } from "./dom-node";
import { updateDOM } from "./live-dom-template";

const template = /*html*/`
<div data-frmdb-foreach="tableName[]" data-frmdb-attr="class[row1|row2]::tableName[].name">
    <ul data-frmdb-attr="style.background-color::tableName[].bg">
        <li data-frmdb-attr="my-attr::tableName[].atr" data-frmdb-value="::tableName[].name"><label data-frmdb-label></label></li>
        <li data-frmdb-attr="class.my-class::tableName[].cls" data-frmdb-value="::tableName[].description" data-frmdb-attr2="class[row1|row2]::tableName[].name"><label data-frmdb-label></label></li>
    </ul>
    <div data-frmdb-foreach="tableName[].childTable[]" data-frmdb-attr="!disabled::tableName[].cls">
        <div data-frmdb-value="::tableName[].childTable[].x" data-frmdb-attr="attr-from-parent::topObj.a" 
            data-frmdb-attr2="second-attr::tableName[].atr">blabla</div>
        <div data-frmdb-value=":topObj:secondTopObj.f1" data-frmdb-attr="at1:topObj:secondTopObj.f2"
            data-frmdb-attr3="at2:secondTopObj:tableName[].childTable[].x"></div>
        <i data-frmdb-if="::tableName[].cls" data-frmdb-prop="gigi::tableName[].childTable[].x"></i>
    </div>
</div>
`;

let data = {
    topObj: {a: 12, b: 15},
    tableName: [
        { name: "row1", description: "desc of row 1", bg: "red", cls: true, atr: "attr1", childTable: [{x: "1.1"}, {x: "1.2"}] },
        { name: "row2", description: "desc of row 2", bg: "blue", cls: false, atr: "attr2", childTable: [{x: "2.1"}, {x: "2.2"}] },
    ],
    secondTopObj: {
        f1: "b", 
        f2: "a",
        "1.1": "F1.1",
        "1.2": "F1.2",
        "2.1": "F2.1",
        "2.2": "F2.2",
    }
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
                <div data-frmdb-foreach="tableName[]" data-frmdb-attr="class[row1|row2]::tableName[].name" class="row1">
                    <ul data-frmdb-attr="style.background-color::tableName[].bg" style="background-color: red;">
                        <li data-frmdb-attr="my-attr::tableName[].atr" data-frmdb-value="::tableName[].name" my-attr="attr1"><label data-frmdb-label=""></label>row1</li>
                        <li data-frmdb-attr="class.my-class::tableName[].cls" data-frmdb-value="::tableName[].description"  data-frmdb-attr2="class[row1|row2]::tableName[].name" class="row1 my-class"><label data-frmdb-label=""></label>desc of row 1</li>
                    </ul>
                    <div data-frmdb-foreach="tableName[].childTable[]" data-frmdb-attr="!disabled::tableName[].cls" disabled="disabled">
                        <div data-frmdb-value="::tableName[].childTable[].x" data-frmdb-attr="attr-from-parent::topObj.a" data-frmdb-attr2="second-attr::tableName[].atr" attr-from-parent="12" second-attr="attr1">1.1</div>
                        <div data-frmdb-value=":topObj:secondTopObj.f1" data-frmdb-attr="at1:topObj:secondTopObj.f2" data-frmdb-attr3="at2:secondTopObj:tableName[].childTable[].x" at2="F1.1" at1="12">15</div>
                        <i data-frmdb-if="::tableName[].cls" data-frmdb-prop="gigi::tableName[].childTable[].x"></i>
                    </div>
                    <div data-frmdb-foreach="tableName[].childTable[]" data-frmdb-attr="!disabled::tableName[].cls" disabled="disabled">
                        <div data-frmdb-value="::tableName[].childTable[].x" data-frmdb-attr="attr-from-parent::topObj.a" data-frmdb-attr2="second-attr::tableName[].atr" attr-from-parent="12" second-attr="attr1">1.2</div>
                        <div data-frmdb-value=":topObj:secondTopObj.f1" data-frmdb-attr="at1:topObj:secondTopObj.f2" data-frmdb-attr3="at2:secondTopObj:tableName[].childTable[].x" at2="F1.2" at1="12">15</div>
                        <i data-frmdb-if="::tableName[].cls" data-frmdb-prop="gigi::tableName[].childTable[].x"></i>
                    </div>
                </div>
                <div data-frmdb-foreach="tableName[]" data-frmdb-attr="class[row1|row2]::tableName[].name" class="row2">
                    <ul data-frmdb-attr="style.background-color::tableName[].bg" style="background-color: blue;">
                        <li data-frmdb-attr="my-attr::tableName[].atr" data-frmdb-value="::tableName[].name" my-attr="attr2"><label data-frmdb-label=""></label>row2</li>
                        <li data-frmdb-attr="class.my-class::tableName[].cls" data-frmdb-value="::tableName[].description" data-frmdb-attr2="class[row1|row2]::tableName[].name" class="row2"><label data-frmdb-label=""></label>desc of row 2</li>
                    </ul>
                    <div data-frmdb-foreach="tableName[].childTable[]" data-frmdb-attr="!disabled::tableName[].cls">
                        <div data-frmdb-value="::tableName[].childTable[].x" data-frmdb-attr="attr-from-parent::topObj.a" data-frmdb-attr2="second-attr::tableName[].atr" attr-from-parent="12" second-attr="attr2">2.1</div>
                        <div data-frmdb-value=":topObj:secondTopObj.f1" data-frmdb-attr="at1:topObj:secondTopObj.f2" data-frmdb-attr3="at2:secondTopObj:tableName[].childTable[].x" at2="F2.1" at1="12">15</div>
                        <template data-frmdb-if="::tableName[].cls"><i data-frmdb-if="::tableName[].cls" data-frmdb-prop="gigi::tableName[].childTable[].x"></i></template>
                    </div>
                    <div data-frmdb-foreach="tableName[].childTable[]" data-frmdb-attr="!disabled::tableName[].cls">
                        <div data-frmdb-value="::tableName[].childTable[].x" data-frmdb-attr="attr-from-parent::topObj.a" data-frmdb-attr2="second-attr::tableName[].atr" attr-from-parent="12" second-attr="attr2">2.2</div>
                        <div data-frmdb-value=":topObj:secondTopObj.f1" data-frmdb-attr="at1:topObj:secondTopObj.f2" data-frmdb-attr3="at2:secondTopObj:tableName[].childTable[].x" at2="F2.2" at1="12">15</div>
                        <template data-frmdb-if="::tableName[].cls"><i data-frmdb-if="::tableName[].cls" data-frmdb-prop="gigi::tableName[].childTable[].x"></i></template>
                    </div>
                </div>
            </body> 
        `));

        //check data-frmdb-prop data bindings
        let elemsWithProps = Array.from(el.querySelectorAll('i[data-frmdb-prop="gigi::tableName[].childTable[].x"]'))
            .map(el => ({gigi: el['gigi'], attrExpandedVal: el['data-frmdb-prop']}));
        expect(elemsWithProps).toEqual([
            {gigi: '1.1', attrExpandedVal: 'gigi::tableName[0].childTable[0].x'},
            {gigi: '1.2', attrExpandedVal: 'gigi::tableName[0].childTable[1].x'},
        ]);
    })
});
