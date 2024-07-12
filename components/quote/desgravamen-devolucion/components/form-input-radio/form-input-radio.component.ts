import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';

import { UtilService } from '../../core/services/util.service';

@Component({
  selector: 'form-input-radio',
  templateUrl: './form-input-radio.component.html',
  styleUrls: ['./form-input-radio.component.css']
})
export class FormInputRadioComponent implements OnInit, OnChanges {
  
  @Input() label;
  @Input() items;

  @Input() value;
  @Output() valueChange: EventEmitter<any> = new EventEmitter();
	
	@Input() clear: boolean;
	@Output() clearChange: EventEmitter<any> = new EventEmitter();	
  
  @Output() onSelect: EventEmitter<any> = new EventEmitter();
  
  name: string = UtilService.getControlName();
  
  ngOnInit() {
    if(!this.value) {
      this.onClear();
    }
  }
	
	ngOnChanges(changes) {
		if(changes.clear && changes.clear.currentValue) {			
			setTimeout(() => this.onClear());
		}
	}
  
  onClear() {
		if(this.items && this.items.length) {
			this.valueChange.emit(this.items[0].codigo);
		}
		this.clearChange.emit(false);
  }
	
	onSelectItem() {
		setTimeout(() => {
			this.onSelect.emit(this.value)
		})
	}
}