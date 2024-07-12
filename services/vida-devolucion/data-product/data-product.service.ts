import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DataProductService {
  constructor() { }

  listaFamiliares() {
    const listaF = new Array();
    for (let i = 1; i <= 2; i++) {
      listaF.push({
        dni: i % 2 ? '70625814' : '70625000',
        name: i % 2 ? 'PEPITO PEREZ' : 'SARA PEREZ',
        parentesco: i % 2 ? 'PADRE' : 'MADRE',
      });
    }
    return of(listaF).pipe();
  }
  listaMasivaMock(req: any) {
    const listaM = new Array();
    for (let i = 1; i <= 10; i++) {
      listaM.push({
        number: i,
        tipo: 'xlsx',
        file: 'ARCHIVO ' + i,
        fechayhora: '7/06/2022 16:13:50',
        estado: this.setEstado(i),
      });
    }
    /* return of(listaM).pipe(); */
    return of(listaM).pipe(
      map(response => response.filter((x: any) => +req.number ? +x.estado == +req.number : true))
    );
  }
  private setEstado(index) {
    if (index % 3) {
      return {
        id: 2,
        description: 'RECHAZADO',
      };
    }
    return {
      id: 1,
      description: 'CARGADO',
    };
  }
  listaAdjuntos() {
    const listaA = new Array();
    for (let i = 1; i <= 2; i++) {
      listaA.push({
        nombre: i % 2 ? '70625814' : '70625000',
        tipo: i % 2 ? 'PEPITO PEREZ' : 'SARA PEREZ',
        parentesco: i % 2 ? 'PADRE' : 'MADRE',
      });
    }
    return of(listaA).pipe();
  }
}
