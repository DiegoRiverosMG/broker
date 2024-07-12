import { Component, Input, Output, EventEmitter, OnInit, OnChanges, OnDestroy } from '@angular/core';

import { UtilService } from '../../core/services/util.service';

@Component({
  selector: 'form-input-select',
  templateUrl: './form-input-select.component.html',
  styleUrls: ['./form-input-select.component.css']
})
export class FormInputSelectComponent implements OnInit, OnChanges, OnDestroy {

  @Input() label: string;
  @Input() required: boolean;
  @Input() disabled: boolean;
  @Input() order: boolean;
  @Input() detail: boolean;
  @Input() labelInline: boolean;
  @Input() isValue: boolean;
  @Input() small: boolean;
  @Input() clearOnDestroy: boolean;
  @Input() onlyInput: boolean;
  @Input() updateModelOnChange: boolean;

  @Input() fieldId: string;
  @Input() fieldCodigo: string;
  @Input() fieldValor: string;
  @Input() fieldItems: string;
  @Input() fieldsValor: any;
  @Input() filterItems: any[] = [];
  @Input() filterItemsExclude: boolean;

  @Input() firstAll: boolean;
  @Input() firstSelect: boolean;
  @Input() firstByDefault: boolean;
  @Input() firstSuspensivo: boolean;
  @Input() firstLoading: boolean;
  @Input() alwaysSelect: boolean;

  @Input() service: any;
  @Input() method: string;
  @Input() params: any;

  @Input() value: any;
  @Output() valueChange: EventEmitter<any> = new EventEmitter();

  @Input() codValue: any;
  @Output() codValueChange: EventEmitter<any> = new EventEmitter();

  @Input() items: any = [];
  @Input() itemsArray: boolean;
  @Output() itemsChange: EventEmitter<any> = new EventEmitter();

  @Input() hasItems: boolean;
  @Output() hasItemsChange: EventEmitter<any> = new EventEmitter();

  @Input() defaultValue: any;

  @Input() clear: boolean;
  @Output() clearChange: EventEmitter<any> = new EventEmitter();

  @Input() loader: boolean;
  @Output() loaderChange: EventEmitter<any> = new EventEmitter();

  @Output() onSelect: EventEmitter<any> = new EventEmitter();

  originalItems: any = [];
  objectAll: any = { codigo: '', valor: '- Todos -', text: '- Todos -' };
  objectSelect: any = {  codigo: '', valor: '- Seleccione -', text: '- Seleccione -' };
  objectByDefault: any = { codigo: '', valor: 'Por defecto', text: 'Por defecto' };
  objectSuspensivo: any = { codigo: '', valor: '...', text: '...' };
  objectLoading: any = { codigo: '', valor: '- Cargando -', text: '- Cargando -' };
  objectSinElementos: any = { codigo: '', valor: '- Seleccione -', text: '- Seleccione -' };

  isByService: boolean;

  name: string = UtilService.getControlName();

  ngOnChanges(changes) {
    if (this.originalItems.length && (
      (changes.filterItems && changes.filterItems.currentValue && changes.filterItems.previousValue !== undefined) ||
      (changes.filterItemsExclude && changes.filterItemsExclude.currentValue != undefined))) {
      setTimeout(() => { this.changeFilterItems(false) });
    }
    if (this.originalItems.length && changes.filterItems && !changes.filterItems.currentValue && changes.filterItems.previousValue) {
      setTimeout(() => { this.changeFilterItems(true) });
    }
    if (changes.params && changes.params.currentValue && !!this.service) {
      this.getService();
    }
    if (this.itemsArray && !!this.items) {
      this.onLoadData();
    }
    if (changes.clear && changes.clear.currentValue) {
      setTimeout(() => { this.onClear(); });
    }

    if (changes.value && changes.value.currentValue) {
      setTimeout(() => {
        if (!this.isValue) {
          this.setLabelText(this.value);
          if (this.updateModelOnChange) {
            this.onLoadData();
          }
        }
      });
    }
  }

  ngOnInit() {
    if (!this.value) {
      this.onClear();
    }

    if (this.defaultValue) {
      if (!this.value) {
        this.defaultValue.codigo = this.getCodeValue(this.defaultValue);
        this.defaultValue.valor = this.getTextValue(this.defaultValue);
        this.onChange(UtilService.copy(this.defaultValue))
      }
    }

    if (this.service && !this.params) {
      this.getService();
    }

    if (this.detail && !this.isValue) {
      this.setLabelText(this.value);
    }

    if (!this.service && !!this.items) {
      this.onLoadData(this.value);
    }
  }

  validateParams(params: any) {
    var errors = [];
    for (let variable in params) {
      if (params[variable] === null ||
        params[variable] === "" ||
        params[variable] === "null" ||
        params[variable] === undefined) {
        errors.push(variable);
      }
    }

    let flag = errors.length == 0 ? true : false;
    return flag;
  }

  changeFilterItems(isAll?, defaultValue?) {
    if (!this.isValue) {
      if (isAll) {
        this.items = this.originalItems;
      } else if (this.filterItems && this.filterItems.length) {
        this.items = (this.originalItems || []).filter((item: any = {}) => {
          let indexOf = this.filterItems.indexOf(this.getIdValue(item))
          return this.filterItemsExclude ? (indexOf == -1) : (indexOf != -1);
        });
      }

      this.setValue(defaultValue);
    }
  }

