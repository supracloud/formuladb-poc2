import { Component, OnInit, OnDestroy } from '@angular/core';

import * as appState from 'src/app/app.state';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { ThemeColorPaletteChangedAction, ThemeSidebarImageUrlChangedAction } from 'src/app/theme.state';
import { Subscription, Subject } from 'rxjs';

import { faTable, faColumns, faPlusCircle, faMinusCircle, faPlus, faTools, faUserCircle, faImages } from '@fortawesome/free-solid-svg-icons';
import { Pn, EntityProperty } from "@core/domain/metadata/entity";
import { debounceTime, tap } from 'rxjs/operators';

@Component({
  selector: '[frmdb-dev-mode-opts]',
  templateUrl: './dev-mode-opts.component.html',
  styleUrls: ['./dev-mode-opts.component.scss']
})
export class DevModeOptsComponent implements OnInit, OnDestroy {
  tableIcon = faTable;
  columnIcon = faColumns;
  addIcon = faPlusCircle;
  delIcon = faMinusCircle;
  devModeIcon = faTools;
  changeAppIcon = faImages;

  keepPrefixSubject$: Subject<{ input: HTMLInputElement, prefix: string }> = new Subject();

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

    this.subscriptions.push(this.keepPrefixSubject$.pipe(
      debounceTime(250),
    ).subscribe(({ input, prefix }) => {
      if (input.value.indexOf(prefix) !== 0) {
        input.value = input.value.replace(/^\s+/, '').replace(new RegExp('^[' + prefix[0] + ']+'), '');
        input.value = prefix + input.value;
      }
    }));
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe())
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
    let newPropName = input.value.replace(/^\./, '');
    this.currentEntity.props[newPropName] = {
      name: newPropName,
      propType_: Pn.STRING,
    };
    this.store.dispatch(new appState.ServerEventModifiedEntity(this.currentEntity));
  }

  addTable(input: HTMLInputElement) {
    let newTableName = input.value;
    let prefix = this.currentEntity ? this.currentEntity._id : '';
    if (prefix === '') newTableName = newTableName.replace(/^__/, '');
    this.store.dispatch(new appState.ServerEventNewEntity(prefix + newTableName));
  }

  delTable() {
    if (!this.currentEntity) {
      alert("Select entity to be deleted");
      return;
    }
    if (confirm("Are you sure you want to delete table " + this.currentEntity._id + " ?")) {
      this.store.dispatch(new appState.ServerEventDeleteEntity(this.currentEntity._id));
    }
  }

  delColumnFromCurrentTable() {
    if (!this.currentEntity || !this.currentProperty) {
      alert("Please select a column to be deleted");//TODO: add i18n
      return;
    }
    if (confirm("Are you sure you want to delete " + this.currentProperty.name + " column of " + this.currentEntity._id + " ?")) {
      delete this.currentEntity.props[this.currentProperty.name];
      this.store.dispatch(new appState.ServerEventModifiedEntity(this.currentEntity));
    }
  }

  getNameOfAddedTableOrColumn(tableNameInput: HTMLInputElement, colNameInput: HTMLInputElement) {
    let ret = this.currentEntity ? this.currentEntity._id : '';
    if (tableNameInput.value) ret += '__' + tableNameInput.value;
    if (colNameInput.value) ret += '.' + tableNameInput.value;
    return ret;
  }

  keepPrefix(input: HTMLInputElement, prefix: string) {
    this.keepPrefixSubject$.next({ input, prefix });
  }

  goToAppList() {
    this.router.navigate(['/']);
  }

}
