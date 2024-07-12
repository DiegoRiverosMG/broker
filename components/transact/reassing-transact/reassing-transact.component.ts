import { Component, OnInit, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AccessFilter } from './../../access-filter';
import Swal from 'sweetalert2';
import { ModuleConfig } from './../../module.config';
import { TransactService } from '../../../services/transact/transact.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-reassing-transact',
  templateUrl: './reassing-transact.component.html',
  styleUrls: ['./reassing-transact.component.css']
})
export class ReassingTransactComponent implements OnInit {
  @Input() public reference: any;
  @Input() public itemTransaccionList: any;
  @Input() public cotizacionID: any;
  @Input() public NPOLICY; SBRANCH; SPRODUCT; NQUOTATION; NTRANSACT; STYPETRANSAC; SSTATUS; SMODE; NUSERCODE; SMAILACTUAL; SCONTRATANTE: any;

  title: string = '';
  codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
  userCode = JSON.parse(localStorage.getItem('currentUser'))['id'];
  filter: any = {};

  notfoundMessage = ModuleConfig.NotFoundMessage;
  genericErrorMessage = ModuleConfig.GenericErrorMessage; //Mensaje de error genérico

  isLoading: boolean = false;
  InputsTransact: any = [];

  constructor(
     private modalService: NgbModal,
     private transactService: TransactService,
  ) { }

  ngOnInit(): void {
    this.InputsTransact.P_PRODUCTO = this.SPRODUCT;
    this.InputsTransact.P_POLIZA = this.NPOLICY;
    this.InputsTransact.P_CONTRATANTE = this.SCONTRATANTE;
    this.InputsTransact.SRAMO = this.SBRANCH;
    this.InputsTransact.P_COTIZACION = this.NQUOTATION;
    this.InputsTransact.P_TRAMITE = this.NTRANSACT;
    this.InputsTransact.P_STYPETRANSAC = this.STYPETRANSAC;
    this.InputsTransact.P_SSTATUS = this.SSTATUS;
    this.InputsTransact.P_SMAILACTUAL = this.SMAILACTUAL;
    this.InputsTransact.P_PCOMENTARIO = '';

    if (this.SMODE == 'MAIL')
    {
      this.title = 'Modificar Correo';
    } else if (this.SMODE == 'ASIG')
    {
      this.title = 'Reasignar Trámite';
    }
  }

  reassignSend(){
    let mensaje = '';
    
    if (this.InputsTransact.P_PCORREO == '' || this.InputsTransact.P_PCORREO == undefined) {
      mensaje += 'Debe ingresar un correo electrónico.<br>';
    } else {
      if (/^(([^<>()[\]\.,;:\s@\']+(\.[^<>()[\]\.,;:\s@\']+)*)|(\'.+\'))@(([^<>()[\]\.,;:\s@\']+\.)+[^<>()[\]\.,;:\s@\']{2,})$/i.test(this.InputsTransact.P_PCORREO) == false) {
        mensaje += 'El correo electrónico es inválido.<br>';
      }
    }

    if (this.InputsTransact.P_PCOMENTARIO == '' || this.InputsTransact.P_PCOMENTARIO == undefined) {
      mensaje += 'Debe ingresar un comentario.';
    }

    if (mensaje == '') {

      this.filter.P_NID_TRAMITE = this.InputsTransact.P_TRAMITE;
      this.filter.P_NID_COTIZACION = this.InputsTransact.P_COTIZACION;
      this.filter.P_SMAIL_SEND = this.InputsTransact.P_PCORREO;
      this.filter.P_NUSERCODE = this.userCode;
      this.filter.P_SCOMMENT = this.InputsTransact.P_PCOMENTARIO.length == 0 ? '' : this.InputsTransact.P_PCOMENTARIO.toUpperCase().replace(/[<>%]/g, '');

      Swal.fire({
        title: "Información",
        text: "¿Deseas asignar este correo al trámite?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Aceptar",
        allowOutsideClick: false,
        cancelButtonText: 'Cancelar'
      })
        .then((result) => {
          if (result.value) {
            this.transactService.ReassignMail(this.filter).subscribe(
              res => {
                if (res.P_COD_ERR == 0) {
                  Swal.fire({
                    title: "Información",
                    text: "Se ha registrado correctamente el correo",
                    icon: "success",
                    confirmButtonText: 'OK',
                    allowOutsideClick: false,
                  }).then((result) => {
                    if (result.value) {
                      this.reference.close();
                    }
                  });
                } else {
                  Swal.fire({
                    title: "Información",
                    text: res.P_MESSAGE,
                    icon: "error",
                    confirmButtonText: 'OK',
                    allowOutsideClick: false,
                  })
                }
              },
              err => {
              }
            );
          }
        });
      // this.transactService.ReassignMail(this.filter).subscribe(
      //   res => {
      //     this.foundResults = res.GenericResponse;
      //     if (this.foundResults != null && this.foundResults.length > 0) {
      //     }
      //     else {
      //       Swal.fire('Información', this.notfoundMessage, 'warning');
      //     }
      //     this.isLoading = false;
      //   },
      //   err => {
      //     this.isLoading = false;
      //     Swal.fire('Información', this.genericErrorMessage, 'error');

      //   }
      // );
    }
    else {
      Swal.fire('Información', mensaje, 'error');
    }
  }

  reassignTransact(){
    let mensaje = '';
    
    if (this.InputsTransact.P_PCOMENTARIO == '' || this.InputsTransact.P_PCOMENTARIO == undefined) {
      mensaje += 'Debe ingresar un comentario.';
    }

    if (mensaje == '') {

      let dataQuotation: any = {};
      const data: FormData = new FormData();
      dataQuotation.P_NID_TRAMITE = this.InputsTransact.P_TRAMITE;
      dataQuotation.P_NID_COTIZACION = this.InputsTransact.P_COTIZACION;
      dataQuotation.P_NUSERCODE_ASSIGNOR = JSON.parse(localStorage.getItem('currentUser'))['id'];
      dataQuotation.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
      dataQuotation.P_NSTATUS_TRA = 4;
      dataQuotation.P_SCOMMENT = this.InputsTransact.P_PCOMENTARIO.length == 0 ? '' : this.InputsTransact.P_PCOMENTARIO.toUpperCase().replace(/[<>%]/g, '');

      data.append('objeto', JSON.stringify(dataQuotation));

      Swal.fire({
        title: "Información",
        text: "¿Deseas asignar el trámite?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Aceptar",
        allowOutsideClick: false,
        cancelButtonText: 'Cancelar'
      })
        .then((result) => {
          if (result.value) {
            this.transactService.AsignarTransact(data).subscribe(
              res => {
                if (res.P_COD_ERR == 0) {
                  Swal.fire({
                    title: "Información",
                    text: "Se asignó el trámite correctamente al usuario",
                    icon: "success",
                    confirmButtonText: 'OK',
                    allowOutsideClick: false,
                  }).then((result) => {
                    if (result.value) {
                      this.reference.close();
                    }
                  });
                } else {
                  Swal.fire({
                    title: "Información",
                    text: res.P_MESSAGE,
                    icon: "error",
                    confirmButtonText: 'OK',
                    allowOutsideClick: false,
                  })
                }
              },
              err => {
              }
            );
          }
        });
    }
    else {
      Swal.fire('Información', mensaje, 'error');
    }
  }

}
