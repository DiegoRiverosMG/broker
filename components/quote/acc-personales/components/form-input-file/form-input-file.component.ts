import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges } from '@angular/core';

import { UtilService } from '../../core/services/util.service';

@Component({
  selector: 'form-input-file',
  templateUrl: './form-input-file.component.html',
  styleUrls: ['./form-input-file.component.css']
})
export class FormInputFileComponent implements OnInit, OnChanges, OnDestroy {

  @Input() label: string;
  @Input() required: boolean;
  @Input() disabled: boolean;
  @Input() multiple: boolean;
  @Input() siniestralidad: boolean;

  @Input() value: any;
  @Output() valueChange: EventEmitter<any> = new EventEmitter();

  @Input() cotizacion: any;
  @Output() cotizacionChange: EventEmitter<any> = new EventEmitter();

  name: string = UtilService.getControlName();

  files: any = [];

  ngOnChanges(changes) {
    if (!this.value) {
      this.clear();
    }
  }

  ngOnInit() {
    if (!this.value) {
      this.clear();
    }
  }

  seleccionFile(file) {
    this.value = file;
    this.valueChange.emit(this.value);
  }

  seleccionFiles(files) {
    this.value = files;
    this.valueChange.emit(this.value);
  }

  clear() {
    this.cotizacion.trama.validado = false;
    this.cotizacionChange.emit(this.cotizacion);
    this.valueChange.emit(this.value);
  }

  ngOnDestroy() {
    this.value = null;
    this.valueChange.emit(this.value);
  }
}
