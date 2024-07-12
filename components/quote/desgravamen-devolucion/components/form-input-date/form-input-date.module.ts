import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import { FormInputDateComponent } from './form-input-date.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,

    BsDatepickerModule,
  ],
  declarations: [
    FormInputDateComponent,
  ],
  exports: [
    FormInputDateComponent,
  ]
})
export class FormInputDateModule { }
