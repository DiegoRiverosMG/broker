import { AbstractControl, FormGroup } from '@angular/forms';

export class GlobalValidators {
    private static dniPattern = "(^(?!.*([1][2][3][4][5][6][7][8])).*)(^[0-9]{8,8}$)";
    private static cePattern = "^[a-zA-Z0-9]*$";
    // private static legalNamePattern = "^[a-zA-Z\-\,\:\(\)\&\$\#\. ]*$";
    private static legalNamePattern = "^[a-zA-Z0-9\-\,\:\(\)\&\$\#\.ÑñÁÉÍÓÚáéíóúÄËÏÖÜäëïöü\' ]*$";
    // private static latinTextPattern = "^[a-zA-Z\u00C0-\u024F\' ]*$";
    private static latinTextPattern = "^[A-Za-zÑñÁÉÍÓÚáéíóúÄËÏÖÜäëïöü\' ]*$";

    static getLatinTextPattern(): string | RegExp {
        return this.latinTextPattern;
    }
    static getLegalNamePattern(): string {
        return this.legalNamePattern;
    }
    static getCePattern(): string {
        return this.cePattern;
    }
    static getDniPattern(): string {
        return this.dniPattern;
    }

    /**
   * Validar que todos los caracteres no sean iguales
   * @param control valor de control de formulario
   */
    static notAllCharactersAreEqualValidator(control: AbstractControl): { [key: string]: boolean } | null {
        if (control.value != null && control.value.length == 8) {
            let areAllEqual: boolean = true;
            for (var i = 0; i < control.value.length; i++) {
                if (i > 0) {
                    if (control.value.charAt(i) != control.value.charAt(i - 1)) areAllEqual = false;
                }
            }
            if (areAllEqual == true) return { 'AllCharactersAreEqual': true };
            else return null; //validation was passed
        } else {
            return null;
        }
    }

    /**
     * Validar que todos los caracteres sean solo números
     * @param control valor de control de formulario
     */
    static onlyNumberValidator(control: AbstractControl): { [key: string]: boolean } | null {
        if (control.value != null && control.value.toString().trim() != "") {
            if (/^[0-9]+$/.test(control.value)) return null;
            else return { 'IsNotNumber': true };
        } else {
            return null;
        }
    }

    /**
     * Validar que todos los caracteres sean solo números o caracteres de alfabeto
     * @param control valor de control de formulario
     */
    static onlyNumberAndTextValidator(control: AbstractControl): { [key: string]: boolean } | null {
        if (control.value != null && control.value.toString().trim() != "") {
            if (/^[0-96a-zA-Z]+$/.test(control.value)) return null;
            else return { 'IsNotNumberOrText': true };
        } else {
            return null;
        }
    }

    /**
     * Validar que todos los caracteres sean caracteres de alfabeto y espacios
     * @param control valor de control de formulario
     */
    static onlyTextAndSpaceValidator(control: AbstractControl): { [key: string]: boolean } | null {
        if (control.value != null && control.value.toString().trim() != "") {
            if (/^[A-Za-z ]+$/.test(control.value)) return null;
            else return { 'IsNotTextOrSpace': true };
        } else {
            return null;
        }
    }

    /**
     * Validar que el número de RUC solo pueda empezar con "10", "15", "17" y "20", en caso contrario será considerado no válido
     * @param control valor de control de formulario
     */
    static rucNumberValidator(control: AbstractControl): { [key: string]: boolean } | null {
        if (control.value != null && control.value.toString().trim() != "") {
            if (control.value.toString().trim().substring(0, 2) == "10" || control.value.toString().trim().substring(0, 2) == "15"
                || control.value.toString().trim().substring(0, 2) == "17" || control.value.toString().trim().substring(0, 2) == "20") {
                return null;
            } else return { 'notValidRUC': true };
        } else {
            return null;
        }
    }

    static rucNumberValidator20(control: AbstractControl): { [key: string]: boolean } | null {
        if (control.value != null && control.value.toString().trim() != "") {
            if (control.value.toString().trim().substring(0, 2) == "20") {
                return null;
            } else return { 'notValidRUC': true };
        } else {
            return null;
        }
    }

