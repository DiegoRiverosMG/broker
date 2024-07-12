import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LoadingScreenComponent } from './loading-screen.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
  ],
  declarations: [
    LoadingScreenComponent,
  ],
  exports: [
    LoadingScreenComponent,
  ]
})
export class LoadingScreenModule {}