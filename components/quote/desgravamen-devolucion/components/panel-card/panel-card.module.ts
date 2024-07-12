import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PanelCardComponent } from './panel-card.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    PanelCardComponent,
  ],
  exports: [
    PanelCardComponent,
  ]
})
export class PanelCardModule {}