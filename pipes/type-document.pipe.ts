import { Pipe, PipeTransform } from '@angular/core';
import { toInt } from 'ngx-bootstrap/chronos/utils/type-checks';

@Pipe({
  name: 'typeDocument'
})
export class TypeDocumentPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    let tdocument = "";
    switch (parseInt(value)) {
      case 0:
        tdocument = "SIN CÓDICO";
        break;
      case 1:
        tdocument = "RUC";
        break;
      case 2:
        tdocument = "DNI";
        break;
      case 4:
        tdocument = "CARNET DE EXTRANJERÍA";
        break;
      case 5:
        tdocument = "CARNET FFAA/FFPP";
        break;
      case 6:
        tdocument = "PASAPORTE";
        break;
      case 9:
        tdocument = "CÓDIGO INTERNO";
        break;
      case 10:
        tdocument = "PARTIDA DE NACIMIENTO";
        break;
      case 11:
        tdocument = "IDENT. EMPRESAS EXTRANJERAS";
        break;
      case 12:
        tdocument = "CARNET UNIVERSITARIO";
        break;
      case 13:
        tdocument = "CSS";
        break;

    }
    return tdocument;
  }

}
