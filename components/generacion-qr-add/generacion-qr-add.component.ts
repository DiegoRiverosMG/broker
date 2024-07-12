import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-generacion-qr-add',
  templateUrl: './generacion-qr-add.component.html',
  styleUrls: ['./generacion-qr-add.component.css'],
})
export class GeneracionQrAddComponent implements OnInit {
  dataImportada: Array<any>;
  constructor() {
    this.dataImportada = [
      {
        id: 1,
        tipo_documento: 'DNI',
        numero_documento: 70602807,
        nombres: 'KAREN',
        apellido_paterno: 'RAMOS',
        apellido_materno: 'BENAVIDES',
        telefono_fijo: 30313021,
        telefono_celular: 956933907,
        email: 'KAREN@HOTMAIL.COM',
        cargo: 'USUARIO',
      },
      {
        id: 2,
        tipo_documento: 'DNI',
        numero_documento: 70641807,
        nombres: 'ANA',
        apellido_paterno: 'TRILLO',
        apellido_materno: 'GUIDO',
        telefono_fijo: 30313021,
        telefono_celular: 956933907,
        email: 'ANA@HOTMAIL.COM',
        cargo: 'USUARIO',
      },
      {
        id: 3,
        tipo_documento: 'DNI',
        numero_documento: 70112807,
        nombres: 'JUAN',
        apellido_paterno: 'PEREZ',
        apellido_materno: 'MARRUECOS',
        telefono_fijo: 30313021,
        telefono_celular: 956933907,
        email: 'JUAN@HOTMAIL.COM',
        cargo: 'USUARIO',
      },
      {
        id: 4,
        tipo_documento: 'DNI',
        numero_documento: 70552807,
        nombres: 'PEDRO',
        apellido_paterno: 'PORRAS',
        apellido_materno: 'CARRILLO',
        telefono_fijo: 30313021,
        telefono_celular: 956933907,
        email: 'PEDRO@HOTMAIL.COM',
        cargo: 'USUARIO',
      },
    ];
  }
  ngOnInit(): void {}
}
