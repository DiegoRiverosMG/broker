import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { DatePipe, DecimalPipe } from '@angular/common';
import { CommissionService } from '@root/layout/broker/services/maintenance/commision/commission.service';
import { DesgravamentConstants } from '@root/layout/desgravamen/shared/core/desgravament.constants';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';

import swal from 'sweetalert2';
import { ConfigCommissionComponentRecord } from '../config-commission-record/config-commission-record.component';

@Component({
  selector: 'app-config-commission',
  templateUrl: './config-commission.component.html',
  styleUrls: ['./config-commission.component.css']
})
export class ConfigCommissionComponent implements OnInit {

  public bsConfig: Partial<BsDatepickerConfig>;
  CONSTANTS: any = DesgravamentConstants;

  show_comercial: boolean = false;
  show_tecnica: boolean = false;

  isLoading: boolean = true;
  is_disable_input: boolean = true;
  is_disable_button_e: boolean = false;
  is_disable_button_s: boolean = true;
  is_disable_button_a: boolean = false;



  item: any = {
    NHIS_CONFIGURATION: 0,
    NINI_MONTH: "",
    NCANTMONTHS: "",
    DINIDATE: "",
    DESC_USER_REGISTER: "",
    DEFFECDATE: "",
    DESC_USER_ACTION: "",
    DEFFECDATE_ACTION: "",
    NSTATE: "",
    DESC_STATE: ""
  };


