import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormButtonComponent } from './form-button.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    FormButtonComponent,
  ],
  exports: [
    FormButtonComponent,
  ]
})
export class FormButtonModule {}