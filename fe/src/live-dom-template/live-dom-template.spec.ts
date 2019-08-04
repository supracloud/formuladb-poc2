/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

const pretty = require('pretty');
export function normalizeHTML(html: string): string[] {
    return pretty(html, {ocd: true}).split(/\n/);
}

export function wrapHTML(html: string): HTMLElement {
    let div = document.createElement('div');
    div.innerHTML = html;

    return div;
}

import { updateDOM, serializeElemToObj } from "./live-dom-template";

const template = /*html*/`
<div data-frmdb-foreach="tableName[]" data-frmdb-attr="class[row1|row2]::tableName[].name">
    <div data-frmdb-foreach="tableName[].childTable[]" data-frmdb-attr="!disabled::tableName[].cls">
        <div data-frmdb-value="::tableName[].childTable[].x" data-frmdb-attr="attr-from-parent::topObj.a" 
            data-frmdb-attr2="second-attr::tableName[].atr">blabla</div>
        <div data-frmdb-value=":topObj:secondTopObj.f1" data-frmdb-attr="at1:topObj:secondTopObj.f2"
            data-frmdb-attr3="at2:secondTopObj:tableName[].childTable[].x"></div>
        <i data-frmdb-if="::tableName[].cls" data-frmdb-prop="gigi::tableName[].childTable[].x"></i>
    </div>
    <ul data-frmdb-attr="style.background-color::tableName[].bg">
        <li data-frmdb-attr="my-attr::tableName[].atr" data-frmdb-value="::tableName[].name"><label data-frmdb-label></label></li>
        <li data-frmdb-attr="class.my-class::tableName[].cls" data-frmdb-value="::tableName[].description" data-frmdb-attr2="class[row1|row2]::tableName[].name"><label data-frmdb-label></label></li>
    </ul>
    <span data-frmdb-prop="complex::tableName[].childTable"></span>
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


describe('[FE] FrmdbTemplate', () => {
    beforeEach(() => {
    });

    it('should update view when template OR data changes', () => {
        let el = wrapHTML(template);
        updateDOM(data, el)

        let renderedHtml = el.outerHTML;
        let normalizedHtml = normalizeHTML(renderedHtml);
        expect(normalizedHtml).toEqual(normalizeHTML(    
            /*html*/`
            <div>
                <div data-frmdb-foreach="tableName[]" data-frmdb-attr="class[row1|row2]::tableName[].name" class="row1">
                    <div data-frmdb-foreach="tableName[].childTable[]" data-frmdb-attr="!disabled::tableName[].cls" disabled="disabled">
                        <div data-frmdb-value="::tableName[].childTable[].x" data-frmdb-attr="attr-from-parent::topObj.a" data-frmdb-attr2="second-attr::tableName[].atr" attr-from-parent="12" second-attr="attr1">1.1</div>
                        <div data-frmdb-value=":topObj:secondTopObj.f1" data-frmdb-attr="at1:topObj:secondTopObj.f2" data-frmdb-attr3="at2:secondTopObj:tableName[].childTable[].x" at2="F1.1" at1="12">15</div>
                        <i data-frmdb-if="::tableName[].cls" data-frmdb-prop="gigi::tableName[].childTable[].x"></i>
                    </div>
                    <ul data-frmdb-attr="style.background-color::tableName[].bg" style="background-color: red;">
                        <li data-frmdb-attr="my-attr::tableName[].atr" data-frmdb-value="::tableName[].name" my-attr="attr1"><label data-frmdb-label=""></label>row1</li>
                        <li data-frmdb-attr="class.my-class::tableName[].cls" data-frmdb-value="::tableName[].description"  data-frmdb-attr2="class[row1|row2]::tableName[].name" class="row1 my-class"><label data-frmdb-label=""></label>desc of row 1</li>
                    </ul>
                    <span data-frmdb-prop="complex::tableName[].childTable"></span>
                    <div data-frmdb-foreach="tableName[].childTable[]" data-frmdb-attr="!disabled::tableName[].cls" disabled="disabled">
                        <div data-frmdb-value="::tableName[].childTable[].x" data-frmdb-attr="attr-from-parent::topObj.a" data-frmdb-attr2="second-attr::tableName[].atr" attr-from-parent="12" second-attr="attr1">1.2</div>
                        <div data-frmdb-value=":topObj:secondTopObj.f1" data-frmdb-attr="at1:topObj:secondTopObj.f2" data-frmdb-attr3="at2:secondTopObj:tableName[].childTable[].x" at2="F1.2" at1="12">15</div>
                        <i data-frmdb-if="::tableName[].cls" data-frmdb-prop="gigi::tableName[].childTable[].x"></i>
                    </div>
                </div>
                <div data-frmdb-foreach="tableName[]" data-frmdb-attr="class[row1|row2]::tableName[].name" class="row2">
                    <div data-frmdb-foreach="tableName[].childTable[]" data-frmdb-attr="!disabled::tableName[].cls">
                        <div data-frmdb-value="::tableName[].childTable[].x" data-frmdb-attr="attr-from-parent::topObj.a" data-frmdb-attr2="second-attr::tableName[].atr" attr-from-parent="12" second-attr="attr2">2.1</div>
                        <div data-frmdb-value=":topObj:secondTopObj.f1" data-frmdb-attr="at1:topObj:secondTopObj.f2" data-frmdb-attr3="at2:secondTopObj:tableName[].childTable[].x" at2="F2.1" at1="12">15</div>
                        <template data-frmdb-if="::tableName[].cls"><i data-frmdb-if="::tableName[].cls" data-frmdb-prop="gigi::tableName[].childTable[].x"></i></template>
                    </div>
                    <ul data-frmdb-attr="style.background-color::tableName[].bg" style="background-color: blue;">
                        <li data-frmdb-attr="my-attr::tableName[].atr" data-frmdb-value="::tableName[].name" my-attr="attr2"><label data-frmdb-label=""></label>row2</li>
                        <li data-frmdb-attr="class.my-class::tableName[].cls" data-frmdb-value="::tableName[].description" data-frmdb-attr2="class[row1|row2]::tableName[].name" class="row2"><label data-frmdb-label=""></label>desc of row 2</li>
                    </ul>
                    <span data-frmdb-prop="complex::tableName[].childTable"></span>
                    <div data-frmdb-foreach="tableName[].childTable[]" data-frmdb-attr="!disabled::tableName[].cls">
                        <div data-frmdb-value="::tableName[].childTable[].x" data-frmdb-attr="attr-from-parent::topObj.a" data-frmdb-attr2="second-attr::tableName[].atr" attr-from-parent="12" second-attr="attr2">2.2</div>
                        <div data-frmdb-value=":topObj:secondTopObj.f1" data-frmdb-attr="at1:topObj:secondTopObj.f2" data-frmdb-attr3="at2:secondTopObj:tableName[].childTable[].x" at2="F2.2" at1="12">15</div>
                        <template data-frmdb-if="::tableName[].cls"><i data-frmdb-if="::tableName[].cls" data-frmdb-prop="gigi::tableName[].childTable[].x"></i></template>
                    </div>
                </div>
            </div> 
        `));

        //check data-frmdb-prop data bindings
        let elemsWithProps = Array.from(el.querySelectorAll('i[data-frmdb-prop="gigi::tableName[].childTable[].x"]'))
            .map(el => ({gigi: el['gigi'], attrExpandedVal: el['data-frmdb-prop']}));
        expect(elemsWithProps).toEqual([
            {gigi: '1.1', attrExpandedVal: 'gigi::tableName[0].childTable[0].x'},
            {gigi: '1.2', attrExpandedVal: 'gigi::tableName[0].childTable[1].x'},
        ]);

        let elemsWithComplexProps = Array.from(el.querySelectorAll('span[data-frmdb-prop="complex::tableName[].childTable"]'))
            .map(el => ({complex: el['complex'], attrExpandedVal: el['data-frmdb-prop']}));
        expect(elemsWithComplexProps).toEqual([
            {complex: [{x: "1.1"}, {x: "1.2"}], attrExpandedVal: 'complex::tableName[0].childTable'},
            {complex: [{x: "2.1"}, {x: "2.2"}], attrExpandedVal: 'complex::tableName[1].childTable'},
        ]);
    });

    it('should serialize element to DataObj', () => {
        let el = wrapHTML(/*html*/`
            <div data-frmdb-foreach="tableName[]" data-frmdb-attr="class[row1|row2]::tableName[].name">
                <div data-frmdb-foreach="tableName[].childTable[]" data-frmdb-attr="!disabled::tableName[].cls">
                    <div data-frmdb-value="::tableName[].childTable[].x" data-frmdb-attr="attr-from-parent::topObj.a">
                    </div>
                </div>
                <input type="text" data-frmdb-value="::tableName[].atr" />
            </div>
        `);
        updateDOM(data, el);

        let rootEl = el.querySelector('[data-frmdb-foreach="tableName[]"]');
        let obj = serializeElemToObj(rootEl as HTMLElement);
        expect(obj).toEqual({
            atr: "attr1",
        });
    });
});
