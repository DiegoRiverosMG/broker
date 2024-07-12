import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FormInputSelectModule } from '../form-input-select/form-input-select.module';
import { FormInputTextModule } from '../form-input-text/form-input-text.module';

import { FormSearchClientComponent } from './form-search-client.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    
    FormInputSelectModule,
    FormInputTextModule,
  ],
  declarations: [
    FormSearchClientComponent,
  ],
  exports: [
    FormSearchClientComponent,
  ]
})
export class FormSearchClientModule {}