  constructor(
    public datePipe: DatePipe,
    public decimalPipe: DecimalPipe,
    private commissionService: CommissionService,
    private modalService: NgbModal,
    private router: Router,


  ) {
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: "DD/MM/YYYY",
        locale: "es",
        showWeekNumbers: false
      }
    );

  }

  ngOnInit() {

    let usr = JSON.parse(localStorage.getItem('currentUser'))['id']

    this.commissionService.valPerfilVDP(usr).subscribe((res) => {
      this.show_comercial = res.IS_COMERCIAL;
      this.show_tecnica = res.IS_TECNICA;
    })

    this.GetLastCommission()
  }

  SaveCommission() {
    this.isLoading = true;

    let format_date = this.item.DEFFECDATE;
    if (typeof this.item.DEFFECDATE == 'object') {
      format_date = this.item.DEFFECDATE.toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }
    else { }

    const send_data = {
      ...this.item,
      DEFFECDATE: format_date,
      NIDUSER_REGISTER: JSON.parse(localStorage.getItem('currentUser'))['id']
    }

    // Se va realizar un nuevo registro
    if (this.item.NHIS_CONFIGURATION == 0) {

      this.commissionService.InsCommissionVDP(send_data).subscribe(
        data => {
          this.isLoading = false;
          if (data.code == 1) {
            swal.fire('Información', data.message, 'info');
          }
          else {
            swal.fire('Información', data.message, 'success');
            this.GetLastCommission2();
            
          }
        },
        error => {
          this.isLoading = false;
          swal.fire('Información', "Hubo un problema", 'error');

        }
      )
    }

    // Se va actualizar algun registro 
    else {

      
      let format_date = this.item.DEFFECDATE;
      if (typeof this.item.DEFFECDATE == 'object') {
        format_date = this.item.DEFFECDATE.toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
      }
      else {}

      const send_data = {
        ...this.item,
        NIDUSER_REGISTER: JSON.parse(localStorage.getItem('currentUser'))['id'],
        NTYPE_USU: 1,
        DEFFECDATE: format_date,
        NSTATE_ACTION: this.item.NSTATE,
      }

      if (this.item.NSTATE == 2) {
        this.isLoading = false;
        swal.fire('Información', 'No puede editar esta configuración', 'info');
      }
      else {
        this.commissionService.UpdCommissionVDP(send_data).subscribe(
          data => {
            this.isLoading = false;

            if (data.code == 1) {
              swal.fire('Información', data.message, 'info');
            }
            else {
              swal.fire('Información', data.message, 'success');
              this.GetLastCommission2();
            }
          },
          error => {
            this.isLoading = false;
            swal.fire('Información', "Hubo un problema", 'error');

          }
        )
      }
    }

  }

  ChangeStateRequest(NSTATE: number) {

    let format_date = this.item.DEFFECDATE;
    if (typeof this.item.DEFFECDATE == 'object') {
      format_date = this.item.DEFFECDATE.toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }
    else {
      console.log("Tipo String");
    }

    const send_data = {
      ...this.item,
      NIDUSER_REGISTER: JSON.parse(localStorage.getItem('currentUser'))['id'],
      NTYPE_USU: 1,
      NSTATE: this.item.NSTATE,
      NSTATE_ACTION: NSTATE,
      DEFFECDATE: format_date
    }

    this.commissionService.UpdCommissionVDP(send_data).subscribe(
      data => {
        this.isLoading = false;

        if (data.code == 1) {
          swal.fire('Información', data.message, 'info');
        }
        else {
          swal.fire('Información', data.message, 'success');
          this.GetLastCommission2();
        }
      },
      error => {
        this.isLoading = false;
        swal.fire('Información', "Hubo un problema", 'error');
      }
    )

  }

  GetLastCommission() {
    this.isLoading = true;
    this.commissionService.getLastCommission().subscribe(
      data => {
        let format_to_date = new Date(data[0].DEFFECDATE)
        this.item = data[0];
        this.item.DEFFECDATE = format_to_date;

        this.isLoading = false;

        if (this.item.NHIS_CONFIGURATION > 0 && this.item.NSTATE == 0) {
          this.is_disable_button_e = false;
          this.is_disable_button_a = true;
        } else if (this.item.NSTATE == 1 || this.item.NSTATE == 2) {
          this.is_disable_button_a = false;
        }

        // Si se puede editar la configuracion
        if (this.item.CONFIG_EDITABLE == 1) {
          this.is_disable_button_e = false;

        }

        // NO se puede editar la configuracion
        else {
          this.is_disable_button_e = true;
        }

      },
      error => {
        this.isLoading = false;

      }
    )
  }


  GetLastCommission2() {

    this.commissionService.getLastCommission().subscribe(
      data => {
        let format_to_date = new Date(data[0].DEFFECDATE)
        this.item = data[0];
        this.item.DEFFECDATE = format_to_date;
        this.is_disable_button_s = true;
        this.is_disable_input = true;
        if (this.item.NHIS_CONFIGURATION > 0 && this.item.NSTATE == 0) {
          this.is_disable_button_e = false;
          this.is_disable_button_a = true;
        } else if (this.item.NSTATE == 1 || this.item.NSTATE == 2) {
          this.is_disable_button_a = false;
        }

        // Si se puede editar la configuracion
        if (this.item.CONFIG_EDITABLE == 1) {
          this.is_disable_button_e = false;
        }
        // NO se puede editar la configuracion
        else {
          this.is_disable_button_e = true;
        }

      },
      error => {

      }
    )
  }

  ActivateInput() {

    this.is_disable_input = false;
    this.item = {
      NHIS_CONFIGURATION: 0,
      NINI_MONTH: "",
      NCANTMONTHS: "",
      DINIDATE: "",
      DESC_USER_REGISTER: "",
      DEFFECDATE: new Date(),
      DESC_USER_ACTION: "",
      DEFFECDATE_ACTION: "",
      NSTATE: 1,
      DESC_STATE: "PENDIENTE"
    };
    this.is_disable_button_e = true;
    this.is_disable_button_s = false;

  }


  EditInput() {
    this.is_disable_input = false;
    this.is_disable_button_s = false;
  }


  OpenModal() {

    let modalRef: NgbModalRef;
    modalRef = this.modalService.open(ConfigCommissionComponentRecord, {
      size: 'xl',
      backdropClass: 'light-blue-backdrop',
      backdrop: 'static',
      keyboard: false,
    });
    modalRef.componentInstance.reference = modalRef;

  }

}
