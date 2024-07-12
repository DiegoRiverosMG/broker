import { Directive, } from '@angular/core';
import { Validator, ValidatorFn, AbstractControl, NG_VALIDATORS, ValidationErrors } from '@angular/forms';

export class SpaceValidator {
  static cannotBeEmpty(control: AbstractControl): ValidationErrors | null {
    if ((control.value || '').trim().length === 0) {
      return {
        cannotContainSpace: true
      };
    }

    return null;
  }
}

export function NoWhitespaceValidator(): ValidatorFn {

  return (control: AbstractControl): { [key: string]: any } => {

    // messy but you get the idea
    let isWhitespace = (control.value || '').trim().length === 0;
    let isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': 'value is only whitespace' };

  };
}

export function NoWhitespaceAddressValidator(): ValidatorFn {

  return (control: AbstractControl): { [key: string]: any } => {

    // messy but you get the idea
    let isWhitespace = (control.value || '').trim().length === 0 || (control.value || '').trim() === 'S/N';
    let isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': 'value is only whitespace' };

  };
}

@Directive({
  selector: '[appWhiteSpaceValidate]',
  providers: [{ provide: NG_VALIDATORS, useExisting: NoWhitespaceDirective, multi: true }]
})
export class NoWhitespaceDirective implements Validator {

  private valFn = NoWhitespaceValidator();
  validate(control: AbstractControl): { [key: string]: any } {
    return this.valFn(control);
  }
}

@Directive({
  selector: '[appWhiteSpaceAddressValidate]',
  providers: [{ provide: NG_VALIDATORS, useExisting: NoWhitespaceAddressDirective, multi: true }]
})
export class NoWhitespaceAddressDirective implements Validator {

  private valFn = NoWhitespaceAddressValidator();
  validate(control: AbstractControl): { [key: string]: any } {
    return this.valFn(control);
  }
}
