import { Component, OnInit, OnDestroy } from '@angular/core';

import * as appState from 'src/app/app.state';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { ThemeColorPaletteChangedAction, ThemeSidebarImageUrlChangedAction } from 'src/app/theme.state';
import { Subscription, Subject, Observable, merge, combineLatest } from 'rxjs';

import { faTable, faColumns, faPlusCircle, faMinusCircle, faPlus, faTools, faUserCircle, faImages, faCogs, faPalette, faSortNumericDown, faTextHeight, faCalendarAlt, faHourglassHalf, faShareSquare, faEdit, faQuestionCircle, faQuestion, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { Pn, EntityProperty, Entity } from "@core/domain/metadata/entity";
import { debounceTime, withLatestFrom, map, tap } from 'rxjs/operators';
import { FormulaEditorService } from '../formula-editor.service';

@Component({
  selector: 'frmdb-dev-mode-opts',
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
  settingsIcon = faCogs;
  collorPaletteIcon = faPalette;

  editIcon = faEdit;
  applyChangesIcon = faCheckCircle;
  discardChangesIcon = faTimesCircle;

  undefinedPropTypeIcon = faQuestion;
  numberPropTypeIcon = faSortNumericDown;
  stringPropTypeIcon = faTextHeight;
  datePropTypeIcon = faCalendarAlt;
  durationPropTypeIcon = faHourglassHalf;
  childTablePropTypeIcon = faTable;
  referenceToPropTypeIcon = faShareSquare;
  
  keepPrefixSubject$: Subject<{ input: HTMLInputElement, prefix: string }> = new Subject();

  developerMode$: Observable<boolean>;
  editorOn$: Observable<boolean>;
  displayedProperty$: Observable<EntityProperty | undefined>;


  clickPropertyType$: Subject<string> = new Subject();
  clickStartEdit$: Subject<void> = new Subject();
  clickCancelEdits$: Subject<void> = new Subject();
  clickSaveEdits$: Subject<void> = new Subject();

  currentEntity: appState.Entity | undefined;
  currentProperty: EntityProperty | undefined;
  protected subscriptions: Subscription[] = [];

  constructor(protected store: Store<appState.AppState>, private router: Router, public formulaEditorService: FormulaEditorService) {
    this.developerMode$ = this.store.select(appState.getDeveloperMode);
    this.editorOn$ = this.store.select(appState.getEditorOn);

    this.sub(this.clickStartEdit$.subscribe(() => this.formulaEditorService.toggleFormulaEditor()));
    this.clickCancelEdits$.subscribe(() => this.discardChanges());

    this.displayedProperty$ = combineLatest(this.formulaEditorService.currentProperty$, this.formulaEditorService.editedProperty$).pipe(
      map(([currentProperty, editedProperty]) => editedProperty ? editedProperty : currentProperty)
    );

    let saveStream$ = this.clickSaveEdits$.pipe(
      withLatestFrom(combineLatest(this.formulaEditorService.editorExprHasErrors$, this.formulaEditorService.editedEntity$, this.formulaEditorService.editedProperty$)),
      map(([x, [editorExprHasErrors, editedEntity, editedProperty]]) => ({ editorExprHasErrors, editedEntity, editedProperty }))
    );
    this.sub(saveStream$.subscribe(({editorExprHasErrors, editedEntity, editedProperty}) => {
      if (editedEntity) this.applyChanges(editorExprHasErrors, editedEntity, editedProperty);
    }));

    this.sub(store.select(appState.getTableEntityState).subscribe(e => this.currentEntity = e));
    this.sub(this.store.select(appState.getSelectedPropertyState).subscribe(prop => this.currentProperty = prop));
  }

  sub(s: Subscription) {
    this.subscriptions.push(s);
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


  stopPropagation($event) {
    $event.stopPropagation();
    $event.preventDefault();
  }

  addColumnToCurrentTable(input: HTMLInputElement) {
    if (!this.currentEntity) {
      alert("Please select an entity for adding a column");//TODO: add i18n
      return;
    }
    let newPropName = input.value.replace(/^\./, '');
    this.store.dispatch(new appState.ServerEventSetProperty(this.currentEntity, {
      name: newPropName,
      propType_: Pn.STRING,
    }));
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
      this.store.dispatch(new appState.ServerEventDeleteProperty(this.currentEntity, this.currentProperty.name));
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

  startEditing() {
    this.formulaEditorService.toggleFormulaEditor();
  }

  modifyPropertyType(type: string) {
    if (!this.formulaEditorService.formulaState.selectedProperty) return;
    if (this.formulaEditorService.formulaState.selectedProperty.propType_ != type && !this.formulaEditorService.formulaState.editorOn) {
      this.formulaEditorService.toggleFormulaEditor();
    }
  }


  applyChanges(editorExprHasErrors: boolean, editedEntity: Entity, editedProperty: EntityProperty) {
    if (!editorExprHasErrors) {
      if (confirm("Please confirm, apply modifications to DB ?")) {
        this.store.dispatch(new appState.ServerEventSetProperty(editedEntity, editedProperty));
        this.formulaEditorService.toggleFormulaEditor();
      }
    } else {
      alert("Expression has errors, cannot apply on DB");
    }
  }
  discardChanges() {
    if (confirm("Please confirm, dicard changes ?")) {
      this.formulaEditorService.toggleFormulaEditor();
    }
  }  
}
