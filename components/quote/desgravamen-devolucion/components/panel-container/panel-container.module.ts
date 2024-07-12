import { NgModule } from '@angular/core';

import { PanelContainerComponent } from './panel-container.component';

@NgModule({
  declarations: [
    PanelContainerComponent,
  ],
  exports: [
    PanelContainerComponent,
  ]
})
export class PanelContainerModule {}