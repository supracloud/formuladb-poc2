import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormItemEditorComponent } from './form-item-editor.component';

describe('FormItemEditorComponent', () => {
  let component: FormItemEditorComponent;
  let fixture: ComponentFixture<FormItemEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormItemEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormItemEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
