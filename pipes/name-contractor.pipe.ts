import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nameContractor'
})
export class NameContractorPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    let name: string = value["P_SFIRSTNAME"] != null ? value["P_SFIRSTNAME"] + " " : "";
    let lastname: string = value["P_SLASTNAME"] != null ? value["P_SLASTNAME"] + " " : "";
    let lastname2: string = value["P_SLASTNAME2"] != null ? value["P_SLASTNAME2"] : "";
    let legalname: string = value["P_SLEGALNAME"] != null ? value["P_SLEGALNAME"] : "";
    let nameComplete: string = "";

    if (value["P_NIDDOC_TYPE"] == "1") {
      nameComplete = legalname;
    } else {
      nameComplete = name + lastname + lastname2;
    }



    return nameComplete;
  }

}
