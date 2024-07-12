import { NgModule } from '@angular/core';

import { PanelHeadeProductoComponent } from './panel-header-producto.component';

@NgModule({
  declarations: [
    PanelHeadeProductoComponent,
  ],
  exports: [
    PanelHeadeProductoComponent,
  ]
})
export class PanelHeaderProductoModule {}