    /**
     * Validar que no haya más de 3 vocales juntas
     * @param control valor de control de formulario
     */
    static vowelLimitValidation(control: AbstractControl): { [key: string]: boolean } | null {
        if (control.value != null && control.value.toString().trim() != "") {
            let vowelCount = 0;
            for (let i = 0; i < control.value.toString().trim().length; i++) {
                // if (/[aeiouAEIOU]/.test(control.value.toString().trim().charAt(i))) vowelCount++;
                // else vowelCount = 0;
                if (/[AEIOUaeiouÁÉÍÓÚáéíóúÄËÏÖÜäëïöü]/.test(control.value.toString().trim().charAt(i))) vowelCount++;
                else if (/[\']/.test(control.value.toString().trim().charAt(i)) == false) vowelCount = 0;

                if (vowelCount > 3) return { 'moreThanThreeVowels': true };
            }
            return null;
        } else {
            return null;
        }
    }

    /**
     * Validar que no haya 5 consonantes juntas
     * @param control valor de control de formulario
     */
    static consonantLimitValidation(control: AbstractControl): { [key: string]: boolean } | null {
        if (control.value != null && control.value.toString().trim() != "") {
            let consonantCount = 0;
            for (let i = 0; i < control.value.toString().trim().length; i++) {
                if (/[qwrtypsdfghjklñzxcvbnmñ]/.test(control.value.toString().trim().toLowerCase().charAt(i))) consonantCount++;
                else consonantCount = 0;

                if (consonantCount > 6) return { 'moreThanFiveConsonants': true };
            }
            return null;
        } else {
            return null;
        }
    }
    /**
     * Valida un email
     * @param control valor de control de formulario
     */
    // static emailValidation(control: AbstractControl): { [key: string]: boolean } | null {
    // 	if (control.value != null && control.value.toString().trim() != "") {
    // 		let email = control.value.toString().trim();
    // 		if (email.indexOf("@") == -1) return { 'invalidEmail': true }
    // 		else {
    // 			for (var i = 0; i < email.length; i++) {
    // 				if (i > 0 && email.charAt(i) == email.charAt(i - 1) && email.charAt(i) == ".") return { 'invalidEmail': true }
    // 			}

    // 			let localPart = email.substring(0, email.indexOf("@") + 1);
    // 			if (localPart.toString().length > 64) return { 'invalidEmail': true }
    // 			if (/[A-Za-z]/.test(email.charAt(0)) == false) return { 'invalidEmail': true }
    // 			else {
    // 				if (/^[A-Za-z0-9\_\-\.]+$/.test(localPart) == false) return { 'invalidEmail': true }
    // 			}

    // 			let domain = email.substring(email.indexOf("@") + 1);
    // 			if (domain.charAt(0) == "." || domain.charAt(email.length) == ".") return { 'invalidEmail': true }
    // 		}
    // 	} else {
    // 		return null;
    // 	}
    // }

    /**
     * Validar que la fecha de inicio "startDate" no sea posterior a la fecha de fin "endDate"
     * @param group formulario
     */
    static dateSort(group: FormGroup): any {
        if (group) {
            if (group.get("startDate").value > group.get("endDate").value) {
                return { datesNotSortedCorrectly: true };
            } else {
                return null;
            }
        }

        return null;
    }

    /**
     * Validar que la fecha de inicio "DFECINI" no sea posterior a la fecha de fin "DFECFIN"
     * @param group formulario
     */
    static dateSortN(group: FormGroup): any {
        if (group) {
            if (group.get("DFECINI").value > group.get("DFECFIN").value) {
                return { datesNotSortedCorrectly: true };
            } else {
                return null;
            }
        }

        return null;
    }

    /**
     * Validar que la fecha de inicio "DPROCESS_INI" no sea posterior a la fecha de fin "DPROCESS_FIN"
     * @param group formulario
     */
    static dateSortM(group: FormGroup): any {
        if (group) {
            if (group.get("DPROCESS_INI").value > group.get("DPROCESS_FIN").value) {
                return { datesNotSortedCorrectly: true };
            } else {
                return null;
            }
        }

        return null;
    }

    /**
     * Validar que la fecha de inicio "P_FECHAINI" no sea posterior a la fecha de fin "P_FECHAFIN"
     * @param group formulario
     */
    static dateSortR(group: FormGroup): any {
        if (group) {
            if (group.get("P_FECHAINI").value > group.get("P_FECHAFIN").value) {
                return { datesNotSortedCorrectly: true };
            } else {
                return null;
            }
        }

        return null;
    }

    /**
     * Validar que la fecha de inicio "P_DSTARTDATE" no sea posterior a la fecha de fin "P_DEXPIRDAT"
     * @param group formulario
     */
    static dateSortT(group: FormGroup): any {
        if (group) {
            if (group.get("P_DSTARTDATE").value > group.get("P_DEXPIRDAT").value) {
                return { datesNotSortedCorrectly: true };
            } else {
                return null;
            }
        }

        return null;
    }

    /**
     * Validar que la fecha de inicio "dfechaini" no sea posterior a la fecha de fin "dfechafin"
     * @param group formulario
     */
    static dateSortA(group: FormGroup): any {
        if (group) {
            if (group.get("dfechaini").value > group.get("dfechafin").value) {
                return { datesNotSortedCorrectly: true };
            } else {
                return null;
            }
        }

        return null;
    }

    /**
     * Validar que la fecha de inicio "fechaInicio" no sea posterior a la fecha de fin "fechaFin"
     * @param group formulario
     */
    static dateSortE(group: FormGroup): any {
        if (group) {
            if (group.get("fechaInicio").value > group.get("fechaFin").value) {
                return { datesNotSortedCorrectly: true };
            } else {
                return null;
            }
        }

        return null;
    }

    /**
     * Validar que la fecha de inicio "P_DFECINI" no sea posterior a la fecha de fin "P_DFECFIN"
     * @param group formulario
     */
    static dateSortI(group: FormGroup): any {
        if (group) {
            if (group.get("P_DFECINI").value > group.get("P_DFECFIN").value) {
                return { datesNotSortedCorrectly: true };
            } else {
                return null;
            }
        }

        return null;
    }

    /**
     * Validar que la fecha no sea menor a 01/01/1900
     * @param control valor de control de formulario
     */
    static tooOldDateValidator(control: AbstractControl): { [key: string]: boolean } | null {
        if (control.value != null && control.value.toString().trim() != "") {
            if (control.value <= new Date("01/01/1900")) return { 'tooOldDate': true };
            return null;
        } else {
            return null;
        }
    }

    /**
     * Validar la fecha para un componente personalizado
     * @param control valor de control de formulario
     */
    static notValidDate(control: AbstractControl): { [key: string]: boolean } | null {
        if (control.value != null && control.value.toString().trim() != "") {
            if (control.value.toString().trim() == "Invalid Date") return { 'InvalidDate': true };
            else return null; //validation was passed
        } else {
            return null;
        }
    }

    /**
     * Validar que la interfaz "NCODGRU" no sea igual a la predecesora "NCODGRUDEP"
     * @param group valor de control de formulario
     */
    static equalsValues(group: FormGroup): any {
        if (group) {
            if (group.get("NCODGRU").value == group.get("NCODGRUDEP").value) {
                return { equalsValues: true };
            } else {
                return null;
            }
        }
        return null;
    }
}
