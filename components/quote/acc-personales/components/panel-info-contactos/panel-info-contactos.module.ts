import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PanelWidgetModule } from '../panel-widget/panel-widget.module';
import { FormButtonModule } from '../form-button/form-button.module';
import { FormInputSelectModule } from '../form-input-select/form-input-select.module';
import { FormInputTextModule } from '../form-input-text/form-input-text.module';
import { PanelTableModule } from '../panel-table/panel-table.module';
import { PanelModalModule } from '../panel-modal/panel-modal.module';

import { PanelInfoContactosComponent } from './panel-info-contactos.component';

@NgModule({
  imports: [
    CommonModule,
    
    PanelWidgetModule,
    FormButtonModule,
    FormInputSelectModule,
    FormInputTextModule,
    PanelTableModule,
    PanelModalModule,
  ],
  declarations: [
    PanelInfoContactosComponent,  
  ],
  exports: [
    PanelInfoContactosComponent,
  ]
})
export class PanelInfoContactosModule {}