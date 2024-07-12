import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BrokerPipesModule } from '../../../../../pipes/broker.pipes.module';

import { PanelWidgetModule } from '../panel-widget/panel-widget.module';
import { FormButtonModule } from '../form-button/form-button.module';
import { FormInputSelectModule } from '../form-input-select/form-input-select.module';
import { FormInputTextModule } from '../form-input-text/form-input-text.module';
import { FormInputRadioModule } from '../form-input-radio/form-input-radio.module';
import { PanelTableModule } from '../panel-table/panel-table.module';
import { PanelModalModule } from '../panel-modal/panel-modal.module';
import { PanelCardModule } from '../panel-card/panel-card.module';

import { PanelInfoBrokersComponent } from './panel-info-brokers.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    
    BrokerPipesModule,
    
    PanelWidgetModule,
    FormButtonModule,
    FormInputSelectModule,
    FormInputTextModule,
    FormInputRadioModule,
    PanelTableModule,
    PanelModalModule,
    PanelCardModule,
  ],
  declarations: [
    PanelInfoBrokersComponent,  
  ],
  exports: [
    PanelInfoBrokersComponent,
  ]
})
export class PanelInfoBrokersModule {}