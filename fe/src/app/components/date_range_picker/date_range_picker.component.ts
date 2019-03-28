/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { NgbDate, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';

import { DateRangePicker, FormDatepicker, NodeType } from '@core/domain/uimetadata/form';
import { BaseNodeComponent } from '../base_node';
import { FormEditingService } from '../form-editing.service';
import { generateUUID } from '@core/domain/uuid';

@Component({
    selector: 'frmdb-date_range_picker',
    templateUrl: './date_range_picker.component.html',
    styleUrls: ['./date_range_picker.component.scss'],
})
export class DateRangePickerComponent extends BaseNodeComponent implements OnInit {
    dateRangeElement: DateRangePicker;

    _hoveredDate: NgbDate;
    set hoveredDate(val: NgbDate) {
        this._hoveredDate = val;
        this.changeDetectorRef.detectChanges();
    }
    get hoveredDate() {
        return this._hoveredDate;
    }
    fromDate: NgbDate | null;
    toDate: NgbDate | null;

    constructor(formEditingService: FormEditingService, calendar: NgbCalendar,
        protected changeDetectorRef: ChangeDetectorRef) {
        super(formEditingService);
        this.fromDate = calendar.getToday();
        this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
        this.changeDetectorRef.reattach();
    }

    getPropPath(propName: string) {
        return (this.fullpath ? this.fullpath + '.' : '') + propName;
    }

    ngOnInit() {
        console.debug(this.fullpath, this.nodel, this.formgrp);
        this.dateRangeElement = this.nodel as DateRangePicker;
    }

    formatDate(date: NgbDate | null) {
        if (!date) return '';
        return date.year.toString() + '-' + date.month.toString().padStart(2, '0') + '-' + date.day.toString().padStart(2, '0');
    }

    onDateSelection(date: NgbDate) {
        // console.debug("onDateSelection", date, this.fromDate, this.toDate, this.hoveredDate);
        if (!this.fromDate && !this.toDate) {
            this.fromDate = date;
        } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
            this.toDate = date;
            let startCtrl = this.formgrp.get(this.getPropPath(this.dateRangeElement.startPropertyName));
            let endCtrl = this.formgrp.get(this.getPropPath(this.dateRangeElement.endPropertyName));
            if (startCtrl && endCtrl) {
                startCtrl.markAsDirty();
                startCtrl.setValue(this.formatDate(this.fromDate));
                endCtrl.markAsDirty();
                endCtrl.setValue(this.formatDate(this.toDate));
            }
        } else {
            this.toDate = null;
            this.fromDate = date;
        }
        this.changeDetectorRef.detectChanges();
    }

    isHovered(date: NgbDate) {
        // console.debug("isHovered", date, this.fromDate, this.toDate, this.hoveredDate);
        return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
    }

    isInside(date: NgbDate) {
        // console.debug("isInside", date, this.fromDate, this.toDate, this.hoveredDate);
        return date.after(this.fromDate as any) && date.before(this.toDate as any);
    }

    isRange(date: NgbDate) {
        // console.debug("isRange", date, this.fromDate, this.toDate, this.hoveredDate);
        return date.equals(this.fromDate as any) || date.equals(this.toDate as any) || this.isInside(date) || this.isHovered(date);
    }
}
