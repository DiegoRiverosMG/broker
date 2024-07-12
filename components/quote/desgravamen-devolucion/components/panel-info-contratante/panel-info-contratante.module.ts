import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PanelWidgetModule } from '../panel-widget/panel-widget.module';
import { FormInputRadioModule } from '../form-input-radio/form-input-radio.module';
import { FormInputSelectModule } from '../form-input-select/form-input-select.module';
import { FormInputTextModule } from '../form-input-text/form-input-text.module';
import { FormButtonModule } from '../form-button/form-button.module';

import { PanelInfoContratanteComponent } from './panel-info-contratante.component';
import { PanelInfoContratanteService } from './panel-info-contratante.service';

@NgModule({
  imports: [
    CommonModule,
    
    PanelWidgetModule,
    FormInputRadioModule,
    FormInputSelectModule,
    FormInputTextModule,
    FormButtonModule,
  ],
  declarations: [
    PanelInfoContratanteComponent,
  ],
  exports: [
    PanelInfoContratanteComponent,
  ],
  providers: [
    PanelInfoContratanteService,
  ]
})
export class PanelInfoContratanteModule {}