import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormInputEditorComponent } from './form-input-editor.component';

describe('FormInputEditorComponent', () => {
  let component: FormInputEditorComponent;
  let fixture: ComponentFixture<FormInputEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormInputEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormInputEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
