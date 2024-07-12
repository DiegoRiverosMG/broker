import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import { FormInputDateREComponent } from './form-input-date-re.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,

    BsDatepickerModule,
  ],
  declarations: [
    FormInputDateREComponent,
  ],
  exports: [
    FormInputDateREComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA,NO_ERRORS_SCHEMA] 
})
export class FormInputDateREModule { }
