import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FormInputTextComponent } from './form-input-text.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
  ],
  declarations: [
    FormInputTextComponent,
  ],
  exports: [
    FormInputTextComponent,
  ]
})
export class FormInputTextModule {}