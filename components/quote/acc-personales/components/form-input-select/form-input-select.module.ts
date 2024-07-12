import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FormInputSelectComponent } from './form-input-select.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
  ],
  declarations: [
    FormInputSelectComponent,
  ],
  exports: [
    FormInputSelectComponent,
  ]
})
export class FormInputSelectModule {}