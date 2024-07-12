import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbModalRef, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ContractorLocationFormComponent } from '../contractor-location-form/contractor-location-form.component';
import { Contractor } from '../../../../models/maintenance/contractor-location/contractor';
import { ContractorLocation } from '../../../../models/maintenance/contractor-location/contractor-location';
import Swal from 'sweetalert2';
//Importación de servicios
import { ClientInformationService } from '../../../../services/shared/client-information.service';
import { ContractorLocationIndexService } from '../../../../services/maintenance/contractor-location/contractor-location-index/contractor-location-index.service';
import { ContractorForTable } from '../../../../models/maintenance/contractor-location/contractor-for-table';
import { CommonMethods } from './../../../common-methods';


@Component({
    selector: 'app-contractor-view',
    templateUrl: './contractor-view.component.html',
    styleUrls: ['./contractor-view.component.css']
})
export class ContractorViewComponent implements OnInit {

    @Input() public reference: any; //Referencia al modal creado desde el padre de este componente 'contractor-location-index' para ser cerrado desde aquí
    @Input() public contractor: ContractorForTable;

    isLoading: boolean = false;
    hasChanges: boolean = false; //Flag que indica si hubo un cambio en las sedes, para que contractor-location-index recargue la lista

    public currentUser = JSON.parse(localStorage.getItem("currentUser"))["id"];

    //VARIABLES DE PAGINACIÓN
    currentPage = 1;
    rotate = true;
    maxSize = 5;
    public itemsPerPage = 3; // cantidad de items por pagina
    public totalItems = 0; //total de items encontrados
    @Input() public contractorLocationList: any = [];
    public locationsWereFound: boolean;
    listToShow: any;

    constructor(private modalService: NgbModal, private contractorLocationIndexService: ContractorLocationIndexService) { }

    ngOnInit() {
        if (this.contractor.Email == null || this.contractor.Email.toString().trim() == "") this.contractor.Email = "Email no registrado";
        if (this.contractor.Address == null || this.contractor.Address.toString().trim() == "") this.contractor.Address = "Dirección no registrada";
        if (this.contractor.Phone == null || this.contractor.Phone.toString().trim() == "") this.contractor.Phone = "Teléfono no registrado";
        this.getContractorLocationList(this.contractor.Id);
    }
    openLocationModal(contractorLocation: any, openModalInEditMode: boolean, suggestedLocationType: string) {
        const modalRef = this.modalService.open(ContractorLocationFormComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.formModalReference = modalRef;
        modalRef.componentInstance.contractorLocationData = contractorLocation;
        modalRef.componentInstance.openedInEditMode = openModalInEditMode;
        modalRef.componentInstance.suggestedLocationType = suggestedLocationType;
        modalRef.componentInstance.willBeSaved = true;
        modalRef.componentInstance.existentLocationList = [];

        modalRef.result.then((shouldToUpdateLocationTable) => {
            if (shouldToUpdateLocationTable == true) { // debemos actualizar tabla de SEDES?
                this.getContractorLocationList(this.contractor.Id);
                this.hasChanges = true;
            }
        }, (reason) => {
        });

    }
    getContractorLocation(contractorLocationId: string, openModalInEditMode: boolean) {

        if (openModalInEditMode == true) {
            this.contractorLocationIndexService.getContractorLocation(contractorLocationId).subscribe(
                res => {
                    this.openLocationModal(res, true, null);
                },
                err => {
                }

            );
        } else {
            this.contractorLocationIndexService.getSuggestedLocationType(this.contractor.Id, this.currentUser).subscribe(
                res => {
                    if (res.P_NCODE == 1) {
                        Swal.fire('Información', this.listToString(this.stringToList(res.P_SMESSAGE)), 'error');
                    } else {
                        let _location = new ContractorLocation(); //solo para enviar el ID de contratante
                        _location.ContractorId = this.contractor.Id; //solo para enviar el ID de contratante
                        if (res.P_NCODE == 2) this.openLocationModal(_location, false, '2'); //crear sucursal
                        else if (res.P_NCODE == 3) this.openLocationModal(_location, false, '1'); //crear principal

                    }

                },
                err => {
                    Swal.fire('Información', err, 'error');
                }
            );

        }

    }
    getContractorLocationList(contractorId: string) {
        this.currentPage = 1;
        this.locationsWereFound = false;
        this.contractorLocationList = [];
        this.contractorLocationIndexService.getContractorLocationList(contractorId, this.itemsPerPage, 1).subscribe(
            res => {
                this.locationsWereFound = true;
                this.contractorLocationList = res.GENERICLIST;
                this.totalItems = this.contractorLocationList.length;
                this.listToShow = this.contractorLocationList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
            },
            err => {
            }

        );
    }
    pageChanged(page: number) {
        this.currentPage = page;
        this.listToShow = this.contractorLocationList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
    }

    mostrarMas() {
        this.currentPage = 1;
        this.listToShow = this.contractorLocationList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
    }
    
    searchLocations() {
        this.locationsWereFound = false;

        this.contractorLocationIndexService.getContractorLocationList(this.contractor.Id, this.itemsPerPage, this.currentPage).subscribe(
            res => {
                this.totalItems = +res.P_NTOTALROWS;
                if (this.totalItems > 0) {
                    this.locationsWereFound = true;
                    this.contractorLocationList = res.GENERICLIST;
                }
            },
            err => {
            }

        );
    }
    deleteLocation(locationId: number) {
        this.contractorLocationIndexService.deleteLocation(locationId, this.currentUser).subscribe(
            res => {
                if (res.P_NCODE == 0) {
                    Swal.fire('Información', 'Sede eliminada exitosamente.', 'success');
                    this.getContractorLocationList(this.contractor.Id);
                    this.hasChanges = true;
                } else if (res.P_NCODE == 1) {
                    Swal.fire('Información', this.listToString(this.stringToList(res.P_SMESSAGE)), 'error');
                }
            },
            err => {
            }
        );
    }

    confirmDeletion(locationId: number) {
        Swal.fire({
            title: 'Eliminar',
            text: '¿Estás seguro de eliminar permanentemente esta sede?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                this.deleteLocation(locationId);
            } else if (result.dismiss === Swal.DismissReason.cancel) {
            }
        });
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
        if (isFirst == true) { //cuando solo hay un mensaje sin guiones
            responseList.push(inputString.trim());
        }
        return responseList;
    }
}
