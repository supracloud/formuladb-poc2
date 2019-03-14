import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import * as shape from 'd3-shape';
import { BaseNodeComponent } from '../base_node';

import { FormChart } from "@core/domain/uimetadata/form";
import { FormArray, FormControl } from '@angular/forms';
import { FormEditingService } from '../form-editing.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'frmdb-form_chart',
  templateUrl: './form_chart.component.html',
  styleUrls: ['./form_chart.component.scss']
})
export class FormChartComponent extends BaseNodeComponent implements OnInit, OnDestroy {

  chartType: string;

  chartGroups: any[];
  chart: any;
  realTimeData: boolean = false;
  countries: any[];
  fiscalYearReport: any[];
  dateData: any[];
  dateDataWithRange: any[];
  calendarData: any[];
  statusData: any[];
  sparklineData: any[];
  timelineFilterBarData: any[];
  graph: { links: any[]; nodes: any[] };
  bubble: any;
  linearScale: boolean = false;
  range: boolean = false;

  view: any[];
  itContainer: boolean = false;

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  legendTitle = 'Legend';
  legendPosition = 'right';
  showXAxisLabel = true;
  tooltipDisabled = false;
  xAxisLabel = 'Country';
  showYAxisLabel = true;
  yAxisLabel = 'GDP Per Capita';
  showGridLines = true;
  innerPadding = '10%';
  barPadding = 8;
  groupPadding = 16;
  roundDomains = false;
  maxRadius = 10;
  minRadius = 3;
  showSeriesOnHover = true;
  roundEdges: boolean = true;
  animations: boolean = true;
  xScaleMin: any;
  xScaleMax: any;
  yScaleMin: number;
  yScaleMax: number;
  showDataLabel = false;

  curves = {
    Basis: shape.curveBasis,
    'Basis Closed': shape.curveBasisClosed,
    Bundle: shape.curveBundle.beta(1),
    Cardinal: shape.curveCardinal,
    'Cardinal Closed': shape.curveCardinalClosed,
    'Catmull Rom': shape.curveCatmullRom,
    'Catmull Rom Closed': shape.curveCatmullRomClosed,
    Linear: shape.curveLinear,
    'Linear Closed': shape.curveLinearClosed,
    'Monotone X': shape.curveMonotoneX,
    'Monotone Y': shape.curveMonotoneY,
    Natural: shape.curveNatural,
    Step: shape.curveStep,
    'Step After': shape.curveStepAfter,
    'Step Before': shape.curveStepBefore,
    default: shape.curveLinear
  };

  // line interpolation
  curveType: string = 'Linear';
  curve: any = this.curves[this.curveType];
  interpolationTypes = [
    'Basis',
    'Bundle',
    'Cardinal',
    'Catmull Rom',
    'Linear',
    'Monotone X',
    'Monotone Y',
    'Natural',
    'Step',
    'Step After',
    'Step Before'
  ];

  closedCurveType: string = 'Linear Closed';
  closedCurve: any = this.curves[this.closedCurveType];
  closedInterpolationTypes = ['Basis Closed', 'Cardinal Closed', 'Catmull Rom Closed', 'Linear Closed'];

  colorSets: any;
  schemeType: string = 'ordinal';
  selectedColorScheme: string;
  rangeFillOpacity: number = 0.15;

  // Override colors for certain values
  // customColors: any[] = [
  //   {
  //     name: 'Germany',
  //     value: '#0000ff'
  //   }
  // ];

  // pie
  showLabels = true;
  explodeSlices = false;
  doughnut = false;
  arcWidth = 0.25;

  // line, area
  autoScale = true;
  timeline = false;

  // margin
  margin: boolean = false;
  marginTop: number = 40;
  marginRight: number = 40;
  marginBottom: number = 40;
  marginLeft: number = 40;

  // gauge
  gaugeMin: number = 0;
  gaugeMax: number = 100;
  gaugeLargeSegments: number = 10;
  gaugeSmallSegments: number = 5;
  gaugeTextValue: string = '';
  gaugeUnits: string = 'alerts';
  gaugeAngleSpan: number = 240;
  gaugeStartAngle: number = -120;
  gaugeShowAxis: boolean = true;
  gaugeValue: number = 50; // linear gauge value
  gaugePreviousValue: number = 70;

  // heatmap
  heatmapMin: number = 0;
  heatmapMax: number = 50000;

  // Combo Chart
  lineChartScheme = {
    name: 'coolthree',
    selectable: true,
    group: 'Ordinal',
    domain: ['#01579b', '#7aa3e5', '#a8385d', '#00bfa5']
  };

  comboBarScheme = {
    name: 'singleLightBlue',
    selectable: true,
    group: 'Ordinal',
    domain: ['#01579b']
  };

  showRightYAxisLabel: boolean = true;
  yAxisLabelRight: string = 'Utilization';

  // demos
  totalSales = 0;
  salePrice = 100;
  personnelCost = 100;

