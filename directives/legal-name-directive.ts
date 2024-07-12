import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'input[LegalNameDirective]'
})
export class LegalNameDirective {

  regexStr = '^[a-zA-Z0-9-,:()&$#.ÑñÁÉÍÓÚáéíóúÄËÏÖÜäëïöü\' ]*$';

  @HostListener('keypress', ['$event']) onKeyPress(event) {
    return new RegExp(this.regexStr).test(event.key);
  }

}