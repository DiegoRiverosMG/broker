import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { isNumeric } from 'rxjs/internal-compatibility';
import { AccPersonalesConstants } from '../../../../../layout/broker/components/quote/acc-personales/core/constants/acc-personales.constants';
import { UtilService } from '../../../../../layout/broker/components/quote/acc-personales/core/services/util.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'form-input-text-re',
  templateUrl: './form-input-text-re.component.html',
  styleUrls: ['./form-input-text-re.component.css'],
})
export class FormInputTextREComponent implements OnInit, OnDestroy {
  //Alex Gallozo 14/03/2023 Mostrando campo "número de crédito" cuando sea necesario.
  @Input() detail: boolean;
  @Input() label: string;
  @Input() placeholder: string;
  @Input() maxCaracter: string;
  @Input() classInput: string;
  @Input() required: boolean;
  @Input() disabled: boolean;
  @Input() clearOnDestroy: boolean;
  @Input() span: boolean;
  @Input() onlyInput: boolean;
  //Alex Gallozo 13/03/2023 Ocultando los campos “Tipo de Facturación, Renovable, Tipo renovación" al Usuario
  @Input() isRequiredInVcfQuote: boolean;

  @Input() value: any;
  @Output() valueChange: EventEmitter<any> = new EventEmitter();

  @Input() clear: boolean;
  @Output() clearChange: EventEmitter<any> = new EventEmitter();

  @Output() onKeypress: EventEmitter<any> = new EventEmitter();
  @Output() onKeypressNoEnter: EventEmitter<any> = new EventEmitter();
  @Output() onKeyenter: EventEmitter<any> = new EventEmitter();
  @Output() onBlur: EventEmitter<any> = new EventEmitter();
  @Output() onFocus: EventEmitter<any> = new EventEmitter();
  @Output() onFocusOut: EventEmitter<any> = new EventEmitter();

  @Input() patternPrevent: any;
  CONSTANTS: any = AccPersonalesConstants;

  name: string = UtilService.getControlName();

  //Inicio Alex Gallozo 13/03/2023 Ocultando los campos “Tipo de Facturación, Renovable, Tipo renovación" al Usuario
  constructor(private route: ActivatedRoute) {

  }


  ngOnInit() {

       this.route.url.subscribe(params => {
         if (params[0].path === "cotizador") {
           this.isRequiredInVcfQuote = false
         }
         else this.isRequiredInVcfQuote = true
        }
      );
  }

  //Fin Alex Gallozo 13/03/2023 Ocultando los campos “Tipo de Facturación, Renovable, Tipo renovación" al Usuario

  ngOnChanges(changes) {
    if (changes.clear && changes.clear.currentValue) {
      setTimeout(() => this.onClear());
    }
  }

  onPaste(event) {
    let clipboardData = event.clipboardData;
    let pastedText = clipboardData.getData('text');

    if (this.patternPrevent) {
      let reg = this.patternPrevent;

      if (reg == this.CONSTANTS.REGEX.PORCENTAJE) {
        let next = pastedText.includes('..');
        if (next == true) {
          event.preventDefault();
        }
      }
      if (!reg.test(pastedText)) {
        event.preventDefault();
      }
    } else {
      let reg = this.CONSTANTS.REGEX.ALFANUMERICO;
      if (!reg.test(pastedText)) {
        event.preventDefault();
      }
    }
  }

  onKey(event) {
  

    if (this.patternPrevent) {
      if (event.keyCode != 13) {
        let reg = this.patternPrevent;

        if (reg == this.CONSTANTS.REGEX.PORCENTAJE) {
          let current = this.value.toString();
          let next = current.includes('..');
          if (next == true) {
            this.value = this.value.slice(0, -2);
            event.preventDefault();
          }
        }

        if (!reg.test((this.value ? this.value : '') + event.key)) {
          event.preventDefault();

        } else {
          this.onKeypress.emit(event);
        }
      }
    } else {
      this.onKeypress.emit(event);
    }

    switch (event.keyCode) {
      case 13:
        this.onKeyenter.emit(event);
        break;
      default:
        this.onKeypressNoEnter.emit(event);
        break;
    }
  }

  onKeydown(event) {
    var key = event.keyCode || event.charCode;
    if (key == 8) {
      this.onKeypressNoEnter.emit(event);
    }
  }

  onClear() {
    this.value = '';
    this.valueChange.emit('');
    this.clearChange.emit(false);
  }

  ngOnDestroy() {
    if (this.clearOnDestroy === false) {
      this.onClear();
    }
  }
}
