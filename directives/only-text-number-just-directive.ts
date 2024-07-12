import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector:  'input[OnlyTextNumberJustDirective]'
})
export class OnlyTextNumberJustDirective {

    regexStr = '^[a-zA-Z0-9]*$';
    @Input() isAlphaNumeric: boolean;

    @HostListener('keypress', ['$event']) onKeyPress(event) {
        return new RegExp(this.regexStr).test(event.key);
    }

}