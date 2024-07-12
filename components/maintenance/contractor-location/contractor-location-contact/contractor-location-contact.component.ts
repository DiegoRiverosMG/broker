import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from "@angular/forms";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
//Importación de servicios
import { ContractorLocationIndexService } from '../../../../services/maintenance/contractor-location/contractor-location-index/contractor-location-index.service';
import { ContractorLocationContactREQUEST } from '../../../../models/maintenance/contractor-location/Request/contractor-location-contact-request';

import { ContractorLocationContact } from '../../../../models/maintenance/contractor-location/contractor-location-contact';
//Directivas personalizadas

@Component({
  selector: 'app-contractor-location-contact',
  templateUrl: './contractor-location-contact.component.html',
  styleUrls: ['./contractor-location-contact.component.css']
})
export class ContractorLocationContactComponent implements OnInit {
  @Input() public openedInEditMode: Boolean;
  @Input() public formModalReference: NgbModalRef; //Referencia al modal creado desde el padre de este componente 'contractor-location-view' para ser cerrado desde aquí
  @Input() public alertModalReference: NgbModalRef; //Referencia al modal de alerta de operaciones
  @Input() public receivedContactData: ContractorLocationContact;

  @Input() public existentContactList = [];
  @Input() public rowToBeIgnored: number;
  public currentUser: number;
  public mainFormGroup: FormGroup;

