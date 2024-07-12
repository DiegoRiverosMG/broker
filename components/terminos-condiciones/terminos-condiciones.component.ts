import {
  Component,
  OnInit,
  ViewChild,
  Input,
  OnChanges,
  SimpleChanges,
  SimpleChange
} from '@angular/core';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-terminos-condiciones',
  templateUrl: './terminos-condiciones.component.html',
  styleUrls: ['./terminos-condiciones.component.css']
})
export class TerminosCondicionesComponent implements OnInit, OnChanges {
  @ViewChild('modalTerminosCondiciones', { static: true }) modalTerminosCondiciones;
  // Datos de entrada
  @Input() mensaje: string;
  @Input() visualizar: boolean;
  @Output() visualizarChange = new EventEmitter<boolean>();

  constructor() {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    const ver: SimpleChange = changes.visualizar;

    if (ver.currentValue === true) {
      this.modalTerminosCondiciones.show();
    } else {
      this.modalTerminosCondiciones.hide();
    }
  }

  aceptarTerminos() {
    this.visualizar = false;
    this.visualizarChange.emit(this.visualizar);
  }
}
