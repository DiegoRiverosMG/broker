import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NavmenusctrComponent } from './navmenusctr.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
  ],
  declarations: [
    NavmenusctrComponent,
  ],
  exports: [
    NavmenusctrComponent,
  ],
})
export class NavmenusctrModule {}