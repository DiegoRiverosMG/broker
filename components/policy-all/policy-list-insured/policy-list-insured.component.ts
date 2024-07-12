import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PolicyChangeUserComponent } from '../policy-change-user/policy-change-user.component';
import { PolicyemitService } from '@root/layout/broker/services/policy/policyemit.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-policy-list-insured',
    templateUrl: './policy-list-insured.component.html',
    styleUrls: ['./policy-list-insured.component.css']
})
export class PolicyListInsuredComponent implements OnInit {

    @Input() public listInsured: any;
    @Input() public reference: any;
    @Input() public request: any;
    @ViewChild('fechaNacimiento') desde: any;
    bsConfig: Partial<BsDatepickerConfig>;

    currentPage = 1; // página actual
    rotate = true; //
    maxSize = 10; // cantidad de paginas que se mostrarán en el paginado
    itemsPerPage = 20; // limite de items por página
    totalItems = 0; // total de items encontrados
    listToShow: any[];

    name = '';
    doc = '';
    bsFecNacimiento: Date;


    constructor(private modalService: NgbModal, private policyErmitService: PolicyemitService, private datePipe: DatePipe) {
        this.bsConfig = Object.assign(
            {},
            {
                dateInputFormat: 'DD/MM/YYYY',
                locale: 'es',
                showWeekNumbers: false
            }
        );
    }

    ngOnInit(): void {
        this.listToShow = this.listInsured;
        this.totalItems = this.listInsured.length;
        this.listToShow = this.listInsured.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
    }

    pageChanged(currentPage) {
        this.currentPage = currentPage;
        this.listToShow = this.listInsured.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
        );
    }

    changeUser(item: any) {
        //item.npolicy = this.request.npolicy
        //console.log(item);
        let modalRef: NgbModalRef;
        modalRef = this.modalService.open(PolicyChangeUserComponent, { size: 'lg', windowClass: 'modalCustom', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.reference = modalRef;
        modalRef.componentInstance.user = item;
        modalRef.componentInstance.request = this.request;
        modalRef.result.then(async (res) => {
            if (res != undefined) {
                this.policyErmitService.getInsuredForTransactionPolicy(this.request).subscribe(
                    res => {
                        this.currentPage = 1;
                        this.rotate = true;
                        this.maxSize = 10;
                        this.itemsPerPage = 20;
                        this.totalItems = 0;
                        this.listInsured = res.inrureds;
                        this.listToShow = this.listInsured;
                        this.totalItems = this.listInsured.length;
                        this.listToShow = this.listInsured.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
                    }
                )
            }
        });
    }

    borrarContenido(event: KeyboardEvent) {
        if (event.key === 'Delete' || event.key === 'Backspace') {
            this.bsFecNacimiento = null;
        }
    }

    filter() {
        this.currentPage = 1;
        this.rotate = true;
        this.maxSize = 10;
        this.itemsPerPage = 20;
        this.totalItems = 0;

        if (this.name != '' || this.doc != '' || this.bsFecNacimiento != undefined) {
            let filter: any[] = [];

            if (this.name != '') filter = this.listInsured.filter(x => x.nombres.toUpperCase().includes(this.name.toUpperCase()))

            if (this.doc != '') {
                if (filter.length > 0) {
                    filter = filter.filter(x => x.nroDocumento.toUpperCase().includes(this.doc.toUpperCase()));
                } else {
                    filter = this.listInsured.filter(x => x.nroDocumento.toUpperCase().includes(this.doc.toUpperCase()));
                }
            }

            console.log(this.bsFecNacimiento);

            if (this.bsFecNacimiento != undefined || this.bsFecNacimiento != null) {
                if (isNaN(this.bsFecNacimiento.getTime())) {
                    this.bsFecNacimiento = null;
                    Swal.fire('Información', 'La fecha es inválida', 'warning');
                } else {
                    let date = this.datePipe.transform(this.bsFecNacimiento, 'dd/MM/yyyy');
                    if (filter.length > 0) {
                        filter = filter.filter(x => x.fechaNacimiento == date);
                    } else {
                        filter = this.listInsured.filter(x => x.fechaNacimiento == date);
                    }
                }
            }


            // filter = this.listInsured.filter(x => {
            //   if(this.name != ''){
            //     return x.nombres.toUpperCase().includes(this.name.toUpperCase())
            //   }
            //   if(this.doc != ''){
            //     return x.nroDocumento.toUpperCase().includes(this.doc.toUpperCase())
            //   }
            //   // if(this.bsFecNacimiento != undefined && this.bsFecNacimiento != null){
            //   //   debugger;
            //     if (isNaN(this.bsFecNacimiento.getTime())) {
            //       this.bsFecNacimiento = null;
            //       this.name = '';
            //       this.doc = '';
            //       Swal.fire('Información','La fecha es inválida','warning');
            //     }else{
            //       let date = this.datePipe.transform(this.bsFecNacimiento, 'dd/MM/yyyy');
            //       return x.fechaNacimiento == date;
            //     }

            //   //}
            // });
            this.listToShow = filter;
            this.totalItems = filter.length;
            this.listToShow = filter.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
        } else {
            this.listToShow = this.listInsured;
            this.totalItems = this.listInsured.length;
            this.listToShow = this.listInsured.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
        }

    }

}
