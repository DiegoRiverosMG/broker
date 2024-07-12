import { Component, Input, Output, EventEmitter } from '@angular/core';

import { UtilService } from '../../core/services/util.service';

@Component({
  selector: 'form-button',
  templateUrl: './form-button.component.html',
  styleUrls: ['./form-button.component.css']
})
export class FormButtonComponent {
  
  @Input() label: string;
  @Input() disabled: boolean;
  @Input() inlineInput: boolean;
  @Input() icon: string;
  @Input() btnClass: string;
  @Input() slim: string;

  @Output() onClick: EventEmitter<any> = new EventEmitter();
}