  mathText = '3 - 1.5*sin(x) + cos(2*x) - 1.5*abs(cos(x))';
  mathFunction: (o: any) => any;

  treemap: any[];
  treemapPath: any[] = [];
  sumBy: string = 'Size';

  // Reference lines
  showRefLines: boolean = true;
  showRefLabels: boolean = true;

  // Supports any number of reference lines.
  refLines = [{ value: 42500, name: 'Maximum' }, { value: 37750, name: 'Average' }, { value: 33000, name: 'Minimum' }];


  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  single: { name: string, value: number }[] = [
    {
      "name": "Product 1",
      "value": 8940000
    },
    {
      "name": "Product 2",
      "value": 5000000
    },
    {
      "name": "Product 3",
      "value": 7200000
    },
    {
      "name": "Product 4",
      "value": 6200000
    },
    {
      "name": "Product 5",
      "value": 3200000
    },
  ];

  lineData = [
    {
      "name": "Product 1",
      "series": [
        {
          "value": 4090,
          "name": "2016-09-13T01:23:43.044Z"
        },
        {
          "value": 5277,
          "name": "2016-09-18T12:27:49.344Z"
        },
        {
          "value": 6704,
          "name": "2016-09-22T00:08:59.196Z"
        },
        {
          "value": 6314,
          "name": "2016-09-15T07:55:54.128Z"
        },
        {
          "value": 6148,
          "name": "2016-09-20T08:49:17.074Z"
        }
      ]
    },
    {
      "name": "Product 2",
      "series": [
        {
          "value": 4229,
          "name": "2016-09-13T01:23:43.044Z"
        },
        {
          "value": 5619,
          "name": "2016-09-18T12:27:49.344Z"
        },
        {
          "value": 4183,
          "name": "2016-09-22T00:08:59.196Z"
        },
        {
          "value": 5423,
          "name": "2016-09-15T07:55:54.128Z"
        },
        {
          "value": 3575,
          "name": "2016-09-20T08:49:17.074Z"
        }
      ]
    },
    {
      "name": "Product 3",
      "series": [
        {
          "value": 2431,
          "name": "2016-09-13T01:23:43.044Z"
        },
        {
          "value": 4456,
          "name": "2016-09-18T12:27:49.344Z"
        },
        {
          "value": 4404,
          "name": "2016-09-22T00:08:59.196Z"
        },
        {
          "value": 4023,
          "name": "2016-09-15T07:55:54.128Z"
        },
        {
          "value": 6092,
          "name": "2016-09-20T08:49:17.074Z"
        }
      ]
    },
    {
      "name": "Product 4",
      "series": [
        {
          "value": 4002,
          "name": "2016-09-13T01:23:43.044Z"
        },
        {
          "value": 6694,
          "name": "2016-09-18T12:27:49.344Z"
        },
        {
          "value": 3530,
          "name": "2016-09-22T00:08:59.196Z"
        },
        {
          "value": 3144,
          "name": "2016-09-15T07:55:54.128Z"
        },
        {
          "value": 5703,
          "name": "2016-09-20T08:49:17.074Z"
        }
      ]
    },
    {
      "name": "Product 5",
      "series": [
        {
          "value": 3066,
          "name": "2016-09-13T01:23:43.044Z"
        },
        {
          "value": 4026,
          "name": "2016-09-18T12:27:49.344Z"
        },
        {
          "value": 4955,
          "name": "2016-09-22T00:08:59.196Z"
        },
        {
          "value": 5714,
          "name": "2016-09-15T07:55:54.128Z"
        },
        {
          "value": 2105,
          "name": "2016-09-20T08:49:17.074Z"
        }
      ]
    }
  ];
  multi = this.lineData;


  formChart: FormChart;
  formArray: FormArray;

  constructor(formEditingService: FormEditingService) {
    super(formEditingService);
  }


  setSingleData() {
    this.single = [];

    for (let rowControl of this.formArray.controls) {
      let nameCtrl = rowControl.get(this.formChart.xPropertyName);
      let valueCtrl = rowControl.get(this.formChart.yPropertyName);
      if (nameCtrl instanceof FormControl && valueCtrl instanceof FormControl) {
        this.single.push({
          name: nameCtrl.value,
          value: valueCtrl.value,
        });
      }
    }
  }

  ngOnInit() {
    this.formChart = this.nodeElement as FormChart;
    this.view = [this.formChart.width, this.formChart.height];
    this.chartType = this.formChart.chartType;
    this.xAxisLabel = this.formChart.xPropertyName;//TODO: add i18n HERE
    this.yAxisLabel = this.formChart.yPropertyName;
    let tmpCtrl = this.topLevelFormGroup.get(this.formChart.tableName);
    if (tmpCtrl instanceof FormArray) {
      this.formArray = tmpCtrl;
      this.setSingleData();
      this.subscriptions.push(this.formArray.valueChanges.subscribe(() => {
        this.setSingleData();
      }));
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }

}
