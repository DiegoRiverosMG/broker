import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(items: any, filter: any, defaultFilter: boolean): any {

    if (!filter) {
      return items;
    }

    if (!Array.isArray(items)) {
      return items;
    }

    if ((filter.NNUMDOC != undefined && filter.NNUMDOC != "") || (filter.P_SIDDOC != undefined && filter.P_SIDDOC != "")) {
      if (filter && Array.isArray(filter.list)) {
        let filterKeys = Object.keys(filter);
        if (defaultFilter) {
          return filter.list.filter(item =>
            filterKeys.reduce((x, keyName) =>
              (x && new RegExp(filter[keyName], 'gi').test(item[keyName])) || filter[keyName] == "", true));
        }
        else {
          return filter.list.filter(item => {
            return filterKeys.some((keyName) => {
              return new RegExp(filter[keyName], 'gi').test(item[keyName]) || filter[keyName] == "";
            });
          });
        }
      }
    } else {
      return items;
    }
  }
}