import { Component, Input, Output, EventEmitter, OnInit, OnChanges, ChangeDetectionStrategy } from '@angular/core';

import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

import { UtilService } from '../../core/services/util.service';
// import { AccPersonalesService } from '../../acc-personales.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush, // revisar
    selector: 'form-input-date',
    templateUrl: './form-input-date.component.html',
    styleUrls: ['./form-input-date.component.css']
})
export class FormInputDateComponent implements OnInit, OnChanges {

    @Input() label: string;
    @Input() placeholder: string;
    @Input() required: boolean;
    @Input() disabled: boolean;
    @Input() transac: number;

    @Input() minDate: string | Date;
    @Input() minDateSup: string | Date;
    @Input() maxDate: string | Date;
    @Input() maxDateInf: string | Date;

    @Input() baseDateValue: string;
    @Input() baseDatePeriod: string;

    @Input() value: any;
    @Output() valueChange: EventEmitter<any> = new EventEmitter();

    @Input() clear: boolean;
    @Output() clearChange: EventEmitter<any> = new EventEmitter();

    @Input() today: boolean;
    @Output() todayChange: EventEmitter<any> = new EventEmitter();

    @Input() todayNextMonth: boolean;
    @Output() todayNextMonthChange: EventEmitter<any> = new EventEmitter();

    @Input() todayPreviousMonth: boolean;
    @Output() todayPreviousMonthChange: EventEmitter<any> = new EventEmitter();

    @Input() maxNextMonth: boolean;
    @Output() maxNextMonthChange: EventEmitter<any> = new EventEmitter();

    @Input() minPreviousMonth: boolean;
    @Output() minPreviousMonthChange: EventEmitter<any> = new EventEmitter();

    @Output() onSelect: EventEmitter<any> = new EventEmitter();

    name: string = UtilService.getControlName();

    bsConfig: Partial<BsDatepickerConfig>;

    constructor(
        // public accPersonalesService: AccPersonalesService
    ) {
        this.bsConfig = Object.assign(
            {},
            {
                dateInputFormat: 'DD/MM/YYYY',
                locale: 'es',
                showWeekNumbers: false
            }
        );
    }

    ngOnInit() {
        if (!this.value) {
            // this.onClear();
        }

        this.verifyMinDateSup();
        this.verifyMaxDayInf();
    }

    ngOnChanges(changes) {
        if (changes.clear && changes.clear.currentValue) {
            setTimeout(() => this.onClear());
        }

        if (changes.today && changes.today.currentValue) {
            this.getToday(!changes.today.firstChange);
            setTimeout(() => { this.todayChange.emit(false); });
        }

        if (changes.todayNextMonth && changes.todayNextMonth.currentValue) {
            this.getTodayNextMonth(!changes.todayNextMonth.firstChange);
            setTimeout(() => { this.todayNextMonthChange.emit(false); });
        }

        if (changes.todayPreviousMonth && changes.todayPreviousMonth.currentValue) {
            this.getTodayPreviousMonth(!changes.todayPreviousMonth.firstChange);
            setTimeout(() => { this.todayPreviousMonthChange.emit(false); });
        }

        if (changes.maxNextMonth && changes.maxNextMonth.currentValue) {
            this.getMaxNextMonth();
            setTimeout(() => { this.maxNextMonthChange.emit(false); });
        }

        if (changes.minPreviousMonth && changes.minPreviousMonth.currentValue) {
            this.getMinPreviousMonth();
            setTimeout(() => { this.minPreviousMonthChange.emit(false); });
        }

        if (changes.baseDateValue || changes.baseDatePeriod) {
            this.calcValueByBaseDate();
        }
    }

    verifyMinDateSup() {
        if (this.minDateSup) {
            const date = new Date(this.minDateSup);
            // date.setDate(date.getDate() + 1);
            this.minDate = date;
        }
    }

    verifyMaxDayInf() {
        if (this.maxDateInf) {
            const date = new Date(this.maxDateInf);
            date.setDate(date.getDate() - 1);
            this.maxDate = date;
        }
    }

    getToday(force) {
        if (force || !this.value) {
            const date = new Date();
            this.valueChange.emit(date);
        }
    }

    getTodayNextMonth(force) {
        if (force || !this.value) {
            const date = new Date();
            date.setMonth(date.getMonth() + 1);
            date.setDate(date.getDate() - 1);
            this.valueChange.emit(date);
        }
    }

    getTodayPreviousMonth(force) {
        if (force || !this.value) {
            const date = new Date();
            date.setMonth(date.getMonth() - 1);
            date.setDate(date.getDate() + 1);
            this.valueChange.emit(date);
        }
    }

    getMaxNextMonth() {
        if (this.maxNextMonth) {
            const date = new Date();
            date.setMonth(date.getMonth() + 1);
            date.setDate(date.getDate() - 1);
            this.maxDate = date;
        }
    }

    getMinPreviousMonth() {
        if (this.minPreviousMonth) {
            const date = new Date();
            date.setMonth(date.getMonth() - 1);
            date.setDate(date.getDate() + 1);
            this.minDate = date;
        }
    }

    async calcValueByBaseDate() {
        if (this.transac == 0 || this.transac == 1 ||
            this.transac == 4 || this.transac == 8) {

            if (!!this.baseDateValue && !!this.baseDatePeriod) {
                if (this.baseDatePeriod.toString() !== '6') {
                    let months = 1;

                    switch ((this.baseDatePeriod || '').toString()) {
                        case '5':
                            months = 1;
                            break;
                        case '4':
                            months = 2;
                            break;
                        case '3':
                            months = 3;
                            break;
                        case '2':
                            months = 6;
                            break;
                        case '1':
                            months = 12;
                            break;
                    }

                    // Corrección en el cálculo de fechas
                    let day = new Date(this.baseDateValue).getDate();
                    let month = new Date(this.baseDateValue).getMonth() + 1;
                    let year = new Date(this.baseDateValue).getFullYear();
                    month = month + months;

                    if (month > 12) {
                        month = month - 12;
                        year = year + 1;
                    }

                    const maxDay = new Date(year, month, 0).getDate();

                    let value = new Date();
                    let flag = 0;
                    for (var i = 0; i < 30; i++) {
                        if (day > maxDay) {
                            day = day - 1;
                            flag = 1;
                        } else {
                            value = new Date(month + "/" + day + "/" + year);
                        }
                    }

                    if (flag == 0) {
                        value.setDate(value.getDate() - 1);
                    }

                    this.value = value;

                    // Esto esta mal
                    // const value = new Date(this.baseDateValue);
                    // value.setMonth(value.getMonth() + months);
                    // value.setDate(value.getDate() - 1);


                    // servicios
                    // let value = await this.getFechaCalculate();
                    // this.value = value;
                    this.valueChange.emit(this.value);
                }
            }
        }
    }

    // async getFechaCalculate() {

    //     let value = new Date();

    //     let param: any = {
    //         ddate: new Date(this.baseDateValue),
    //         freq: this.baseDatePeriod
    //     };

    //     await this.accPersonalesService
    //         .getFechaFinService(param)
    //         .toPromise().then((res) => {
    //             value = new Date(res);
    //         });

    //     return value;
    // }

    varifyConditions() {
        this.verifyMinDateSup();
        this.verifyMaxDayInf();
    }

    onSelectItem() {
        setTimeout(() => {
            this.onSelect.emit(this.value);
        });
    }

    onClear() {
        this.valueChange.emit();
    }
}
