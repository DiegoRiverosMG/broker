import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormButtonModule } from '../form-button/form-button.module';

import { PanelModalComponent } from './panel-modal.component';
import { SharedAppModule } from './../../../../../../shared-app/shared-app.module';

@NgModule({
  imports: [
    CommonModule,

    FormButtonModule,
    SharedAppModule
  ],
  declarations: [
    PanelModalComponent,
  ],
  exports: [
    PanelModalComponent,
  ]
})
export class PanelModalModule { }
