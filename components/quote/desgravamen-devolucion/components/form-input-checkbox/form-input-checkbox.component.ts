import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

import { UtilService } from '../../core/services/util.service';

@Component({
  selector: 'form-input-checkbox',
  templateUrl: './form-input-checkbox.component.html',
  styleUrls: ['./form-input-checkbox.component.css']
})
export class FormInputCheckboxComponent implements OnInit {

  @Input() label: string;
  @Input() disabled: boolean;
  @Input() inlineInput: boolean;
  @Input() required: boolean;

  @Input() items: any = [];

  @Input() itemsSelected: any = [];
  @Output() itemsSelectedChange: EventEmitter<any> = new EventEmitter();

  @Input() mapSelected: any;
  @Output() mapSelectedChange: EventEmitter<any> = new EventEmitter();

  name: string = UtilService.getControlName();

  verify: any = {};

  ngOnInit() {
    this.initSelected();
  }

  initSelected() {
    if (this.itemsSelected) {
      this.items.forEach(item => {
        let _item = ((this.itemsSelected || []).filter(_item => _item.codigo == item.codigo) || [])[0];
        if (_item) {
          item.isSelected = true;
        }
      })
    }

    if (!!this.mapSelected ) {
      this.items.forEach(item => {
        item.isSelected = this.mapSelected[item.codigo] === true;
      })
    }
    
  

    this.onSelect();
  }

  onSelect() {
    let _itemsSelected = [];
    let _mapSelected = {};
    this.items.forEach(item => {
      if (item.isSelected) {
        _itemsSelected.push(item);
      }
      _mapSelected[item.codigo] = !!item.isSelected;
    });

    this.verify.anySelected = _itemsSelected.length;
    this.onChange(_itemsSelected, _mapSelected);
  }

  onChange(items, map) {
    this.itemsSelected = items;
    this.itemsSelectedChange.emit(items);

    this.mapSelected = map;
    this.mapSelectedChange.emit(map);
  }

}
