import { Component, OnInit } from '@angular/core';

import * as appState from 'src/app/app.state';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { ThemeColorPaletteChangedAction, ThemeSidebarImageUrlChangedAction } from 'src/app/theme.state';
import { Subscription } from 'rxjs';

import { faTable, faColumns, faPlusCircle, faMinusCircle, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Pn, EntityProperty } from 'src/app/common/domain/metadata/entity';

@Component({
  selector: '[frmdb-dev-mode-opts]',
  templateUrl: './dev-mode-opts.component.html',
  styleUrls: ['./dev-mode-opts.component.scss']
})
export class DevModeOptsComponent implements OnInit {
  tableIcon = faTable;
  columnIcon = faColumns;
  addIcon = faPlusCircle;
  delIcon = faMinusCircle;

  editorOpened: boolean = false;
  developerMode: boolean = false;
  currentEntity: appState.Entity | undefined;
  currentProperty: EntityProperty | undefined;
  protected subscriptions: Subscription[] = [];

  constructor(protected store: Store<appState.AppState>, private router: Router) {
    this.subscriptions.push(this.store.select(appState.getDeveloperMode).subscribe(prop => {
      this.developerMode = prop
    }));
    this.subscriptions.push(store.select(appState.getTableEntityState)
      .subscribe(e => this.currentEntity = e));
    this.subscriptions.push(this.store.select(appState.getSelectedPropertyState)
      .subscribe(prop => this.currentProperty = prop));
  }

  ngOnInit() {
  }


  switchTheme(themeIdx: number) {
    this.router.navigate([this.router.url.replace(/\/\d+\/?/, '/' + themeIdx + '/')]);
  }

  switchThemeColorPalette(color: string) {
    this.store.dispatch(new ThemeColorPaletteChangedAction(color));
  }

  switchLanguage(language: string) {

  }

  switchSideBarImage(url: string) {
    this.store.dispatch(new ThemeSidebarImageUrlChangedAction(url));
  }

  formulaFocused() {
    this.editorOpened = true;
  }

  toggleFormulaEditor() {
    if (!this.developerMode) return;

    this.editorOpened = !this.editorOpened;
  }

  toggleDeveloperMode() {
    this.store.dispatch(new appState.CoreToggleDeveloperModeAction());
  }

  stopPropagation($event) {
    $event.stopPropagation();
  }

  addColumnToCurrentTable(input: HTMLInputElement) {
    if (!this.currentEntity) {
      alert("Please select an entity for adding a column");//TODO: add i18n
      return;
    }
    let newPropName = input.value;
    this.currentEntity.props[newPropName] = {
      name: newPropName,
      propType_: Pn.STRING,
    };
    this.store.dispatch(new appState.ServerEventModifiedEntity(this.currentEntity));
  }

  addTable(input: HTMLInputElement) {
    let newTableName = input.value;
    this.store.dispatch(new appState.ServerEventNewEntity(newTableName));
  }

  delTable() {
    if (!this.currentEntity) {
      alert("Select entity to be deleted");
      return;
    }
    if (confirm("Are you sure you want to delete table " + this.currentEntity._id + " ?")){
      this.store.dispatch(new appState.ServerEventDeleteEntity(this.currentEntity._id));
    }
  }

  delColumnFromCurrentTable() {
    if (!this.currentEntity || !this.currentProperty) {
      alert("Please select a column to be deleted");//TODO: add i18n
      return;
    }
    if (confirm("Are you sure you want to delete " + this.currentProperty.name + " column of " + this.currentEntity._id + " ?")){
      delete this.currentEntity.props[this.currentProperty.name];
      this.store.dispatch(new appState.ServerEventModifiedEntity(this.currentEntity));  
    }
  }

  getNameOfAddedTableOrColumn(tableNameInput: HTMLInputElement, colNameInput: HTMLInputElement) {
    let ret = this.currentEntity ? this.currentEntity._id : '';
    if (tableNameInput.value) ret += '___' + tableNameInput.value;
    if (colNameInput.value) ret += '.' + tableNameInput.value;
    return ret;
  }

}
