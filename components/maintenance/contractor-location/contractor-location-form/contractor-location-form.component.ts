import { Component, OnInit, Input, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from "@angular/forms";
import { ContractorLocation } from '../../../../models/maintenance/contractor-location/contractor-location';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2'
//Importación de servicios
import { ClientInformationService } from '../../../../services/shared/client-information.service';
import { ContractorLocationIndexService } from '../../../../services/maintenance/contractor-location/contractor-location-index/contractor-location-index.service';
import { AddressService } from '../../../../services/shared/address.service';
import { OthersService } from '../../../../services/shared/others.service';
import { ContractorLocationREQUEST } from '../../../../models/maintenance/contractor-location/Request/contractor-location-request';
import { ContractorLocationContactREQUEST } from '../../../../models/maintenance/contractor-location/Request/contractor-location-contact-request';
import { ContractorLocationContact } from '../../../../models/maintenance/contractor-location/contractor-location-contact';
import { ContractorLocationContactComponent } from '../contractor-location-contact/contractor-location-contact.component';

@Component({
    selector: 'app-contractor-location-form',
    templateUrl: './contractor-location-form.component.html',
    styleUrls: ['./contractor-location-form.component.css']
})
export class ContractorLocationFormComponent implements OnInit {
    @Input() public openedInEditMode: Boolean;
    @Input() public formModalReference: NgbModalRef; //Referencia al modal creado desde el padre de este componente 'contractor-location-view' para ser cerrado desde aquí
    @Input() public suggestedLocationType: string;
    @Input() public contractorLocationData: any;

    @Input() public existentLocationList = [];
    @Input() public rowToBeIgnored: number;
    @Input() public willBeSaved: boolean;

    public currentUser: number;
    public title: String;
    public mainFormGroup: FormGroup;

    public contractorLocationTypeList: any;
    public departmentList: any;
    public provinceList: any;
    public districtList: any;
    public economicActivityList: any;
    public technicalActivityList: any;
    //VARIABLES DE PAGINACIÓN
    currentPage = 1;
    rotate = true;
    maxSize = 5;
    public itemsPerPage = 3; // cantidad de items por pagina
    public totalItems = 0; //total de items encontrados
    public itemsWereFound: boolean;
    activityMain = ""
    subActivity = ""

    public currentLocation = new ContractorLocationREQUEST();

    constructor(private contractorLocationIndexService: ContractorLocationIndexService, private addressService: AddressService,
        private othersService: OthersService, private modalService: NgbModal, private mainFormBuilder: FormBuilder) { }

    ngOnInit() {
        this.currentUser = JSON.parse(localStorage.getItem("currentUser"))["id"];
        if (this.existentLocationList == null || this.existentLocationList.length == 0) this.rowToBeIgnored = -1;
        if (this.openedInEditMode == false) { //Modo creación
            this.title = "Creación de sede";
            if (this.contractorLocationData != null) this.currentLocation.ContractorId = this.contractorLocationData.ContractorId;
            this.currentLocation.UserCode = this.currentUser;
            this.currentLocation.Action = '1'; //crear sede

            this.currentLocation.DepartmentId = 0;
            this.currentLocation.ProvinceId = 0;
            this.currentLocation.DistrictId = 0;
            this.currentLocation.StateId = '1';

            this.currentLocation.TypeId = this.suggestedLocationType;
            this.currentLocation.ContactList = [];
            this.fillTypeList();
            this.fillTechnicalActivityList();
            this.fillDepartmentList();
        }
        else { //Modo edición
            this.currentLocation.Action = '2'; //crear sede
            this.title = "Modificación de sede";
            if (this.willBeSaved == true) {
                this.currentLocation.Id = this.contractorLocationData.Id;
                this.currentLocation.ContractorId = this.contractorLocationData.ContractorId;
                this.currentLocation.TypeId = this.contractorLocationData.TypeId;
                this.currentLocation.Description = this.contractorLocationData.Description;
                this.currentLocation.DepartmentId = this.contractorLocationData.DepartmentId;
                this.currentLocation.ProvinceId = this.contractorLocationData.ProvinceId;
                this.currentLocation.DistrictId = this.contractorLocationData.DistrictId;
                this.currentLocation.Address = this.contractorLocationData.Address;
                this.currentLocation.StateId = this.contractorLocationData.State;
                this.activityMain = this.contractorLocationData.Activity;
                this.subActivity = this.contractorLocationData.EconomicActivity;
                this.currentLocation.TechnicalActivityId = this.contractorLocationData.TechnicalActivityId;
                this.currentLocation.EconomicActivityId = this.contractorLocationData.EconomicActivityId;
                this.currentLocation.UserCode = this.currentUser;
                this.fillContactList();
            } else {
                this.currentLocation.Id = this.existentLocationList[this.rowToBeIgnored].Id;
                this.currentLocation.ContractorId = this.existentLocationList[this.rowToBeIgnored].ContractorId;
                this.currentLocation.TypeId = this.existentLocationList[this.rowToBeIgnored].TypeId;
                this.currentLocation.Description = this.existentLocationList[this.rowToBeIgnored].Description;
                this.currentLocation.DepartmentId = this.existentLocationList[this.rowToBeIgnored].DepartmentId;
                this.currentLocation.ProvinceId = this.existentLocationList[this.rowToBeIgnored].ProvinceId;
                this.currentLocation.DistrictId = this.existentLocationList[this.rowToBeIgnored].DistrictId;
                this.currentLocation.Address = this.existentLocationList[this.rowToBeIgnored].Address;
                this.currentLocation.StateId = this.existentLocationList[this.rowToBeIgnored].StateId;
                this.currentLocation.TechnicalActivityId = this.existentLocationList[this.rowToBeIgnored].TechnicalActivityId;
                this.currentLocation.EconomicActivityId = this.existentLocationList[this.rowToBeIgnored].EconomicActivityId;
                this.currentLocation.ContactList = this.existentLocationList[this.rowToBeIgnored].ContactList;
                this.currentLocation.UserCode = this.currentUser;
                if (this.currentLocation.ContactList != null && this.currentLocation.ContactList.length > 0) this.itemsWereFound = true;
            }

            this.getTechnicalActivityList().subscribe(
                res => {
                    this.technicalActivityList = res;
                    this.getEconomicActivityList().subscribe(
                        subres => {
                            this.economicActivityList = subres;
                        },
                        suberr => {

                        }
                    )
                },
                err => {
                }
            );
            this.fillTypeList();

            this.fillDepartmentList();
        }
        this.createFormControl();
        this.initializeForm();

    }
    notZeroValueInSelect(control: AbstractControl): { [key: string]: boolean } | null {
        if (control.value == 0) return { 'zeroValueInSelect': true };
        else return null;
    }
    private createFormControl() {
        this.mainFormGroup = this.mainFormBuilder.group({
            icon: [{ value: "", disabled: true }],
            description: ["", [Validators.required, Validators.maxLength(32)]],
            department: [{ value: "", disabled: this.openedInEditMode && this.willBeSaved }, [Validators.required, this.notZeroValueInSelect]],
            province: [{ value: "", disabled: this.openedInEditMode && this.willBeSaved }, [Validators.required, this.notZeroValueInSelect]],
            district: [{ value: "", disabled: this.openedInEditMode && this.willBeSaved }, [Validators.required, this.notZeroValueInSelect]],
            address: [{ value: "", disabled: this.openedInEditMode && this.willBeSaved }, [Validators.required, Validators.maxLength(60)]],
            state: ["", [Validators.required, this.notZeroValueInSelect]],
            economicActivity: [{ value: "", disabled: this.openedInEditMode && this.willBeSaved }, [Validators.required, this.notZeroValueInSelect]],
            technicalActivity: [{ value: "", disabled: this.openedInEditMode && this.willBeSaved }, [Validators.required, this.notZeroValueInSelect]],
            type: [{ value: "", disabled: this.openedInEditMode && this.willBeSaved }, [Validators.required, this.notZeroValueInSelect]]
        });
    }

    initializeForm() {
        if (this.openedInEditMode == true) this.mainFormGroup.controls.type.setValue(this.currentLocation.TypeId);
        else this.mainFormGroup.controls.type.setValue('1');

        this.mainFormGroup.controls.description.setValue(this.currentLocation.Description);
        this.mainFormGroup.controls.department.setValue(this.currentLocation.DepartmentId);
        this.mainFormGroup.controls.province.setValue(this.currentLocation.ProvinceId);
        this.mainFormGroup.controls.district.setValue(this.currentLocation.DistrictId);
        this.mainFormGroup.controls.address.setValue(this.currentLocation.Address);
        this.mainFormGroup.controls.state.setValue(this.currentLocation.StateId);
        this.mainFormGroup.controls.technicalActivity.setValue(this.currentLocation.TechnicalActivityId);
        this.mainFormGroup.controls.economicActivity.setValue(this.currentLocation.EconomicActivityId);

    }
    clearAddressValidators() {
        this.mainFormGroup.controls.address.markAsUntouched();
        this.mainFormGroup.controls.address.updateValueAndValidity();
    }
    clearDescriptionValidators() {
        this.mainFormGroup.controls.description.markAsUntouched();
        this.mainFormGroup.controls.description.updateValueAndValidity();
    }
    clearTypeValidators() {
        this.mainFormGroup.controls.type.markAsUntouched();
        this.mainFormGroup.controls.type.updateValueAndValidity();
    }
    clearDepartmentValidators() {
        this.mainFormGroup.controls.department.markAsUntouched();
        this.mainFormGroup.controls.department.updateValueAndValidity();
    }
    clearProvinceValidators() {
        this.mainFormGroup.controls.province.markAsUntouched();
        this.mainFormGroup.controls.province.updateValueAndValidity();
    }
    clearDistrictValidators() {
        this.mainFormGroup.controls.district.markAsUntouched();
        this.mainFormGroup.controls.district.updateValueAndValidity();
    }
    clearStateValidators() {
        this.mainFormGroup.controls.state.markAsUntouched();
        this.mainFormGroup.controls.state.updateValueAndValidity();
    }
    clearEconomicActivityValidators() {
        this.mainFormGroup.controls.economicActivity.markAsUntouched();
        this.mainFormGroup.controls.economicActivity.updateValueAndValidity();
    }

    getTypeList() {
        return this.contractorLocationIndexService.getContractorLocationTypeList();
    }
    fillTypeList() {
        this.getTypeList().subscribe(
            res => {
                this.contractorLocationTypeList = res;
            },
            err => {
            }
        );
    }

    getTechnicalActivityList() {
        return this.othersService.getTechnicalActivityList();
    }
    getEconomicActivityList() {
        if (this.openedInEditMode) return this.othersService.getEconomicActivityList(this.currentLocation.TechnicalActivityId);
        else return this.othersService.getEconomicActivityList(this.mainFormGroup.controls.technicalActivity.value);

    }
    fillEconomicActivityList(event) {
        this.currentLocation.EconomicActivityId = null;
        if(this.currentLocation.TechnicalActivityId != null){
            if (event != null) {
                this.activityMain = event.Name;
            }
            this.getEconomicActivityList().subscribe(
                res => {
                    this.economicActivityList = res;
                },
                err => {
                }
            );

        }else{
            this.activityMain = ""
            this.subActivity = "";
            this.economicActivityList = [];
        }
        
        
    }
    getSubActivity(event){
        if(this.currentLocation.EconomicActivityId != null){
            if (event != null) {
                this.subActivity = event.Name;
            }
        }else{
            this.subActivity = "";
        }
        
    }
    fillTechnicalActivityList() {
        this.getTechnicalActivityList().subscribe(
            res => {
                this.technicalActivityList = res;

            },
            err => {
            }
        );
    }
    getDepartmentList() {
        return this.addressService.getDepartmentList();
    }
    fillDepartmentList() {
        this.getDepartmentList().subscribe(
            res => {
                this.departmentList = res;
                if (this.openedInEditMode == true) {
                    this.addressService.getProvinceList(this.currentLocation.DepartmentId).subscribe(
                        res => {
                            this.provinceList = res;
                            this.addressService.getDistrictList(this.currentLocation.ProvinceId).subscribe(
                                res => {
                                    this.districtList = res;
                                },
                                err => {
                                }
                            );
                        },
                        err => {
                        }
                    );
                }
            },
            err => {
            }
        );
    }
    getProvinceList() {
        this.provinceList = [];
        this.mainFormGroup.controls.province.patchValue("0");
        this.mainFormGroup.controls.province.updateValueAndValidity();
        this.districtList = [];
        this.mainFormGroup.controls.district.patchValue("0");
        this.mainFormGroup.controls.district.updateValueAndValidity();
        return this.addressService.getProvinceList(this.currentLocation.DepartmentId).subscribe(
            res => {
                this.provinceList = res;
            },
            err => {
            }
        );
    }
    getDistrictList() {
        this.districtList = [];
        this.mainFormGroup.controls.district.patchValue("0");
        this.mainFormGroup.controls.district.updateValueAndValidity();
        return this.addressService.getDistrictList(this.currentLocation.ProvinceId).subscribe(
            res => {
                this.districtList = res;
            },
            err => {
            }
        );
    }

    getContactList() {
        return this.contractorLocationIndexService.getContractorLocationContactList(this.currentLocation.Id, this.itemsPerPage, 1);
    }
    fillContactList() {
        this.getContactList().subscribe(
            res => {
                this.totalItems = +res.P_NTOTALROWS;
                if (this.totalItems > 0) {
                    this.itemsWereFound = true;
                    this.currentLocation.ContactList = res.GENERICLIST;
                }
            },
            err => {
            }
        );
    }
    firstSearch() {
        this.currentPage = 1;
        this.searchContacts();
    }
    pageChanged(page: number) {
        this.currentPage = page;
        this.searchContacts();
    }
    searchContacts() {
        this.itemsWereFound = false;

        this.contractorLocationIndexService.getContractorLocationContactList(this.currentLocation.Id, this.itemsPerPage, this.currentPage).subscribe(
            res => {
                this.totalItems = +res.P_NTOTALROWS;
                if (this.totalItems > 0) {
                    this.itemsWereFound = true;
                    this.currentLocation.ContactList = res.GENERICLIST;
                }
            },
            err => {
            }

        );
    }

    updateContact(_contact: ContractorLocationContactREQUEST) {

        this.contractorLocationIndexService.updateContractorLocationContact(_contact).subscribe(
            res => {
                if (res.P_NCODE == 0) {
                } else if (res.P_NCODE == 1) {
                }
            },
            err => {
            }
        );
    }
    updateContractorLocation(_contractorLocation: ContractorLocationREQUEST) {
        if (this.mainFormGroup.valid) {

            if (this.openedInEditMode == true && this.currentLocation.TypeId == '1') { //Consultar si ya se tiene una sede principal activa
                if (this.willBeSaved == true) {
                    this.contractorLocationIndexService.hasActivePrincipalLocation(this.currentLocation.ContractorId, this.currentLocation.Id, this.currentUser).subscribe(
                        res => {
                            if (res.P_NCODE == 1) {
                                Swal.fire('Información', this.listToString(this.stringToList(res.P_SMESSAGE)), 'error');
                            } else if (res.P_NCODE == 2) {
                                Swal.fire('Información', 'Este contratante ya cuenta con una sede principal activa.', 'error');
                            }
                            else if (res.P_NCODE == 3) {
                                this.contractorLocationIndexService.updateContractorLocation(_contractorLocation).subscribe(
                                    subres => {
                                        if (subres.P_NCODE == 0) {
                                            Swal.fire("Información", subres.P_SMESSAGE, "success");
                                            this.formModalReference.close(true);
                                        } else if (subres.P_NCODE == 1) {
                                            Swal.fire('Información', this.listToString(this.stringToList(subres.P_SMESSAGE)), 'error');
                                        }else if (subres.P_NCODE == 2) {
                                            Swal.fire('Información', this.listToString(this.stringToList(subres.P_SMESSAGE)), 'error');
                                        }
                                    },
                                    err => {
                                        Swal.fire('Información', err, 'error');
                                    }
                                );
                            }

                        },
                        err => {
                            Swal.fire('Información', err, 'error');
                        }
                    );
                } else {
                    let existent = 0;
                    let self = this;
                    this.existentLocationList.map(function (existentLocation) {
                        if (existentLocation.P_NROW - 1 != self.rowToBeIgnored) {
                            if (existentLocation.Description == self.currentLocation.Description.trim() && existentLocation.EconomicActivityId == self.currentLocation.EconomicActivityId && existentLocation.Address == self.currentLocation.Address.trim()
                                && existentLocation.DistrictId == self.currentLocation.DistrictId) existent = 1;
                        }

                    });

                    if (existent == 0) {
                        let sede = {
                            TypeId: this.currentLocation.TypeId,
                            Description: this.currentLocation.Description.trim(),
                            EconomicActivityId: this.currentLocation.EconomicActivityId,
                            TechnicalActivityId: this.currentLocation.TechnicalActivityId,
                            StateId: this.currentLocation.StateId,
                            Address: this.currentLocation.Address.trim(),
                            DepartmentId: this.currentLocation.DepartmentId,
                            ProvinceId: this.currentLocation.ProvinceId,
                            DistrictId: this.currentLocation.DistrictId,
                            ContactList: this.currentLocation.ContactList,
                            UserCode: this.currentUser
                        };
                        this.formModalReference.close(sede);
                    } else {
                        Swal.fire('Información', 'Ya hay una sede con estos datos', 'error');
                    }
                }

            } else { //Crear nueva Sede
                if (this.willBeSaved == false) { // devolvemos la sede y sus clientes
                    let existent = 0;
                    let self = this;
                    this.existentLocationList.map(function (existentLocation) {
                        if (existentLocation.P_NROW - 1 != self.rowToBeIgnored) {
                            if (existentLocation.Description == self.currentLocation.Description.trim() && existentLocation.EconomicActivityId == self.currentLocation.EconomicActivityId && existentLocation.Address == self.currentLocation.Address.trim()
                                && existentLocation.DistrictId == self.currentLocation.DistrictId) existent = 1;
                        }

                    });

                    if (existent == 0) {
                        let sede = {
                            TypeId: this.currentLocation.TypeId,
                            Description: this.currentLocation.Description.trim(),
                            EconomicActivityId: this.currentLocation.EconomicActivityId,
                            TechnicalActivityId: this.currentLocation.TechnicalActivityId,
                            StateId: this.currentLocation.StateId,
                            Address: this.currentLocation.Address.trim(),
                            DepartmentId: this.currentLocation.DepartmentId,
                            ProvinceId: this.currentLocation.ProvinceId,
                            DistrictId: this.currentLocation.DistrictId,
                            ContactList: this.currentLocation.ContactList,
                            UserCode: this.currentUser
                        };
                        this.formModalReference.close(sede);
                    } else {
                        Swal.fire('Información', 'Ya hay una sede con estos datos', 'error');
                    }

                } else {
                    this.contractorLocationIndexService.updateContractorLocation(_contractorLocation).subscribe(
                        res => {
                            if (res.P_NCODE == 0) {
                                //llamamos al método para actualizar Contacto de sede
                                if (this.currentLocation.Action == '1') {
                                    this.currentLocation.Id = res.P_RESULT;

                                }
                                let self = this;
                                if (this.openedInEditMode == false) {
                                    this.currentLocation.ContactList.forEach(function (item) {
                                        let _contact = new ContractorLocationContactREQUEST();
                                        _contact.Action = '1';
                                        _contact.FullName = item.FullName;
                                        _contact.PhoneNumber = item.PhoneNumber;
                                        _contact.Email = item.Email;
                                        _contact.ContractorLocationId = self.currentLocation.Id;
                                        _contact.State = item.State;
                                        _contact.UserCode = self.currentUser;
                                        self.updateContact(_contact);
                                    });
                                }

                                Swal.fire('Información', res.P_SMESSAGE, 'success');
                                this.formModalReference.close(true);

                            } else if (res.P_NCODE == 1) {
                                Swal.fire('Información', this.listToString(this.stringToList(res.P_SMESSAGE)), 'error');
                            }
                            else if (res.P_NCODE == 2) {
                                Swal.fire('Información', this.listToString(this.stringToList(res.P_SMESSAGE)), 'error');
                            }
                        },
                        err => {
                            Swal.fire('Información', err, 'error');
                        }
                    );
                }

            }

        } else {
            let errorList = [];
            if (this.mainFormGroup.controls.type.hasError('required') || this.mainFormGroup.controls.type.value == '0') errorList.push("El tipo de sede es requerido.");
            if (this.mainFormGroup.controls.description.valid == false) {
                if (this.mainFormGroup.controls.description.hasError('required')) errorList.push("La descripción es requerida.");
                else errorList.push("La descripción no es válida.");
            }
            if (this.mainFormGroup.controls.department.hasError('required') || this.mainFormGroup.controls.department.value == 0) errorList.push("El departamento es requerido.");
            if (this.mainFormGroup.controls.province.hasError('required') || this.mainFormGroup.controls.province.value == 0) errorList.push("La provincia es requerida.");
            if (this.mainFormGroup.controls.district.hasError('required') || this.mainFormGroup.controls.district.value == 0) errorList.push("El distrito es requerido.");
            if (this.mainFormGroup.controls.state.hasError('required') || this.mainFormGroup.controls.state.value == '0') errorList.push("El estado es requerido.");
            if (this.mainFormGroup.controls.address.valid == false) {
                if (this.mainFormGroup.controls.address.hasError('required')) errorList.push("La dirección es requerida.");
                else errorList.push("La dirección no es válida.");
            }
            if (this.mainFormGroup.controls.economicActivity.hasError('required') || this.mainFormGroup.controls.economicActivity.value == '') errorList.push("La actividad económica es requerida");
            if (this.mainFormGroup.controls.technicalActivity.hasError('required') || this.mainFormGroup.controls.technicalActivity.value == '') errorList.push("La actividad a realizar es requerida");

            this.mainFormGroup.controls.type.markAsTouched();
            this.mainFormGroup.controls.type.updateValueAndValidity();
            this.mainFormGroup.controls.state.markAsTouched();
            this.mainFormGroup.controls.state.updateValueAndValidity();
            this.mainFormGroup.controls.economicActivity.markAsTouched();
            this.mainFormGroup.controls.economicActivity.updateValueAndValidity();
            this.mainFormGroup.controls.department.markAsTouched();
            this.mainFormGroup.controls.department.updateValueAndValidity();
            this.mainFormGroup.controls.province.markAsTouched();
            this.mainFormGroup.controls.province.updateValueAndValidity();
            this.mainFormGroup.controls.district.markAsTouched();
            this.mainFormGroup.controls.district.updateValueAndValidity();
            this.mainFormGroup.controls.description.markAsTouched();
            this.mainFormGroup.controls.description.updateValueAndValidity();
            this.mainFormGroup.controls.address.markAsTouched();
            this.mainFormGroup.controls.address.updateValueAndValidity();

            Swal.fire('Información', this.listToString(errorList), 'error');
        }


    }
    //SEPARAR MENSAJE DE ERROR DE SP
    splitErrorMessage(acumulatedMessage: string): string[] {
        let isFirst: Boolean = true;
        let response: string[] = [];
        while (acumulatedMessage.search("-") != -1) {
            if (isFirst == true) {
                isFirst = false;
                acumulatedMessage = acumulatedMessage.substring(acumulatedMessage.search("-") + 1);
            } else {
                response.push(acumulatedMessage.substring(0, acumulatedMessage.search("-")));
                acumulatedMessage = acumulatedMessage.substring(acumulatedMessage.search("-") + 1);
            }
        }
        response.push(acumulatedMessage);
        return response;
    }

    getContact(openModalInEditMode: boolean, contactId: string) {

        if (openModalInEditMode == true) {
            this.contractorLocationIndexService.getContact(contactId).subscribe(
                res => {
                    res.LocationId = this.currentLocation.Id;
                    this.openContactModal(openModalInEditMode, res);
                },
                err => {
                }
            );
        } else {
            let _contact = new ContractorLocationContact();
            _contact.LocationId = this.currentLocation.Id;
            this.openContactModal(openModalInEditMode, _contact);
        }

    }
    openContactModal(openModalInEditMode: boolean, contactData: ContractorLocationContact) {
        const modalRef = this.modalService.open(ContractorLocationContactComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.formModalReference = modalRef;
        modalRef.componentInstance.receivedContactData = contactData;
        modalRef.componentInstance.openedInEditMode = openModalInEditMode;
        modalRef.componentInstance.existentContactList = this.currentLocation.ContactList;

        modalRef.result.then((newContactForTable) => {
            if (this.openedInEditMode == true && this.willBeSaved == true) {
                this.firstSearch();
            } else if (newContactForTable != null) {
                this.itemsWereFound = true;
                if (this.currentLocation.ContactList == null) this.currentLocation.ContactList = [];
                this.currentLocation.ContactList.push(newContactForTable);
            }
        }, (reason) => {
        });

    }
    editContactInView(ind: number) {
        const modalRef = this.modalService.open(ContractorLocationContactComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.formModalReference = modalRef;
        modalRef.componentInstance.receivedContactData = this.currentLocation.ContactList[ind];
        modalRef.componentInstance.openedInEditMode = true;
        modalRef.componentInstance.existentContactList = this.currentLocation.ContactList;
        modalRef.componentInstance.rowToBeIgnored = ind;

        modalRef.result.then((newContactForTable) => {
            this.currentLocation.ContactList[ind] = newContactForTable;
        }, (reason) => {
        });
    }
    confirmDeletion(ind: number) {
        Swal.fire({
            title: 'Eliminar',
            text: '¿Estás seguro de eliminar este contacto?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                if (this.openedInEditMode == true && this.willBeSaved == true) this.deleteContact(ind);
                else this.deleteContactOnlyInView(ind);
            } else if (result.dismiss === Swal.DismissReason.cancel) {
            }
        })
    }
    deleteContactOnlyInView(ind: number) {
        if (ind !== -1) {
            this.currentLocation.ContactList.splice(ind, 1);
        }
    }
    deleteContact(contactId: number) {
        this.contractorLocationIndexService.deleteContact(contactId, this.currentUser).subscribe(
            res => {
                this.firstSearch();
                Swal.fire('Información', 'Contacto eliminado exitosamente.', 'success');
            },
            err => {
            }
        );

    }
    listToString(inputList: String[]): string {
        let output = "";
        inputList.forEach(function (item) {
            output = output + item + " <br>"
        });
        return output;
    }
    stringToList(inputString: string): string[] {

        let responseList: string[] = [];
        if (inputString != null && inputString.trim().length > 0) {
            while (inputString.search("-") != -1) {
                let slicedText = inputString.substring(0, inputString.search("-"));
                if (slicedText.trim() != "") responseList.push(slicedText);

                inputString = inputString.substring(inputString.search("-") + 1);
            }
            if (inputString.trim() != "") responseList.push(inputString);
        }

        return responseList;
    }
}
