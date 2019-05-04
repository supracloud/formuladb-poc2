/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { NgbDate, NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';

import { DateRangePicker, FormDatepicker, NodeType } from '@core/domain/uimetadata/node-elements';
import { BaseNodeComponent } from '../base_node';
import { FormEditingService } from '../form-editing.service';
import { generateUUID } from '@core/domain/uuid';
import { elvis } from '@core/elvis';

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
        protected changeDetectorRef: ChangeDetectorRef, private dateParser: NgbDateParserFormatter) {
        super(formEditingService);
        this.changeDetectorRef.reattach();
    }

    getPropPath(propName: string) {
        return (this.fullpath ? this.fullpath + '.' : '') + propName;
    }

    ngOnInit() {
        console.debug(this.fullpath, this.nodel, this.formgrp);
        this.dateRangeElement = this.nodel as DateRangePicker;
        let startCtrl = this.formgrp.get(this.getPropPath(this.dateRangeElement.startPropertyName));
        let endCtrl = this.formgrp.get(this.getPropPath(this.dateRangeElement.endPropertyName));
        if (startCtrl) {
            this.fromDate = NgbDate.from(this.dateParser.parse(startCtrl.value));
        }
        if (endCtrl) {
            this.toDate = NgbDate.from(this.dateParser.parse(endCtrl.value));
        }
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
            if (startCtrl && endCtrl && !this.isOverlap(this.fromDate) && !this.isOverlap(this.toDate)) {
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

    isBooked(date: NgbDate) {
        let dateStr = this.formatDate(date);
        return this.getBookingsSameRoot(date).find(x => x.start_date <= dateStr && dateStr <= x.end_date);
    }

    isOverlap(date: NgbDate) {
        if (!this.fromDate || !this.toDate) return false;
        let dateStr = this.formatDate(date);
        let fromDateStr = this.formatDate(this.fromDate);
        let toDateStr = this.formatDate(this.toDate);
        return this.getBookingsSameRoot(date).find(x => x.start_date <= dateStr && dateStr <= x.end_date && 
            fromDateStr <= dateStr && dateStr <= toDateStr
        );
    }

    getBookingsSameRoot(date: NgbDate) {
        let _id = elvis(this.formgrp.get("_id")).value;
        let bookingItemId = elvis(this.formgrp.get("booking_item_id")).value;
        return this.overlaps.filter(x => x.booking_item_id == bookingItemId && x._id != _id);
    }

    //TODO: remove hardcoding, get data from "VIEW_TABLE" property
    overlaps = [
        { _id: "Booking~~1__1", booking_item_id: 'BookingItem~~1', start_date: '2019-04-03', end_date: '2019-04-08'},
        { _id: "Booking~~1__2", booking_item_id: 'BookingItem~~1', start_date: '2019-04-19', end_date: '2019-04-24'},
        { _id: "Booking~~2__3", booking_item_id: 'BookingItem~~2', start_date: '2019-04-10', end_date: '2019-04-15'},
        { _id: "Booking~~2__4", booking_item_id: 'BookingItem~~2', start_date: '2019-04-24', end_date: '2019-04-28'},
        { _id: "Booking~~3__5", booking_item_id: 'BookingItem~~3', start_date: '2019-04-06', end_date: '2019-04-09'},
        { _id: "Booking~~3__6", booking_item_id: 'BookingItem~~3', start_date: '2019-04-26', end_date: '2019-04-30'},
    ]; 
}
