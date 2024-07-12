import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientInformationService } from '../../../services/shared/client-information.service';
import { CoverService } from '../../../services/maintenance/cover/cover.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-cover-index',
  templateUrl: './cover-index.component.html',
  styleUrls: ['./cover-index.component.css'],
})
export class CoverIndexComponent implements OnInit {
  coverList: any = [];
  branchList: any = [];
  productList: any = [];
  stateList: any = [];
  inputsCover: any = {};
  isLoading: boolean = false;
  codBranchSelected: number;
  desBranchSelected: string;
  desProductSelected: string;
  codProductSelected: number;
  existResults: boolean;
  foundResults: any = [];
  listToShow: any = [];
  processHeaderList: any = [];
  currentPage = 1; // página actual
  rotate = true; //
  maxSize = 10; // cantidad de paginas que se mostrarán en el paginado
  itemsPerPage = 5; // limite de items por página
  totalItems = 0; // total de items encontrados

  constructor(
    private clientInformationService: ClientInformationService,
    private router: Router,
    private coverService: CoverService
  ) {}

  ngOnInit() {
    this.getBranchList();
    this.getStateList();
    this.inputsCover.NCODIGINT = null;
  }

  getCoverList() {
    this.listToShow = [];
    this.processHeaderList = [];
    this.isLoading = true;
    this.currentPage = 1; // página actual
    this.rotate = true; //
    this.maxSize = 10; // cantidad de paginas que se mostrarán en el paginado
    this.itemsPerPage = 10; // limite de items por página
    this.totalItems = 0; // total de items encontrados

    let data: any = {};
    if (this.inputsCover.NCODIGINT == 1) data.NESTADO = 1;
    else if (this.inputsCover.NCODIGINT == 4) data.NESTADO = 2;
    else data.NESTADO = 0;

    this.coverService.GetCoverGenList(data).subscribe(
      (res) => {
        console.log(res);
        this.coverList = res;
        this.totalItems = this.coverList.length;
        this.listToShow = this.coverList.slice(
          (this.currentPage - 1) * this.itemsPerPage,
          this.currentPage * this.itemsPerPage
        );
        if (this.coverList.length === 0) {
          swal
            .fire({
              title: 'Información',
              text: 'No se encuentran procesos con la fecha ingresada.',
              icon: 'error',
              confirmButtonText: 'OK',
              allowOutsideClick: false,
            })
            .then((result) => {
              if (result.value) {
              }
            });
        } else {
          this.existResults = true;
        }
        this.isLoading = false;
      },
      (err) => {
        this.isLoading = false;
        console.log(err);
      }
    );
  }

  changeState(covergen, state) {
    let msg: string = '';
    let txtButton: string = '';
    if (state.toUpperCase() === 'ACTIVO') {
      msg = '¿Está seguro de anular la cobertura?';
      txtButton = 'Anular';
    } else {
      msg = '¿Está seguro de activar la cobertura?';
      txtButton = 'Activar';
    }

    swal
      .fire({
        title: 'Información',
        text: msg,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: txtButton,
        allowOutsideClick: false,
        cancelButtonText: 'Cancelar',
      })
      .then((result) => {
        if (result.value) {
          this.inputsCover.SSTATE = state;
          this.inputsCover.NCOVERGEN = covergen;
          var imagenAnula = document.getElementById(
            'imagenAnula'
          ) as HTMLImageElement;
          this.coverService.updateStateCoverGen(this.inputsCover).subscribe(
            (res) => {
              if (res.P_NCODE == 0) {
                this.getCoverList();
                imagenAnula.src = 'assets/icons/editar.png';
              } else if (res.P_NCODE == 1) {
                swal.fire('Información', res.P_SMESSAGE, 'error');
              } else {
                swal.fire('Información', res.P_SMESSAGE, 'warning');
              }
            },
            (err) => {
              swal.fire('Información', err.statusText, 'warning');
            }
          );
        }
      });
  }

  getBranchList() {
    this.clientInformationService.getBranch().subscribe(
      (res) => {
        this.branchList = res;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getStateList() {
    this.clientInformationService.getStateList().subscribe(
      (res) => {
        this.stateList = res;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  newCover(accion) {
    this.router.navigate(['/extranet/add-cover'], {
      queryParams: { Accion: accion, document: '', receiver: '' },
    });
  }

  openModal(item, accion) {
    this.router.navigate(['/extranet/add-cover'], {
      queryParams: { Accion: accion, NCOVERGEN: item.NCOVERGEN, receiver: '' },
    });
  }

  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.coverList.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }
}
