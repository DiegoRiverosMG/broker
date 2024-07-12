import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileName'
})
export class FileNamePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return value.substring(value.lastIndexOf("\\") + 1);
  }

}
