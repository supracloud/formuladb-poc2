import { parseHTML, writeHTML } from "./dom-node";
import { render } from "./live-dom-template";

const template = `
<div data-frmdb-foreach="tableName">
    <ul data-frmdb-attr="bg:style.background-color">
        <li data-frmdb-attr="atr:my-attr" data-frmdb-valueof="name"><label data-frmdb-label></label></li>
        <li data-frmdb-attr="cls:class.my-class" data-frmdb-valueof="description"><label data-frmdb-label></label></li>
    </ul>
</div>
`;

let data = {
    tableName: [
        { name: "row1", description: "desc of row 1", bg: "red", cls: true, atr: "attr1", childTable: [{x: "1.1"}, {x: "1.2"}] },
        { name: "row2", description: "desc of row 2", bg: "blue", cls: false, atr: "attr2", childTable: [{x: "2.1"}, {x: "2.1"}] },
    ]
};

describe('FrmdbTemplate', () => {
    beforeEach(() => {
    });

    fit('should update view when template OR data changes', () => {
        let el = parseHTML(template);
        render(data, el)
        let renderedHtml = writeHTML(el);
        expect(renderedHtml.replace(/\n\s*/g, '').replace(/\s+$/, '')).toEqual(`
            <body xmlns="http://www.w3.org/1999/xhtml">
                <div data-frmdb-foreach="tableName">
                    <ul data-frmdb-attr="bg:style.background-color" style="background-color: red;">
                        <li data-frmdb-attr="atr:my-attr" data-frmdb-valueof="name" my-attr="attr1"><label data-frmdb-label=""></label>row1</li>
                        <li data-frmdb-attr="cls:class.my-class" data-frmdb-valueof="description" class="my-class"><label data-frmdb-label=""></label>desc of row 1</li>
                    </ul>
                    <div>
                        <div data-frmdb-foreach="childTable">
                            <div data-frmdb-valueof="x">1.1</div>
                        </div>
                        <div data-frmdb-foreach="childTable">
                            <div data-frmdb-valueof="x">1.2</div>
                        </div>
                    </div>
                </div>
                <div data-frmdb-foreach="tableName">
                    <ul data-frmdb-attr="bg:style.background-color" style="background-color: blue;">
                        <li data-frmdb-attr="atr:my-attr" data-frmdb-valueof="name" my-attr="attr2"><label data-frmdb-label=""></label>row2</li>
                        <li data-frmdb-attr="cls:class.my-class" data-frmdb-valueof="description" class=""><label data-frmdb-label=""></label>desc of row 2</li>
                    </ul>
                    <div>
                        <div data-frmdb-foreach="childTable">
                            <div data-frmdb-valueof="x">2.1</div>
                        </div>
                        <div data-frmdb-foreach="childTable">
                            <div data-frmdb-valueof="x">2.1</div>
                        </div>
                    </div>
                </div>
            </body> 
        `.replace(/\n\s*/g, '').replace(/\s+$/, ''));
    })
});
