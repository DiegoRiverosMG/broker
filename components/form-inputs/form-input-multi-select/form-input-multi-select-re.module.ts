import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FormInputMultiSelectREComponent } from './form-input-multi-select-re.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
  ],
  declarations: [
    FormInputMultiSelectREComponent,
  ],
  exports: [
    FormInputMultiSelectREComponent,
  ]
})
export class FormInputMultiSelectREModule {}