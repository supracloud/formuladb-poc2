import './v-nav/v-nav.component';
import './formula-editor/formula-editor.component';
import './db-editor/db-editor.component';
import { onDoc } from './delegated-events';
import { FormulaEditorComponent, queryFormulaEditor } from './formula-editor/formula-editor.component';
import { queryDataGrid, DataGridComponent } from './data-grid/data-grid.component';
import { BACKEND_SERVICE } from './backend.service';
import { elvis } from '@core/elvis';
import { EntityProperty, Pn, Entity } from '@domain/metadata/entity';


onDoc("frmdbchange", "frmdb-data-grid", async (event) => {
    let formulaEditor = queryFormulaEditor(document);
    let dataGrid = event.target as DataGridComponent;

    let entity: Entity = BACKEND_SERVICE().currentSchema.entities[dataGrid.getAttributeTyped("table_name") || ''];
    let prop: EntityProperty | undefined = entity.props[dataGrid.frmdbState.selectedColumnName || ''];
    formulaEditor.frmdbState.editedEntity = entity;
    formulaEditor.frmdbState.editedProperty = prop;
});

onDoc("frmdbchange", "frmdb-formula-editor", async (event) => {
    let formulaEditor = queryFormulaEditor(document);
    let dataGrid = queryDataGrid(document);
    dataGrid.frmdbState.highlightColumns = formulaEditor.frmdbState.formulaHighlightedColumns;
});
