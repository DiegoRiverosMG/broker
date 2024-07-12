import { Injectable } from '@angular/core';
import moment from 'moment';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApprovalsPendingService {
  constructor() {}

  fecha: Date = new Date();

  listado(request: any) {
    const lista = new Array();
    for (let i = 1; i <= 250; i++) {
      lista.push({
        number_caso: 1010 + i,
        name_cliente: 'ALEJANDRINA CHIROQUE',
        type_document: i % 5 ? 'DNI' : 'CE',
        dni_ce: i % 3 ? '70645877' : '976556465451',
        date_create: i % 2 ? '07/03/2022' : '10/10/2015',
        prima: 'S/' + (4900 + i),
        motivo_rechazo: i % 2 ? 'F.PEP' : 'PRIMA EXP',
        state_cotizacion: i % 2 ? 'CLIENTE OBSERVADO' : 'PENDIENTE REVISIÓN',
      });
    }
    return of(lista).pipe(
      map((response) =>
        response.filter((x: any) =>
          +request.document_number
            ? +x.dni_ce == +request.document_number
            : true
        )
      )
    );
  }
}
