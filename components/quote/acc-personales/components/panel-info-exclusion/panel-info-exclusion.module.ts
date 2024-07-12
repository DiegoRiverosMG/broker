import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelWidgetModule } from '../panel-widget/panel-widget.module';
import { PanelTableModule } from '../panel-table/panel-table.module';
import { FormInputSelectModule } from '../form-input-select/form-input-select.module';
import { FormInputTextareaModule } from '../form-input-textarea/form-input-textarea.module';
import { FormInputFileModule } from '../form-input-file/form-input-file.module';
import { PanelInfoExclusionComponent } from './panel-info-exclusion.component';
import { FormInputCheckboxModule } from '../form-input-checkbox/form-input-checkbox.module';
import { FormInputTextModule } from '../form-input-text/form-input-text.module';
import { BrokerPipesModule } from '../../../../../pipes/broker.pipes.module';


@NgModule({
  imports: [
    CommonModule,
    BrokerPipesModule,
    PanelWidgetModule,
    PanelTableModule,
    FormInputSelectModule,
    FormInputCheckboxModule,
    FormInputTextareaModule,
    FormInputFileModule,
    FormInputTextModule
  ],
  declarations: [PanelInfoExclusionComponent],
  exports: [PanelInfoExclusionComponent],
})
export class PanelInfoExclusionModule { }
