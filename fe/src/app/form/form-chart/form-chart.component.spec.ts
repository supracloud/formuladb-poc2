import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormChartComponent } from './form-chart.component';

describe('FormChartComponent', () => {
  let component: FormChartComponent;
  let fixture: ComponentFixture<FormChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
