/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

import { updateDOM, serializeElemToObj, evaluateHardCodedForNowFunctions, computeElementRules } from "./live-dom-template";
import { HTMLTools } from "@core/html-tools";

const htmlTools = new HTMLTools(document, new DOMParser());

export function wrapHTML(html: string): HTMLElement {
    let div = document.createElement('div');
    div.innerHTML = html;

    return div;
}

function fakeAsync<T>(x: T): Promise<T> {
    return new Promise(resolve => setTimeout(() => resolve(x), Math.random() * 10));
}

const template = /*html*/`
<h1 data-frmdb-value=":CONCATENATE('bla-', x):topObj.o"></h1>
<i data-frmdb-table="array[]" data-frmdb-value="array[]"></i>
<h4 data-frmdb-table="topObj.emptyArray[]"></h4>
<div data-frmdb-table="tableName[]" data-frmdb-attr="class[row1|row2]::tableName[].name">
    <a data-frmdb-attr="href:CONCATENATE('../', name):tableName[]">Link</a>
    <span data-frmdb-table="tableName[].childTable[]" data-frmdb-attr="!disabled::tableName[].cls">
        <strong data-frmdb-value="::tableName[].childTable[].x" data-frmdb-attr="attr-from-parent::topObj.a" 
            data-frmdb-attr2="second-attr::tableName[].atr">blabla</strong>
        <p data-frmdb-value=":topObj:secondTopObj.f1" data-frmdb-attr="at1:topObj:secondTopObj.f2"
            data-frmdb-attr3="at2:secondTopObj:tableName[].childTable[].x"></p>
        <i data-frmdb-if="::tableName[].cls" data-frmdb-prop="gigi::tableName[].childTable[].x"></i>
    </span>
    <ul data-frmdb-attr="style.background-color::tableName[].bg">
        <li data-frmdb-attr="my-attr::tableName[].atr" data-frmdb-value="::tableName[].name"><h2 data-frmdb-label></h2></li>
        <li data-frmdb-attr="class.my-class::tableName[].cls" data-frmdb-value="::tableName[].description" data-frmdb-attr2="class[row1|row2]::tableName[].name"><label data-frmdb-label></label></li>
    </ul>
    <h1 data-frmdb-prop="complex::tableName[].childTable"></h1>
</div>
`;

