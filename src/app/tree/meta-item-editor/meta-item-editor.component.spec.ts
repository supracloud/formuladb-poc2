import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetaItemEditorComponent } from './meta-item-editor.component';

describe('MetaItemEditorComponent', () => {
  let component: MetaItemEditorComponent;
  let fixture: ComponentFixture<MetaItemEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetaItemEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetaItemEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
