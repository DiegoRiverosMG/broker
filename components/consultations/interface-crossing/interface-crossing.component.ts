import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { InterfaceCrossingService } from '../../../services/interfacescrossing/interface-crossing.service';
import Swal from 'sweetalert2';
import swal from 'sweetalert2';

@Component({
  selector: 'app-interface-crossing',
  templateUrl: './interface-crossing.component.html',
  styleUrls: ['./interface-crossing.component.css'],
})
export class InterfaceCrossingComponent implements OnInit {
  //Grilla
  listToShow: any = [];
  processCommList: any = [];
  processAdvList: any = [];
  processCollList: any = [];
  processPremList: any = [];

  //Fechas
  bsConfig: Partial<BsDatepickerConfig>;
  bsValueIni: Date = new Date();
  bsValueFin: Date = new Date();
  bsValueFinMax: Date = new Date();

  DownloadType: any = [];
  SearchByCommissionsActivated = false;
  SearchByAdvisoryActivated = false;
  SearchByCollectionsActivated = false;
  SearchByPremiumsActivated = false;
  NameMessage: any = '';

  //Pantalla de carga
  isLoading: boolean = false;

  constructor(
    private modalService: NgbModal,
    private InterfaceCrossingService: InterfaceCrossingService
  ) {
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        showWeekNumbers: false,
      }
    );
  }

  ngOnInit() {
    this.bsValueIni = new Date(
      this.bsValueIni.getFullYear(),
      this.bsValueIni.getMonth(),
      1
    );
    this.SearchByCommissionsActivated === false;
    this.SearchByAdvisoryActivated === false;
    this.SearchByCollectionsActivated === false;
    this.SearchByPremiumsActivated === false;
  }

  //Checkbox para habilitar y deshabilitar busqueda por comisiones
  setControlsForCommission(event) {
    if (event.target.checked) {
      this.SearchByCommissionsActivated = true;
    } else {
      this.SearchByCommissionsActivated = false;
    }
    if (this.SearchByCommissionsActivated == true) {
      this.SearchByCommissionsActivated = true;
    } else {
      this.SearchByCommissionsActivated = false;
    }
  }

  //Checkbox para habilitar y deshabilitar busqueda por Asesorías
  setControlsForAdvisory(event) {
    if (event.target.checked) {
      this.SearchByAdvisoryActivated = true;
    } else {
      this.SearchByAdvisoryActivated = false;
    }
    if (this.SearchByAdvisoryActivated == true) {
      this.SearchByAdvisoryActivated = true;
    } else {
      this.SearchByAdvisoryActivated = false;
    }
  }

  //Checkbox para habilitar y deshabilitar busqueda por comisiones
  setControlsForCollection(event) {
    if (event.target.checked) {
      this.SearchByCollectionsActivated = true;
    } else {
      this.SearchByCollectionsActivated = false;
    }
    if (this.SearchByCollectionsActivated == true) {
      this.SearchByCollectionsActivated = true;
    } else {
      this.SearchByCollectionsActivated = false;
    }
  }

  //Checkbox para habilitar y deshabilitar busqueda por comisiones
  setControlsForPremiums(event) {
    if (event.target.checked) {
      this.SearchByPremiumsActivated = true;
    } else {
      this.SearchByPremiumsActivated = false;
    }
    if (this.SearchByPremiumsActivated == true) {
      this.SearchByPremiumsActivated = true;
    } else {
      this.SearchByPremiumsActivated = false;
    }
  }

  GetProcess() {
    if (
      (new Date(this.bsValueIni) > new Date(this.bsValueFin) &&
        this.SearchByCommissionsActivated == true &&
        this.SearchByAdvisoryActivated == false &&
        this.SearchByCollectionsActivated == false &&
        this.SearchByPremiumsActivated == false) ||
      (new Date(this.bsValueIni) > new Date(this.bsValueFin) &&
        this.SearchByCommissionsActivated == false &&
        this.SearchByAdvisoryActivated == true &&
        this.SearchByCollectionsActivated == false &&
        this.SearchByPremiumsActivated == false) ||
      (new Date(this.bsValueIni) > new Date(this.bsValueFin) &&
        this.SearchByCommissionsActivated == false &&
        this.SearchByAdvisoryActivated == false &&
        this.SearchByCollectionsActivated == true &&
        this.SearchByPremiumsActivated == false) ||
      (new Date(this.bsValueIni) > new Date(this.bsValueFin) &&
        this.SearchByCommissionsActivated == false &&
        this.SearchByAdvisoryActivated == false &&
        this.SearchByCollectionsActivated == false &&
        this.SearchByPremiumsActivated == true) ||
      (new Date(this.bsValueIni) > new Date(this.bsValueFin) &&
        this.SearchByCommissionsActivated == true &&
        this.SearchByAdvisoryActivated == true &&
        this.SearchByCollectionsActivated == false &&
        this.SearchByPremiumsActivated == false) ||
      (new Date(this.bsValueIni) > new Date(this.bsValueFin) &&
        this.SearchByCommissionsActivated == true &&
        this.SearchByAdvisoryActivated == false &&
        this.SearchByCollectionsActivated == true &&
        this.SearchByPremiumsActivated == false) ||
      (new Date(this.bsValueIni) > new Date(this.bsValueFin) &&
        this.SearchByCommissionsActivated == true &&
        this.SearchByAdvisoryActivated == false &&
        this.SearchByCollectionsActivated == false &&
        this.SearchByPremiumsActivated == true) ||
      (new Date(this.bsValueIni) > new Date(this.bsValueFin) &&
        this.SearchByCommissionsActivated == true &&
        this.SearchByAdvisoryActivated == true &&
        this.SearchByCollectionsActivated == true &&
        this.SearchByPremiumsActivated == false) ||
      (new Date(this.bsValueIni) > new Date(this.bsValueFin) &&
        this.SearchByCommissionsActivated == true &&
        this.SearchByAdvisoryActivated == true &&
        this.SearchByCollectionsActivated == false &&
        this.SearchByPremiumsActivated == true) ||
      (new Date(this.bsValueIni) > new Date(this.bsValueFin) &&
        this.SearchByCommissionsActivated == true &&
        this.SearchByAdvisoryActivated == true &&
        this.SearchByCollectionsActivated == true &&
        this.SearchByPremiumsActivated == true) ||
      (new Date(this.bsValueIni) > new Date(this.bsValueFin) &&
        this.SearchByCommissionsActivated == false &&
        this.SearchByAdvisoryActivated == true &&
        this.SearchByCollectionsActivated == true &&
        this.SearchByPremiumsActivated == false) ||
      (new Date(this.bsValueIni) > new Date(this.bsValueFin) &&
        this.SearchByCommissionsActivated == false &&
        this.SearchByAdvisoryActivated == true &&
        this.SearchByCollectionsActivated == false &&
        this.SearchByPremiumsActivated == true) ||
      (new Date(this.bsValueIni) > new Date(this.bsValueFin) &&
        this.SearchByCommissionsActivated == false &&
        this.SearchByAdvisoryActivated == true &&
        this.SearchByCollectionsActivated == true &&
        this.SearchByPremiumsActivated == true) ||
      (new Date(this.bsValueIni) > new Date(this.bsValueFin) &&
        this.SearchByCommissionsActivated == false &&
        this.SearchByAdvisoryActivated == false &&
        this.SearchByCollectionsActivated == true &&
        this.SearchByPremiumsActivated == true) ||
      (new Date(this.bsValueIni) > new Date(this.bsValueFin) &&
        this.SearchByCommissionsActivated == true &&
        this.SearchByAdvisoryActivated == true &&
        this.SearchByCollectionsActivated == false &&
        this.SearchByPremiumsActivated == true) ||
      (new Date(this.bsValueIni) > new Date(this.bsValueFin) &&
        this.SearchByCommissionsActivated == false &&
        this.SearchByAdvisoryActivated == false &&
        this.SearchByCollectionsActivated == false &&
        this.SearchByPremiumsActivated == false) ||
      (new Date(this.bsValueIni) < new Date(this.bsValueFin) &&
        this.SearchByCommissionsActivated == false &&
        this.SearchByAdvisoryActivated == false &&
        this.SearchByCollectionsActivated == false &&
        this.SearchByPremiumsActivated == false)
    ) {
      if (new Date(this.bsValueIni) > new Date(this.bsValueFin)) {
        this.NameMessage =
          'La fecha inicial no puede ser mayor a la fecha final';
      }
      if (
        this.SearchByCommissionsActivated == false &&
        this.SearchByAdvisoryActivated == false &&
        this.SearchByCollectionsActivated == false &&
        this.SearchByPremiumsActivated == false
      ) {
        this.NameMessage = 'Debe seleccionar al menos una opción de descarga';
      }

      swal
        .fire({
          title: 'Información',
          text: this.NameMessage,
          icon: 'info',
          confirmButtonText: 'Continuar',
          allowOutsideClick: false,
        })
        .then((result) => {
          if (result.value) {
          }
        });
      (err) => {
        this.isLoading = false;
      };
    } else {
      if (
        this.SearchByCommissionsActivated == true &&
        this.SearchByAdvisoryActivated == false &&
        this.SearchByCollectionsActivated == false &&
        this.SearchByPremiumsActivated == false
      ) {
        this.DownloadType = '0';
        this.isLoading = true;
      }

      if (
        this.SearchByCommissionsActivated == false &&
        this.SearchByAdvisoryActivated == true &&
        this.SearchByCollectionsActivated == false &&
        this.SearchByPremiumsActivated == false
      ) {
        this.DownloadType = '1';
        this.isLoading = true;
      }

      if (
        this.SearchByCommissionsActivated == false &&
        this.SearchByAdvisoryActivated == false &&
        this.SearchByCollectionsActivated == true &&
        this.SearchByPremiumsActivated == false
      ) {
        this.DownloadType = '2';
        this.isLoading = true;
      }

      if (
        this.SearchByCommissionsActivated == false &&
        this.SearchByAdvisoryActivated == false &&
        this.SearchByCollectionsActivated == false &&
        this.SearchByPremiumsActivated == true
      ) {
        this.DownloadType = '3';
        this.isLoading = true;
      }

      if (
        this.SearchByCommissionsActivated == true &&
        this.SearchByAdvisoryActivated == true &&
        this.SearchByCollectionsActivated == false &&
        this.SearchByPremiumsActivated == false
      ) {
        this.DownloadType = '4';
        this.isLoading = true;
      }
      if (
        this.SearchByCommissionsActivated == true &&
        this.SearchByAdvisoryActivated == false &&
        this.SearchByCollectionsActivated == true &&
        this.SearchByPremiumsActivated == false
      ) {
        this.DownloadType = '5';
        this.isLoading = true;
      }
      if (
        this.SearchByCommissionsActivated == true &&
        this.SearchByAdvisoryActivated == false &&
        this.SearchByCollectionsActivated == false &&
        this.SearchByPremiumsActivated == true
      ) {
        this.DownloadType = '6';
        this.isLoading = true;
      }
      if (
        this.SearchByCommissionsActivated == true &&
        this.SearchByAdvisoryActivated == true &&
        this.SearchByCollectionsActivated == true &&
        this.SearchByPremiumsActivated == false
      ) {
        this.DownloadType = '7';
        this.isLoading = true;
      }
      if (
        this.SearchByCommissionsActivated == true &&
        this.SearchByAdvisoryActivated == true &&
        this.SearchByCollectionsActivated == false &&
        this.SearchByPremiumsActivated == true
      ) {
        this.DownloadType = '8';
        this.isLoading = true;
      }
      if (
        this.SearchByCommissionsActivated == true &&
        this.SearchByAdvisoryActivated == true &&
        this.SearchByCollectionsActivated == true &&
        this.SearchByPremiumsActivated == true
      ) {
        this.DownloadType = '9';
        this.isLoading = true;
      }
      if (
        this.SearchByCommissionsActivated == false &&
        this.SearchByAdvisoryActivated == true &&
        this.SearchByCollectionsActivated == true &&
        this.SearchByPremiumsActivated == false
      ) {
        this.DownloadType = '10';
        this.isLoading = true;
      }
      if (
        this.SearchByCommissionsActivated == false &&
        this.SearchByAdvisoryActivated == true &&
        this.SearchByCollectionsActivated == false &&
        this.SearchByPremiumsActivated == true
      ) {
        this.DownloadType = '11';
        this.isLoading = true;
      }
      if (
        this.SearchByCommissionsActivated == false &&
        this.SearchByAdvisoryActivated == true &&
        this.SearchByCollectionsActivated == true &&
        this.SearchByPremiumsActivated == true
      ) {
        this.DownloadType = '12';
        this.isLoading = true;
      }
      if (
        this.SearchByCommissionsActivated == false &&
        this.SearchByAdvisoryActivated == false &&
        this.SearchByCollectionsActivated == true &&
        this.SearchByPremiumsActivated == true
      ) {
        this.DownloadType = '13';
        this.isLoading = true;
      }
      if (
        this.SearchByCommissionsActivated == true &&
        this.SearchByAdvisoryActivated == false &&
        this.SearchByCollectionsActivated == true &&
        this.SearchByPremiumsActivated == true
      ) {
        this.DownloadType = '14';
        this.isLoading = true;
      }

      this.listToShow = [];
      this.processCommList = [];
      this.processAdvList = [];
      this.processCollList = [];
      this.processPremList = [];

      let _data: any = {};
      _data.startDate =
        this.bsValueIni.getDate().toString().padStart(2, '0') +
        '/' +
        (this.bsValueIni.getMonth() + 1).toString().padStart(2, '0') +
        '/' +
        this.bsValueIni.getFullYear();
      _data.endDate =
        this.bsValueFin.getDate().toString().padStart(2, '0') +
        '/' +
        (this.bsValueFin.getMonth() + 1).toString().padStart(2, '0') +
        '/' +
        this.bsValueFin.getFullYear();
      _data.searchType = this.DownloadType === '' ? 0 : this.DownloadType;
      this.InterfaceCrossingService.GetInterfacesCrossing(_data).subscribe(
        //Response del Back
        (res) => {
          if (res.P_NCODE == '0') {
            this.processCommList = res.listInterComm;
            this.processAdvList = res.listInterAdv;
            this.processCollList = res.listInterColl;
            this.processPremList = res.listInterPrem;

            if (
              (this.processCommList != null &&
                this.processCommList.length != 0) ||
              (this.processAdvList != null &&
                this.processAdvList.length != 0) ||
              (this.processCollList != null &&
                this.processCollList.length != 0) ||
              (this.processPremList != null && this.processPremList.length != 0)
            ) {
              if (
                this.DownloadType == '0' ||
                this.DownloadType == '4' ||
                this.DownloadType == '5' ||
                this.DownloadType == '6' ||
                this.DownloadType == '7' ||
                this.DownloadType == '8' ||
                this.DownloadType == '9' ||
                this.DownloadType == '14'
              ) {
                this.InterfaceCrossingService.ConvertListCommissionsToExcel(
                  this.processCommList,
                  'Comisiones'
                );
              }
              if (
                this.DownloadType == '1' ||
                this.DownloadType == '4' ||
                this.DownloadType == '7' ||
                this.DownloadType == '8' ||
                this.DownloadType == '9' ||
                this.DownloadType == '10' ||
                this.DownloadType == '11' ||
                this.DownloadType == '12'
              ) {
                this.InterfaceCrossingService.ConvertListAdversoryToExcel(
                  this.processAdvList,
                  'Asesorias'
                );
              }
              if (
                this.DownloadType == '2' ||
                this.DownloadType == '5' ||
                this.DownloadType == '7' ||
                this.DownloadType == '9' ||
                this.DownloadType == '9' ||
                this.DownloadType == '10' ||
                this.DownloadType == '12' ||
                this.DownloadType == '13' ||
                this.DownloadType == '14'
              ) {
                this.InterfaceCrossingService.ConvertListCollectionsToExcel(
                  this.processCollList,
                  'Cobranzas'
                );
              }
              if (
                this.DownloadType == '3' ||
                this.DownloadType == '6' ||
                this.DownloadType == '8' ||
                this.DownloadType == '9' ||
                this.DownloadType == '11' ||
                this.DownloadType == '12' ||
                this.DownloadType == '13' ||
                this.DownloadType == '14'
              ) {
                this.InterfaceCrossingService.ConvertListPremiumsToExcel(
                  this.processPremList,
                  'Primas'
                );
              }
            } else {
              swal.fire('Información', 'No se encontraron registros', 'error');
            }
            this.isLoading = false;
          } else {
            swal.fire({
              title: 'Información',
              text: res.P_SMESSAGE,
              icon: 'warning',
              confirmButtonText: 'Continuar',
              allowOutsideClick: false,
            });
          }
        }
      );
      (err) => {
        this.isLoading = false;
      };
    }
  }
}