  public currentContact = new ContractorLocationContactREQUEST();
  public title: string;
  public errorList: string[] = [];
  public successList: string[] = [];
  constructor(private mainFormBuilder: FormBuilder, private contractorLocationIndexService: ContractorLocationIndexService) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem("currentUser"))["id"];
    if (this.openedInEditMode == false) {
      this.title = "Creación de contacto";
      this.currentContact.ContractorLocationId = this.receivedContactData.LocationId;
      this.currentContact.UserCode = this.currentUser;
      this.currentContact.Action = '1';
      this.currentContact.State = '1';
    }
    else {
      this.currentContact.Action = '2'; //crear contacto

      this.title = "Modificación de contacto";
      this.currentContact.Id = this.receivedContactData.Id;
      this.currentContact.ContractorLocationId = this.receivedContactData.LocationId;
      this.currentContact.FullName = this.receivedContactData.FullName;
      this.currentContact.PhoneNumber = this.receivedContactData.PhoneNumber;
      this.currentContact.Email = this.receivedContactData.Email;
      this.currentContact.State = '1';
      this.currentContact.UserCode = this.currentUser;

    }
    this.createForm();
    this.initializeForm();
  }

  createForm() {
    this.mainFormGroup = this.mainFormBuilder.group({
      fullName: ["", [Validators.required, Validators.maxLength(60)]],
      phoneNumber: ["", [Validators.required, Validators.maxLength(11), Validators.minLength(6), this.notThreeOrOneZerosAtTheBeginning, this.notAllCharactersAreEqual, this.notlikethis123456789]],
      email: ["", [Validators.required, Validators.maxLength(60), Validators.email]],
      state: ["", Validators.required]
    });
  }
  initializeForm() {
    this.mainFormGroup.controls.fullName.setValue(this.currentContact.FullName);
    this.mainFormGroup.controls.phoneNumber.setValue(this.currentContact.PhoneNumber);
    this.mainFormGroup.controls.email.setValue(this.currentContact.Email);
    this.mainFormGroup.controls.state.setValue(this.currentContact.State);
  }
  updateContact() {
    this.contractorLocationIndexService.updateContractorLocationContact(this.currentContact).subscribe(
      res => {
        if (res.P_NCODE == 0) {
          this.successList.push(res.P_SMESSAGE);
          this.formModalReference.close();

        } else if (res.P_NCODE == 1) {
          Swal.fire('Información', this.listToString(this.stringToList(res.P_SMESSAGE)), 'error');
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  /**
   * VALIDACIONES
   */
  notThreeOrOneZerosAtTheBeginning(control: AbstractControl): { [key: string]: boolean } | null {
    if (control.value != null) {
      if (control.value.substring(0, 3) == "000") return { 'three zeros at the beginning': true };
      else if (control.value.substring(0, 1) == "0") return { 'one zero at the beginning': true };
      return null;
    } else {
      return null;
    }

  }
  notlikethis123456789(control: AbstractControl): { [key: string]: boolean } | null {
    if (control.value != null && control.value.length == 9) {
      if (control.value == "123456789") return { 'not allowed number': true };
      return null;
    } else {
      return null;
    }

  }

  notAllCharactersAreEqual(control: AbstractControl): { [key: string]: boolean } | null {
    if (control.value != null && control.value.length > 5) {
      for (var i = 0; i < control.value.length; i++) {
        if (i > 0) {
          if (control.value.charAt(i) != control.value.charAt(i - 1)) return null;
        }
      }
      return { 'allCharactersAreEqual': true };
    } else {
      return null;
    }

  }
  clearFullNameControlValidators() {
    this.mainFormGroup.controls.fullName.markAsUntouched();
    this.mainFormGroup.controls.fullName.updateValueAndValidity();
  }
  clearPhoneNumberControlValidators() {
    this.mainFormGroup.controls.phoneNumber.markAsUntouched();
    this.mainFormGroup.controls.phoneNumber.updateValueAndValidity();
  }
  clearEmailControlValidators() {
    this.mainFormGroup.controls.email.markAsUntouched();
    this.mainFormGroup.controls.email.updateValueAndValidity();
  }
  manageContact() {
    this.errorList = [];
    this.successList = [];
    this.currentContact.FullName = this.currentContact.FullName.replace(/[0-9]+/g, '')
    if (this.mainFormGroup.valid) {
      if (/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(this.mainFormGroup.controls.email.value) == false) {
        Swal.fire('Información', 'El correo electrónico no es válido', 'error')
        return
      }
      let existent = 0;
      if (this.existentContactList != null && this.existentContactList.length > 0) {
        let self = this;
        for (let i = 0; i < this.existentContactList.length; i++) {
          if (i != self.rowToBeIgnored) {
            if (self.existentContactList[i].FullName == self.currentContact.FullName.trim() && self.existentContactList[i].PhoneNumber == self.currentContact.PhoneNumber.trim() && self.existentContactList[i].Email == self.currentContact.Email.trim()) {
              existent = 1;
            }
          }
        }
      }

      if (existent != 1) {
        if (this.currentContact.ContractorLocationId == null) {
          this.formModalReference.close(this.currentContact);
        } else {
          this.updateContact();
        }
      } else {
        Swal.fire('Información', "El contacto ya existe", 'error');
        return
      }
    } else {
      if (this.mainFormGroup.controls.fullName.valid == false) {
        if (this.mainFormGroup.controls.fullName.hasError('required')) this.errorList.push("El nombre es requerido.");
        else this.errorList.push("El nombre no es válido.");
      }
      if (this.mainFormGroup.controls.email.valid == false) {
        if (this.mainFormGroup.controls.email.hasError('required')) this.errorList.push("El correo electrónico es requerido.");
        else this.errorList.push("El correo electrónico no es válido.");
      }
      if (this.mainFormGroup.controls.phoneNumber.valid == false) {
        if (this.mainFormGroup.controls.phoneNumber.hasError('required')) this.errorList.push("El teléfono es requerido.");
        else this.errorList.push("El teléfono no es válido.");
      }

      this.mainFormGroup.controls.fullName.markAsTouched();
      this.mainFormGroup.controls.fullName.updateValueAndValidity();

      this.mainFormGroup.controls.email.markAsTouched();
      this.mainFormGroup.controls.email.updateValueAndValidity();

      this.mainFormGroup.controls.phoneNumber.markAsTouched();
      this.mainFormGroup.controls.phoneNumber.updateValueAndValidity();

      Swal.fire('Información', this.listToString(this.errorList), 'error');
    }

  }

  listToString(inputList: String[]): string {
    let output = "";
    inputList.forEach(function (item) {
      output = output + item + " <br>"
    });
    return output;
  }
  stringToList(inputString: string): string[] {
    let isFirst: Boolean = true;
    let responseList: string[] = [];
    while (inputString.search("-") != -1) {
      if (isFirst == true) {
        isFirst = false;
        inputString = inputString.substring(inputString.search("-") + 1);
      } else {
        responseList.push(inputString.substring(0, inputString.search("-")));
        inputString = inputString.substring(inputString.search("-") + 1);
      }
    }
    return responseList;
  }

}
