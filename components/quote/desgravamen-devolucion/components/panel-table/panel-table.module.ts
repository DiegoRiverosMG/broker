import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { PaginationModule } from 'ngx-bootstrap';

import { FormInputSelectModule } from '../form-input-select/form-input-select.module';

import { PanelTableComponent } from './panel-table.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    
    NgbModule,
    // PaginationModule,
    
    FormInputSelectModule,
  ],
  declarations: [
    PanelTableComponent,
  ],
  exports: [
    PanelTableComponent,
  ]
})
export class PanelTableModule {}