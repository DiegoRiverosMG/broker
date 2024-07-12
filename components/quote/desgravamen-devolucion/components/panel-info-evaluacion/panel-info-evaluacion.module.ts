import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PanelWidgetModule } from '../panel-widget/panel-widget.module';
import { PanelTableModule } from '../panel-table/panel-table.module';
import { FormInputSelectModule } from '../form-input-select/form-input-select.module';
import { FormInputTextareaModule } from '../form-input-textarea/form-input-textarea.module';
import { FormInputFileModule } from '../form-input-file/form-input-file.module';

import { PanelInfoEvaluacionComponent } from './panel-info-evaluacion.component';

@NgModule({
  imports: [
    CommonModule,
    
    PanelWidgetModule,
    PanelTableModule,
    FormInputSelectModule,
    FormInputTextareaModule,
    FormInputFileModule,
  ],
  declarations: [PanelInfoEvaluacionComponent],
  exports: [PanelInfoEvaluacionComponent],
})
export class PanelInfoEvaluacionModule { }