  async getService() { // Revisar
    this.items = [];
    this.isByService = true;
    this.hasItems = true;

    if (this.firstLoading) {
      this.items.unshift({ ...this.objectLoading });
    }

    this.loaderChange.emit(true);
    if (this.validateParams(this.params)) {
      await (this.params ?
        this.service[this.method](this.params) :
        this.service[this.method]()
      ).toPromise().then(data => {
        this.originalItems = [...UtilService.getProperty(data, this.fieldItems)];

        if (this.order){
          this.originalItems.sort(function (a, b) {
            if (a.DES_TIPO_RENOVACION > b.DES_TIPO_RENOVACION) {
              return 1;
            }
            if (a.DES_TIPO_RENOVACION < b.DES_TIPO_RENOVACION) {
              return -1;
            }
            return 0;
          });
        }

        this.originalItems.map((v, index) => {
          v.id = this.getIdValue(v);
          v.text = this.getTextValue(v);
          return v;
        });

        this.items = this.originalItems;

        if (this.alwaysSelect && !this.defaultValue) {
          this.items.unshift({ ...this.objectSelect });
        }

        this.itemsChange.emit(this.items);

        this.changeFilterItems(false, this.value || this.defaultValue);

        this.hasItems = this.items && this.items.length > 0;
        this.hasItemsChange.emit(this.hasItems);

        if (!this.hasItems) {
          this.items = [this.objectSinElementos];
          this.value = this.items[0];
        }

        if (this.defaultValue) {
          this.setDefaultValue();
        }

        this.onLoadData(this.value || this.defaultValue);

        this.loaderChange.emit(false);
      },
        error => {
          this.loaderChange.emit(false);
        }
      );
    } else {

      if (this.alwaysSelect) {
        this.items.unshift({ ...this.objectSelect });
      }

      if (this.defaultValue) {
        this.setDefaultValue();
      }

      this.onLoadData(this.value || this.defaultValue);
      this.loaderChange.emit(false);
    }

  }

  onLoadData(defaultValue?) {
    if (this.isValue && !this.value && this.value !== 0) {
      this.onChange(this.items[0]);
    }

    if (!this.isValue) {
      this.items = this.items.map(a => {
        this.setLabelText(a);
        return a;
      });
    }

    if (this.items && this.items.length) {
      if (this.getCodeValue(this.items[0]) != '') {
        let isDefault;
        if (this.firstAll) {
          isDefault = true;
          this.items.unshift({ ...this.objectAll });
        }
        if (this.firstSelect) {
          isDefault = true;
          this.items.unshift({ ...this.objectSelect });
        }
        if (this.firstByDefault) {
          isDefault = true;
          this.items.unshift({ ...this.objectByDefault });
        }
        if (this.firstSuspensivo) {
          isDefault = true;
          this.items.unshift({ ...this.objectSuspensivo });
        }
        if (isDefault) {
          if (this.fieldValor) {
            this.items[0][this.fieldValor] = this.items[0].valor;
          }
        }
      }
      if (!this.isValue) {
        this.setValue(defaultValue);
      }
    }
  }

  setDefaultValue() {
    this.setValue(this.value || this.defaultValue);
  }

  setValue(defaultValue?) {
    let model = UtilService.copy(defaultValue) || this.value || { codigo: this.codValue };
    if (model && ((this.getCodeValue(model) || Number.isInteger(this.getCodeValue(model))) || model.text)) {
      this.value = this.items.filter(v => { return this.getIdValue(v) == this.getIdValue(model); })[0];
      if (this.value) {
        this.onChange(this.value);
      } else {
        this.onChange(this.items[0]);
      }
    } else {
      this.onChange(this.items[0]);
    }
  }

  getIdValue(item: any = {}) {
    return (item[this.fieldId] || item.id || item[this.fieldCodigo] || item.codigo);
  }

  getCodeValue(item: any = {}) {
    return (item[this.fieldCodigo] || item.codigo);
  }

  getTextValue(item: any = {}) {
    return (item[this.fieldValor] || item.valor);
  }

  setLabelText(item) {
    if (!this.isValue && !!item) {
      if (this.fieldValor) {
        item.text = this.getTextValue(item);
      } else if (this.fieldsValor) {
        item.text = this.fieldsValor.map(v => { return item[v]; }).join(' - ');
      } else {
        item.text = this.getTextValue(item);
      }
      item.codigo = this.getCodeValue(item);
      item.valor = this.getTextValue(item);
    }
  }

  onClear() {
    if (this.items && this.items.length) {
      this.onChange(this.items[0]);
    }
    this.clearChange.emit(false);
  }

  onChange(item, updateInput?) {
    setTimeout(() => {
      if (updateInput !== false) {
        this.valueChange.emit(item);
        this.codValueChange.emit(this.isValue ? item : UtilService.getProperty(item, 'codigo'));
      };
      this.value = item;
    });
  }

  onSelectItem() {
    setTimeout(() => {
      this.onSelect.emit(this.value)
    })
  }

  ngOnDestroy() {
    if (this.clearOnDestroy === true) {
      this.valueChange.emit(undefined);
    }
  }
}
