import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'input[OnlyTextSpaceJustDirective]'
})
export class OnlyTextSpaceJustDirective {

  regexStr = '^[a-zA-Z ]*$';
    @Input() isAlphaNumeric: boolean;

    @HostListener('keypress', ['$event']) onKeyPress(event) {
        return new RegExp(this.regexStr).test(event.key);
    }

}