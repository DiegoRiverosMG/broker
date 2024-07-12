import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector:  'input[OnlyTextNumberSpaceDirective]'
})
export class OnlyTextNumberSpaceDirective {

    regexStr = '^[a-zA-Z0-9 ]*$';
    @Input() isAlphaNumeric: boolean;

    @HostListener('keypress', ['$event']) onKeyPress(event) {
        return new RegExp(this.regexStr).test(event.key);
    }

}