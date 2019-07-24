import './app-backend';
import './v-nav/v-nav.component';
import './formula-editor/formula-editor.component';
import './db-editor/db-editor.component';
import { onDoc } from './delegated-events';
import { FormulaEditorComponent, queryFormulaEditor } from './formula-editor/formula-editor.component';
import { queryDataGrid, DataGridComponent } from './data-grid/data-grid.component';
import { BACKEND_SERVICE } from './backend.service';
import { elvis } from '@core/elvis';
import { EntityProperty, Pn } from '@domain/metadata/entity';


onDoc("click", "#toggle-formula-editor", (event) => {
    let formulaEditor = queryFormulaEditor(document);
    //TODO enable formula editor
});

onDoc("frmdbchange", "frmdb-data-grid", async (event) => {
    let formulaEditor = queryFormulaEditor(document);
    let dataGrid = event.target as DataGridComponent;

    let prop: EntityProperty | undefined = elvis(elvis(BACKEND_SERVICE().currentSchema.entities[dataGrid.getAttributeTyped("table_name") || '']).props)[dataGrid.frmdbState.selectedColumnName || ''];
    formulaEditor.frmdbState.ftext = prop ? (
            prop.propType_ === Pn.FORMULA ? prop.formula : prop.propType_
        ) : 'empty type';
});
