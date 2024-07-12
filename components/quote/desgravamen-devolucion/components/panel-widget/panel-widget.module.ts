import { NgModule } from '@angular/core';

import { PanelWidgetComponent } from './panel-widget.component';

@NgModule({
  declarations: [
    PanelWidgetComponent,
  ],
  exports: [
    PanelWidgetComponent,
  ]
})
export class PanelWidgetModule {}