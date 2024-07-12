import { Pipe, PipeTransform } from '@angular/core';
import { first } from 'rxjs/operators';
import { CommonMethods } from './../components/common-methods';

@Pipe({
  name: 'prettyNumberApVg'
})
export class PrettyNumberPipeApVg implements PipeTransform {

  transform(value: any, decimalQuantity?: number): any {
    if (isNaN(decimalQuantity)) decimalQuantity = 2;

    if (value != null && value.toString().trim() != "") {
      //value = CommonMethods.formatValor(value, decimalQuantity) //AVS - RENTAS encargado de redondear los numeros
      value = value.toString().trim();
      let response = "";

      if (value.indexOf(".") == -1) value = value + "." + this.createTail(0, decimalQuantity);
      else if (value.substring(value.indexOf(".")).length - 1 < decimalQuantity) value = value + this.createTail(value.substring(value.indexOf(".")).length - 1, decimalQuantity);

      response = value.substring(value.indexOf("."));
      value = value.substring(0, value.indexOf("."));

      if (value.length == 0) return "0" + response;

      for (let i = 0; i < value.length; i++) {
        if ((i) % 3 == 0 && i != 0) {
          response = value.charAt(value.length - 1 - i) + "," + response;
        } else response = value.charAt(value.length - 1 - i) + response;
      }
      return response;
    } else return "0." + this.createTail(0, decimalQuantity);
  }

  createTail(currentTailLength: number, requiredTailLength: number): string {
    let tail = "";
    for (let i = 0; i < requiredTailLength - currentTailLength; i++) {
      tail = tail + "0";
    }
    return tail;
  }

}
