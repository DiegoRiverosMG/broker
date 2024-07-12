import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FormInputTextareaComponent } from './form-input-textarea.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
  ],
  declarations: [
    FormInputTextareaComponent,
  ],
  exports: [
    FormInputTextareaComponent,
  ]
})
export class FormInputTextareaModule {}