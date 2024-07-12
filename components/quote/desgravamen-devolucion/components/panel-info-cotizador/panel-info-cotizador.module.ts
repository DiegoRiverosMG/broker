import { NgModule }  from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BrokerPipesModule } from '../../../../../pipes/broker.pipes.module';

import { PanelWidgetModule } from '../panel-widget/panel-widget.module';
import { PanelTableModule } from '../panel-table/panel-table.module';
import { PanelModalModule } from '../panel-modal/panel-modal.module';
import { FormInputSelectModule } from '../form-input-select/form-input-select.module';
import { FormInputTextModule } from '../form-input-text/form-input-text.module';
import { FormInputTextareaModule } from '../form-input-textarea/form-input-textarea.module';
import { FormInputCheckboxModule } from '../form-input-checkbox/form-input-checkbox.module';
import { FormInputFileModule } from '../form-input-file/form-input-file.module';
import { FormButtonModule } from '../form-button/form-button.module';

import { PanelInfoCotizadorComponent } from './panel-info-cotizador.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    
    BrokerPipesModule,
    
    PanelWidgetModule,
    PanelTableModule,
    PanelModalModule,
    FormInputSelectModule,
    FormInputTextModule,
    FormInputCheckboxModule,
    FormInputTextareaModule,
    FormInputFileModule,
    FormButtonModule,
  ],
  declarations: [
    PanelInfoCotizadorComponent,
  ],
  exports: [
    PanelInfoCotizadorComponent,
  ]
})
export class PanelInfoCotizadorModule {}