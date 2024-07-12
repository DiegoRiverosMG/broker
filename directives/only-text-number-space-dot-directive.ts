import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector:  'input[OnlyTextNumberSpaceDotDirective]'
})
export class OnlyTextNumberSpaceDotDirective {

    regexStr = '^[a-zA-Z0-9 .]*$';
    @Input() isAlphaNumeric: boolean;

    @HostListener('keypress', ['$event']) onKeyPress(event) {
        return new RegExp(this.regexStr).test(event.key);
    }

}