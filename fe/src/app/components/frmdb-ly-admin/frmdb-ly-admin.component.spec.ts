import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FrmdbLyAdminComponent } from './frmdb-ly-admin.component';

describe('FrmdbLyAdminComponent', () => {
  let component: FrmdbLyAdminComponent;
  let fixture: ComponentFixture<FrmdbLyAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FrmdbLyAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FrmdbLyAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
