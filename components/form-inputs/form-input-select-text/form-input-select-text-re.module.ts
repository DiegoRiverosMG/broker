import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FormInputSelectTextREComponent } from './form-input-select-text-re.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
  ],
  declarations: [
    FormInputSelectTextREComponent,
  ],
  exports: [
    FormInputSelectTextREComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] 
})
export class FormInputSelectTextREModule {}