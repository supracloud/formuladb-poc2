/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

 
import * as _ from 'lodash';
import { FrmdbElementBase, FrmdbElementDecorator } from '@fe/live-dom-template/frmdb-element';

const HTML: string = require('raw-loader!@fe-assets/db-editor/db-editor.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/db-editor/db-editor.component.scss').default;
interface DbEditorAttrs {

};

export interface DbEditorState extends DbEditorAttrs {
}

@FrmdbElementDecorator<DbEditorAttrs, DbEditorState>({
    tag: 'frmdb-db-editor',
    observedAttributes: [],
    template: HTML,
    style: CSS,
    noShadow: true,
})
export class DbEditorComponent extends FrmdbElementBase<DbEditorAttrs, DbEditorState> {
}
