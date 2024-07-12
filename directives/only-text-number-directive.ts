import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector:  'input[OnlyTextNumberDirective]'
})
export class OnlyTextNumberDirective {

    regexStr = '^[a-zA-Z0-9_]*$';
    @Input() isAlphaNumeric: boolean;

    @HostListener('keypress', ['$event']) onKeyPress(event) {
        return new RegExp(this.regexStr).test(event.key);
    }

}