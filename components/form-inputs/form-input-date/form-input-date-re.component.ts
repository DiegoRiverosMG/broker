import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  ChangeDetectionStrategy,
} from '@angular/core';

import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { UtilService } from '../../../../../layout/broker/components/quote/acc-personales/core/services/util.service';

@Component({
  selector: 'form-input-date-re',
  templateUrl: './form-input-date-re.component.html',
  styleUrls: ['./form-input-date-re.component.css'],
})
export class FormInputDateREComponent implements OnInit, OnChanges {
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
  @Input() baseCuotas: string;

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

  constructor() {
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        showWeekNumbers: false,
      }
    );
  }

  ngOnInit() {
    this.verifyMinDateSup();
    this.verifyMaxDayInf();
  }

  ngOnChanges(changes) {
    if (changes.clear && changes.clear.currentValue) {
      setTimeout(() => this.onClear());
    }

    if (changes.today && changes.today.currentValue) {
      this.getToday(!changes.today.firstChange);
      setTimeout(() => {
        this.todayChange.emit(false);
      });
    }

    if (changes.todayNextMonth && changes.todayNextMonth.currentValue) {
      this.getTodayNextMonth(!changes.todayNextMonth.firstChange);
      setTimeout(() => {
        this.todayNextMonthChange.emit(false);
      });
    }

    if (changes.todayPreviousMonth && changes.todayPreviousMonth.currentValue) {
      this.getTodayPreviousMonth(!changes.todayPreviousMonth.firstChange);
      setTimeout(() => {
        this.todayPreviousMonthChange.emit(false);
      });
    }

    if (changes.maxNextMonth && changes.maxNextMonth.currentValue) {
      this.getMaxNextMonth();
      setTimeout(() => {
        this.maxNextMonthChange.emit(false);
      });
    }

    if (changes.minPreviousMonth && changes.minPreviousMonth.currentValue) {
      this.getMinPreviousMonth();
      setTimeout(() => {
        this.minPreviousMonthChange.emit(false);
      });
    }

    if (changes.baseDateValue || changes.baseDatePeriod || changes.baseCuotas) {
      if (this.baseCuotas.toString() != '0') {
        this.calcValueByBaseDate();
      }
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

  calcValueByBaseDate() {
    if (
      this.transac == 0 ||
      this.transac == 1 ||
      this.transac == 4 ||
      this.transac == 8
    ) {
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

          const value = new Date(this.baseDateValue);
          value.setMonth(value.getMonth() + months);
          value.setDate(value.getDate() - 1);

          this.value = value;
          this.valueChange.emit(this.value);
        } else {
          let months = 1;
          if (this.baseCuotas != null && this.baseCuotas != undefined) {
            months = parseInt(this.baseCuotas.toString());
          }
          const value = new Date(this.baseDateValue);
          value.setMonth(value.getMonth() + months);
          value.setDate(value.getDate() - 1);

          this.value = value;
          this.valueChange.emit(this.value);
        }
      }
    }
  }

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
