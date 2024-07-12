import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ngfModule } from 'angular-file';

import { FormInputFileComponent } from './form-input-file.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    
    ngfModule,
  ],
  declarations: [
    FormInputFileComponent,
  ],
  exports: [
    FormInputFileComponent,
  ]
})
export class FormInputFileModule {}