let data = {
    topObj: {a: 12, b: 15, emptyArray: [], o: {x: 1234}},
    array: ['a', 'b', 'c', 'd'],
    tableName: [
        { name: "row1", description: "desc of row 1", bg: () => "red", cls: true, atr: "attr1", childTable: [{x: "1.1"}, {x: "1.2"}] },
        { name: "row2", description: "desc of row 2", bg: () => "blue", cls: false, atr: "attr2", childTable: [{x: "2.1"}, {x: "2.2"}] },
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
        let normalizedHtml = htmlTools.normalizeHTML(renderedHtml);
        let expectedNormalizedHTML = htmlTools.normalizeHTML(    
            /*html*/`
            <div>
                <h1 data-frmdb-value=":CONCATENATE('bla-', x):topObj.o">bla-1234</h1>
                <i data-frmdb-table="array[]" data-frmdb-value="array[]">a</i>
                <i data-frmdb-table="array[]" data-frmdb-value="array[]">b</i>
                <i data-frmdb-table="array[]" data-frmdb-value="array[]">c</i>
                <i data-frmdb-table="array[]" data-frmdb-value="array[]">d</i>
                <h4 data-frmdb-table="topObj.emptyArray[]"></h4>
                <div data-frmdb-table="tableName[]" data-frmdb-attr="class[row1|row2]::tableName[].name" class="row1">
                    <a data-frmdb-attr="href:CONCATENATE('../', name):tableName[]" href="../row1">Link</a>
                    <span data-frmdb-table="tableName[].childTable[]" data-frmdb-attr="!disabled::tableName[].cls" disabled="disabled">
                        <strong data-frmdb-value="::tableName[].childTable[].x" data-frmdb-attr="attr-from-parent::topObj.a" data-frmdb-attr2="second-attr::tableName[].atr" attr-from-parent="12" second-attr="attr1">1.1</strong>
                        <p data-frmdb-value=":topObj:secondTopObj.f1" data-frmdb-attr="at1:topObj:secondTopObj.f2" data-frmdb-attr3="at2:secondTopObj:tableName[].childTable[].x" at2="F1.1" at1="12">15</p>
                        <i data-frmdb-if="::tableName[].cls" data-frmdb-prop="gigi::tableName[].childTable[].x"></i>
                    </span>
                    <span data-frmdb-table="tableName[].childTable[]" data-frmdb-attr="!disabled::tableName[].cls" disabled="disabled">
                        <strong data-frmdb-value="::tableName[].childTable[].x" data-frmdb-attr="attr-from-parent::topObj.a" data-frmdb-attr2="second-attr::tableName[].atr" attr-from-parent="12" second-attr="attr1">1.2</strong>
                        <p data-frmdb-value=":topObj:secondTopObj.f1" data-frmdb-attr="at1:topObj:secondTopObj.f2" data-frmdb-attr3="at2:secondTopObj:tableName[].childTable[].x" at2="F1.2" at1="12">15</p>
                        <i data-frmdb-if="::tableName[].cls" data-frmdb-prop="gigi::tableName[].childTable[].x"></i>
                    </span>
                    <ul data-frmdb-attr="style.background-color::tableName[].bg" style="background-color: red;">
                        <li data-frmdb-attr="my-attr::tableName[].atr" data-frmdb-value="::tableName[].name" my-attr="attr1">
                            <h2 data-frmdb-label=""></h2>row1</li>
                        <li data-frmdb-attr="class.my-class::tableName[].cls" data-frmdb-value="::tableName[].description"  data-frmdb-attr2="class[row1|row2]::tableName[].name" class="row1 my-class">
                            <label data-frmdb-label=""></label>desc of row 1</li>
                    </ul>
                    <h1 data-frmdb-prop="complex::tableName[].childTable"></h1>
                </div>
                <div data-frmdb-table="tableName[]" data-frmdb-attr="class[row1|row2]::tableName[].name" class="row2">
                    <a data-frmdb-attr="href:CONCATENATE('../', name):tableName[]" href="../row2">Link</a>
                    <span data-frmdb-table="tableName[].childTable[]" data-frmdb-attr="!disabled::tableName[].cls">
                        <strong data-frmdb-value="::tableName[].childTable[].x" data-frmdb-attr="attr-from-parent::topObj.a" data-frmdb-attr2="second-attr::tableName[].atr" attr-from-parent="12" second-attr="attr2">2.1</strong>
                        <p data-frmdb-value=":topObj:secondTopObj.f1" data-frmdb-attr="at1:topObj:secondTopObj.f2" data-frmdb-attr3="at2:secondTopObj:tableName[].childTable[].x" at2="F2.1" at1="12">15</p>
                        <template data-frmdb-if="::tableName[].cls"><i data-frmdb-if="::tableName[].cls" data-frmdb-prop="gigi::tableName[].childTable[].x"></i></template>
                    </span>
                    <span data-frmdb-table="tableName[].childTable[]" data-frmdb-attr="!disabled::tableName[].cls">
                        <strong data-frmdb-value="::tableName[].childTable[].x" data-frmdb-attr="attr-from-parent::topObj.a" data-frmdb-attr2="second-attr::tableName[].atr" attr-from-parent="12" second-attr="attr2">2.2</strong>
                        <p data-frmdb-value=":topObj:secondTopObj.f1" data-frmdb-attr="at1:topObj:secondTopObj.f2" data-frmdb-attr3="at2:secondTopObj:tableName[].childTable[].x" at2="F2.2" at1="12">15</p>
                        <template data-frmdb-if="::tableName[].cls"><i data-frmdb-if="::tableName[].cls" data-frmdb-prop="gigi::tableName[].childTable[].x"></i></template>
                    </span>
                    <ul data-frmdb-attr="style.background-color::tableName[].bg" style="background-color: blue;">
                        <li data-frmdb-attr="my-attr::tableName[].atr" data-frmdb-value="::tableName[].name" my-attr="attr2">
                            <h2 data-frmdb-label=""></h2>row2</li>
                        <li data-frmdb-attr="class.my-class::tableName[].cls" data-frmdb-value="::tableName[].description" data-frmdb-attr2="class[row1|row2]::tableName[].name" class="row2">
                            <label data-frmdb-label=""></label>desc of row 2</li>
                    </ul>
                    <h1 data-frmdb-prop="complex::tableName[].childTable"></h1>
                </div>
            </div> 
        `);
        expect(normalizedHtml).toEqual(expectedNormalizedHTML);

        //check data-frmdb-prop data bindings
        let elemsWithProps = Array.from(el.querySelectorAll('i[data-frmdb-prop="gigi::tableName[].childTable[].x"]'))
            .map(el => ({gigi: el['gigi'], attrExpandedVal: el['data-frmdb-prop']}));
        expect(elemsWithProps).toEqual([
            {gigi: '1.1', attrExpandedVal: 'gigi::tableName[0].childTable[0].x'},
            {gigi: '1.2', attrExpandedVal: 'gigi::tableName[0].childTable[1].x'},
        ]);

        let elemsWithComplexProps = Array.from(el.querySelectorAll('h1[data-frmdb-prop="complex::tableName[].childTable"]'))
            .map(el => ({complex: el['complex'], attrExpandedVal: el['data-frmdb-prop']}));
        expect(elemsWithComplexProps).toEqual([
            {complex: [{x: "1.1"}, {x: "1.2"}], attrExpandedVal: 'complex::tableName[0].childTable'},
            {complex: [{x: "2.1"}, {x: "2.2"}], attrExpandedVal: 'complex::tableName[1].childTable'},
        ]);
    });

    it('should serialize element to DataObj', () => {
        let el = wrapHTML(/*html*/`
            <div data-frmdb-table="tableName[]" data-frmdb-attr="class[row1|row2]::tableName[].name">
                <div data-frmdb-table="tableName[].childTable[]" data-frmdb-attr="!disabled::tableName[].cls">
                    <div data-frmdb-value="::tableName[].childTable[].x" data-frmdb-attr="attr-from-parent::topObj.a">
                    </div>
                </div>
                <input type="text" data-frmdb-value="::tableName[].atr" />
            </div>
        `);
        updateDOM(data, el);

        let rootEl = el.querySelector('[data-frmdb-table="tableName[]"]');
        let obj = serializeElemToObj(rootEl as HTMLElement);
        expect(obj).toEqual({
            atr: "attr1",
        });
    });

    it('should support binding to async funcyions', async (done) => {
        let el = wrapHTML(/*html*/`
            <a data-frmdb-table="asyncFunc[]" data-frmdb-value="asyncFunc[]"></a>
        `);
        updateDOM({asyncFunc: () => fakeAsync([1, 2, 3, 4])}, el);

        setTimeout(() => {
            let renderedHtml = el.outerHTML;
            let normalizedHtml = htmlTools.normalizeHTML(renderedHtml);
            expect(normalizedHtml).toEqual(htmlTools.normalizeHTML(    
                /*html*/`
                <div>
                    <a data-frmdb-table="asyncFunc[]" data-frmdb-value="asyncFunc[]">1</a>
                    <a data-frmdb-table="asyncFunc[]" data-frmdb-value="asyncFunc[]">2</a>
                    <a data-frmdb-table="asyncFunc[]" data-frmdb-value="asyncFunc[]">3</a>
                    <a data-frmdb-table="asyncFunc[]" data-frmdb-value="asyncFunc[]">4</a>
                </div>`));
            done();
    
        }, 500);

    });
    
    fit('should compute rules: $CLOSEST, etc', async () => {
        let el = wrapHTML(/*html*/`
            <div data-frmdb-record="A~~1111">
                <i data-frmdb-value="$FRMDB.A[].afield1">afield1Value</i>
                <div>
                    <div data-frmdb-record="B~~2222">
                        <span data-frmdb-value="$FRMDB.B[].bfield1">bfield1Value</span>
                        <form data-frmdb-rules="a = $CLOSEST(A.afield1);; b = CONCATENATE($CLOSEST(A._id), &quot;bla&quot;)">
                        </form>
                    </div>
                </div>
            </div>
        `);
        let formEl = el.querySelector('form')!;
        let val = evaluateHardCodedForNowFunctions('$CLOSEST(B._id)', formEl);
        expect(val).toEqual('"B~~2222"');

        val = evaluateHardCodedForNowFunctions('$CLOSEST(B.bfield1)', formEl);
        expect(val).toEqual('"bfield1Value"');

        val = evaluateHardCodedForNowFunctions('$CLOSEST(A._id)', formEl);
        expect(val).toEqual('"A~~1111"');

        let obj: any = {_id: '1'};
        computeElementRules(formEl, obj);
        expect(obj.a).toEqual('afield1Value');
        expect(obj.b).toEqual('A~~1111bla');
    });
});
