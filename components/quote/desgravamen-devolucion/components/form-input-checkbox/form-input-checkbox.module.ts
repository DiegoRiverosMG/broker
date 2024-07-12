import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FormInputCheckboxComponent } from './form-input-checkbox.component';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
	],
	declarations: [
		FormInputCheckboxComponent,
	],
	exports: [
		FormInputCheckboxComponent,
	],
})
export class FormInputCheckboxModule {}