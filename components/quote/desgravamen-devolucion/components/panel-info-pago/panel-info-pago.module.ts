import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedAppModule } from '../../../../../../shared-app/shared-app.module';

import { PanelModalModule } from '../panel-modal/panel-modal.module';
import { FormButtonModule } from '../form-button/form-button.module';

import { PanelInfoPagoComponent } from './panel-info-pago.component';
import { FormInputFileModule } from '../form-input-file/form-input-file.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,

    SharedAppModule,

    PanelModalModule,
    FormButtonModule,
    FormInputFileModule
  ],
  declarations: [PanelInfoPagoComponent],
  exports: [PanelInfoPagoComponent],
})
export class PanelInfoPagoModule { }
