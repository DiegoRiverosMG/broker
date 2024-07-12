import { NgModule }  from '@angular/core';
import { CommonModule } from '@angular/common';

import { PanelWidgetModule } from '../panel-widget/panel-widget.module';
import { FormInputSelectModule } from '../form-input-select/form-input-select.module';
import { FormInputFileModule } from '../form-input-file/form-input-file.module';
import { FormButtonModule } from '../form-button/form-button.module';

import { PanelInfoTramaComponent } from './panel-info-trama.component';

@NgModule({
  imports: [
    CommonModule,
    
    PanelWidgetModule,
    FormInputSelectModule,
    FormInputFileModule,
    FormButtonModule,
  ],
  declarations: [
    PanelInfoTramaComponent,
  ],
  exports: [
    PanelInfoTramaComponent,
  ]
})
export class PanelInfoTramaModule {}