import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FormInputRadioComponent } from './form-input-radio.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
  ],
  declarations: [
    FormInputRadioComponent,
  ],
  exports: [
    FormInputRadioComponent,
  ]
})
export class FormInputRadioModule {}