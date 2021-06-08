// /**
//  * © 2018 S.C. FORMULA DATABASE S.R.L.
//  * License TBD
//  */

// import { FrmdbElementState } from "@fe/frmdb-element-state";
// import { ReferenceToProperty, Pn } from "@domain/metadata/entity";
// import { camelCaseProp2kebabCaseAttr, kebabCaseAttr2CamelCaseProp } from "@core/text-utils";
// import * as monaco from 'monaco-editor';

// const html = require('raw-loader!@fe-assets/col-reference-to/col-reference-to.component.html').default;
// const css = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/col-reference-to/col-reference-to.component.scss').default;

// const defaultAttr = {
// };
// const defaultState: Partial<ReferenceToProperty> = {
//     propType_: Pn.REFERENCE_TO,
//     ...defaultAttr,
// };
// export class ColumnEditorComponent extends HTMLElement {
//     state = new FrmdbElementState(document.body, defaultState);
//     static observedAttributes = Object.keys(defaultAttr).map(k => camelCaseProp2kebabCaseAttr(k));
//     attributeChangedCallback(name: string, oldVal: string, newVal: string) {
//         this.state.emitChange({[kebabCaseAttr2CamelCaseProp(name)]: newVal});
//     }

//     constructor() {
//         super();

//         this.attachShadow({ mode: 'open' });
//         this.shadowRoot!.innerHTML = `<style>${css}</style> ${html}`;
//     }
    
//     connectedCallback() {
//     }
// }

// // window.customElements.define('frmdb-column-editor', ColumnEditorComponent);
// // customElements.whenDefined('frmdb-column-editor').then(() => console.info('frmdb-column-editor is defined'));

// // validation settings
// monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
// 	noSemanticValidation: false,
// 	noSyntaxValidation: false
// });

// // compiler options
// monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
// 	target: monaco.languages.typescript.ScriptTarget.ES2019,
//     noLib: true,
// 	allowNonTsExtensions: true
// });

// // extra libraries
// monaco.languages.typescript.javascriptDefaults.addExtraLib(`
//     // ## Injecting the following extra libs for formula ########## 
//     // Room_Type.total_number_of_rooms = COUNTIF(Room, 
//     //    AND(room_type == $$._id, NOT(disabled_room))
//     // )

//     interface Table {}
//     var Room_Type: Table;
//     var Room: Table;

//     //generic types used in FormulaDB
//     type TEXT = string, NUMBER = number, BOOLEAN = boolean;
//     interface DATE {}
//     interface REFERENCE_TO {}

//     //columns from Room table referenced in COUNTIF
//     var room_type: REFERENCE_TO;
//     var disabled_room: BOOLEAN;

//     //colum definitions from current record
//     var $$: {
//         _id: TEXT
//     }

//     function COUNTIF(table: Table, condition: BOOLEAN, blabla?: Array<any>)
//     function AND(left: BOOLEAN, right: BOOLEAN): BOOLEAN;
//     function NOT(left: BOOLEAN): BOOLEAN;
//     //....etc, other function definitions

// `, 'ts:filename/facts.d.ts');

// var jsCode = [
// 	'"use strict";',
// 	'',
// 	"class Chuck {",
// 	"    greet() {",
// 	"        return Facts.next();",
// 	"    }",
// 	"}"
// ].join('\n');

// monaco.editor.create(document.getElementById("container")!, {
// 	value: jsCode,
// 	language: "javascript",
//     // suggest: { filteredTypes: { keyword: false } },
// });
