import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ModuleCostCenterService } from '../../../backoffice/services/module-cost-center/module-cost-center.service';
import moment from 'moment';
import Swal from 'sweetalert2';

export interface FiltroInterfaz {
  NBRANCH?: number;
}
export interface FiltroFechas {
  DFECINI?: Date;
  DFECFIN?: Date;
}
export interface BuscarAgregar {
  P_CODCC?: string;
  P_CONTRATA?: string;
  P_SMESSAGE?: string;
}
export interface ListarCenCosPoliza {
  SPRODUCT?: string;
  SBRANCH?: string;
  NPOLICY?: number;
  INDEX?: number;
  FECHA?: string;
}

@Component({
  selector: 'app-module-cost-center',
  templateUrl: './module-cost-center.component.html',
  styleUrls: ['./module-cost-center.component.css'],
})

export class ModuleCostCenterComponent implements OnInit {

  public bsConfig: Partial<BsDatepickerConfig>;
  filterForm: FormGroup;
  newForm: FormGroup;
  assignForm: FormGroup;
  diaActual = moment(new Date()).toDate();

  filtroInterfaz: FiltroInterfaz;
  filtroFechas: FiltroFechas;
  buscarAgregar: BuscarAgregar;
  listarCenCosPoliza: ListarCenCosPoliza;
  regAssignForm: FormGroup;

  default: any = '';
  ocultarTodos: any = '';
  ramos: [];
  ramosTodos: [];
  productos: [];
  productosTodos: [];
  ListarCentroCostos: any = [];
  listarAsignarCenCos: [];
  listarAsignarPoliza: any = [];

  listToShow: any = [];
  listToShowAsig: any = [];
  listToShowPoliza: any = [];
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;
  maxSize = 5;

  validarAgregar = 0;
  validadAgregar: boolean = true;
  validarIncluirFecha: boolean = false;
  temp_centroCostos_is_checked: boolean = false;

  tablaPoliza = [];
  checkCenCos: any = [];
  checkTotal: any = [];
  checkPoliza: any = [];
  checkTotalCC: any = [];
  checkAll: boolean = false;
  checkOnly: boolean = false;

  fechaPrueba: Date;
  fechaInicio: Date;
  fechaFin: Date;

  constructor(
    private moduleCostCenterService: ModuleCostCenterService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder
  ) {
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        showWeekNumbers: false,
        isDisable: true
      }
    );
  }

  ngOnInit(): void {
    this.default = '0';
    this.createForm();
    this.inicializarFiltros();
    this.getParams();
    this.filterForm.controls.DFECINI.disable();
    this.filterForm.controls.DFECFIN.disable();
    // this.listarConfiguracionAsientoContable();
  }

  private createForm(): void {
    this.filterForm = this.formBuilder.group({
      NBRANCH: [61, Validators.required],
      NPRODUCT: [0],
      CFLAGALLN: [false],
      CFLAGALL: [false],
      DFECINI: [null],
      DFECFIN: [null],
      CODCC: [''],
      TIPOLIST: [0],
    });
    this.newForm = this.formBuilder.group({
      NBRANCH: [61],
      NPRODUCT: [0],
      SCLINUMDOCU: [''],
      CODCC: [''],
      CONTRATA: [''],
      SFACCENCOS: [''],
      SDESCENCOS: [''],
    });
    this.assignForm = this.formBuilder.group({
      NBRANCH: [61],
      NPRODUCT: [0],
      CFLAGALL: [2],
      DFECINI: [null],
      DFECFIN: [null],
      CODCC: [''],
      NTIPOBUSQ: [0],
      NPOLICY: [''],
      TIPOLIST: [1],
    });
    this.regAssignForm = this.formBuilder.group({
      NBRANCH: [61],
      NPRODUCT: [0],
      NIDCENCOS: [],
      NPOLICY: [],
    });
  }

  getParams = () => {
    let $ramos = this.moduleCostCenterService.listarRamos();
    let $ramosTodos = this.moduleCostCenterService.listarRamosTodos();
    return forkJoin([$ramos, $ramosTodos]).subscribe(
      (res) => {
        this.ramos = res[0].Result.combos;
        this.ramosTodos = res[1].Result.combos;
        // this.tipoDinamica = res[2].Result.combos;
      },
      (err) => {
        Swal.fire(
          'Información',
          'Ha ocurrido un error al obtener los parámetros.',
          'error'
        );
      }
    );
  };

  inicializarFiltros = () => {

    this.filtroInterfaz = {};
    // this.filtroInterfaceDetalle = {};
    this.filtroInterfaz.NBRANCH = 61;
    this.listarProductosTodos(this.filtroInterfaz);
  };

  seleccionarRamos = (e) => {
    this.filterForm.controls.NPRODUCT.setValue(0);
    this.listarProductosTodos(this.filterForm.value);
  };

  seleccionarRamosAgregar() {
    this.newForm.controls.NPRODUCT.setValue(0);
    this.listarProductos(this.newForm.value);
  }

  seleccionarRamosAsignar() {
    this.assignForm.controls.NPRODUCT.setValue(0);
    this.listarProductos(this.assignForm.value);
  }

  listarProductos = (item) => {
    this.moduleCostCenterService.listarProductos(item).subscribe(
      (res) => {
        this.productos = res.Result.combos;
      },
      (err) => {
        Swal.fire(
          'Información',
          'Ha ocurrido un error al obtener los productos.',
          'error'
        );
      }
    );
  };

  listarProductosTodos = (item) => {
    this.moduleCostCenterService.listarProductosTodos(item).subscribe(
      (res) => {
        this.productosTodos = res.Result.combos;
      },
      (err) => {
        Swal.fire(
          'Información',
          'Ha ocurrido un error al obtener los productos.',
          'error'
        );
      }
    );
  };

  incluirFecha(checked) {
    if (checked == true) {
      this.validarIncluirFecha = true;
      this.filterForm.controls.DFECINI.enable();
      this.filterForm.controls.DFECINI.setValue(this.diaActual);
      this.filterForm.controls.DFECFIN.enable();
      this.filterForm.controls.DFECFIN.setValue(this.diaActual);
    } else {
      this.validarIncluirFecha = false;
      this.filterForm.controls.DFECINI.disable();
      this.filterForm.controls.DFECINI.setValue(null);
      this.filterForm.controls.DFECFIN.disable();
      this.filterForm.controls.DFECFIN.setValue(null);
    }
  }

  soloNumero(evt: any) {
    return evt.charCode >= 48 && evt.charCode <= 57;
  }

  buscarCentroCostos() {
    this.filterForm.controls.CODCC.setValue('');
    this.filterForm.value.CFLAGALLN == true
      ? (this.filterForm.value.CFLAGALLN = 0)
      : (this.filterForm.value.CFLAGALLN = 2);
    this.filterForm.controls.CFLAGALL.setValue(this.filterForm.value.CFLAGALLN);
    // this.filterForm.value.CFLAGALL == true
    //   ? (this.filterForm.value.CFLAGALL = 0)
    //   : (this.filterForm.value.CFLAGALL = 2);

    if (this.filterForm.value.CFLAGALL == 0) {
      if (
        this.filterForm.value.DFECINI !== null &&
        this.filterForm.value.DFECINI !== undefined
      ) {
        if (
          this.filterForm.value.DFECFIN !== null &&
          this.filterForm.value.DFECFIN !== undefined
        ) {
          if (this.filterForm.value.DFECINI > this.filterForm.value.DFECFIN) {
            Swal.fire('Información', 'Rango de fechas erróneo.', 'warning');
            return;
          }
          this.filterForm.value.DFECFIN = this.formatoFecha(
            this.filterForm.value.DFECFIN
          );
        } else {
          Swal.fire('Información', 'Ingrese la fecha de fin.', 'warning');
          return;
        }
        this.filterForm.value.DFECINI = this.formatoFecha(
          this.filterForm.value.DFECINI
        );
      } else {
        Swal.fire('Información', 'Ingrese la fecha de inicio.', 'warning');
        return;
      }
    } else {
      this.filterForm.controls.DFECINI.setValue(null);
      this.filterForm.controls.DFECFIN.setValue(null);
      this.filterForm.controls.CFLAGALL.setValue(0);
    }
    this.listarCentroCostos(this.filterForm.value);
  }

  buscarDocumento() {
    this.filterForm.controls.CODCC.setValue(this.filterForm.value.CODCC);
    if (this.filterForm.value.CODCC == '') {
      Swal.fire('Información', 'Ingrese el documento a buscar.', 'warning');
      return;
    }
    this.filterForm.controls.CFLAGALL.setValue(3);
    this.listarCentroCostos(this.filterForm.value);
  }

  listarCentroCostos = (item) => {
    this.ListarCentroCostos = [];
    this.moduleCostCenterService.listarCentroCostos(item).subscribe(
      (res) => {
        this.currentPage = 1;
        this.ListarCentroCostos = res.Result.lista;
        this.ListarCentroCostos.forEach((e) => {
          this.fechaPrueba = new Date(e.DFECREG);
          e.DFECREG = this.formatoFecha(this.fechaPrueba);
        });
        this.ListarCentroCostos = res.Result.lista;
        this.totalItems = this.ListarCentroCostos.length;
        this.listToShow = this.ListarCentroCostos.slice(
          (this.currentPage - 1) * this.itemsPerPage,
          this.currentPage * this.itemsPerPage
        );

        this.filterForm.controls.CFLAGALL.setValue(this.validarIncluirFecha);
      },
      (err) => {
        Swal.fire(
          'Información',
          'Ha ocurrido un error al obtener los centros de costos.',
          'error'
        );
      }
    );
  };

  formatoFecha(item) {
    let day = `0${item.getDate()}`.slice(-2); //("0"+date.getDate()).slice(-2);
    let month = `0${item.getMonth() + 1}`.slice(-2);
    let year = item.getFullYear();
    return `${day}/${month}/${year}`;
  }

  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.ListarCentroCostos.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }

  mostrarModalAgregar(content: any) {
    this.newForm.controls.CONTRATA.disable();
    this.newForm.controls.SFACCENCOS.disable();
    this.newForm.controls.CODCC.disable();
    this.newForm.controls.SDESCENCOS.disable();

    this.newForm.controls.NBRANCH.setValue(61);
    this.newForm.controls.NPRODUCT.setValue(0);
    this.newForm.controls.SCLINUMDOCU.setValue('');
    this.newForm.controls.SFACCENCOS.setValue('');
    this.newForm.controls.SDESCENCOS.setValue('');
    this.newForm.controls.CODCC.setValue('');
    this.newForm.controls.CONTRATA.setValue('');
    this.seleccionarRamosAgregar();
    this.modalService.open(content, {
      backdrop: 'static',
      size: 'lg',
      keyboard: false,
      centered: true,
    });
  }

  buscarModalAgregar() {
    if (this.newForm.value.NPRODUCT == 0) {
      Swal.fire('Información', 'Seleccione un producto.', 'warning');
      return;
    }
    if (this.newForm.value.SCLINUMDOCU == '') {
      Swal.fire('Información', 'Ingrese el número de documento.', 'warning');
      return;
    }
    this.validarCentroCostos(this.newForm.value);
  }

  validarCentroCostos(item) {
    this.moduleCostCenterService.validarCentroCostos(item).subscribe(
      (res) => {
        if (res.Result.P_EST == 0) {
          //Error en la data
          Swal.fire('Error', res.Result.P_SMESSAGE, 'error');
          return;
        } else if (res.Result.P_EST == 1) {
          //Mas de un Centro de Costos Asignado
          Swal.fire({
            title: 'Información',
            text: res.Result.P_SMESSAGE,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar',
          }).then((result) => {
            if (result.value) {
              this.buscarAgregarCentroCostos();
            }
          });
        } else {
          //Centro de Costos Nuevo
          this.buscarAgregarCentroCostos();
        }
      },
      (err) => {
        Swal.fire(
          'Información',
          'Ha ocurrido un error al obtener los centros de costos.',
          'error'
        );
      }
    );
  }

  buscarAgregarCentroCostos() {
    this.moduleCostCenterService
      .buscarAgregarCentroCostos(this.newForm.value)
      .subscribe(
        (res) => {
          if (res.Result.P_EST == 1) {
            Swal.fire('Información', res.Result.P_SMESSAGE, 'warning');
            return;
          }
          this.newForm.controls.SDESCENCOS.enable();
          this.buscarAgregar = res.Result;
          this.newForm.controls.CODCC.setValue(this.buscarAgregar.P_CODCC);
          this.newForm.controls.CONTRATA.setValue(
            this.buscarAgregar.P_CONTRATA
          );
          this.newForm.controls.SFACCENCOS.setValue(
            this.buscarAgregar.P_SMESSAGE
          );

          this.validarAgregar = 1;
        },
        (err) => {
          Swal.fire(
            'Información',
            'Ha ocurrido un error al obtener los centros de costos.',
            'error'
          );
        }
      );
  }

  agregarCentroCosto() {
    if (this.newForm.value.SDESCENCOS == '') {
      Swal.fire(
        'Información',
        'Ingrese la descripción del nuevo centro de costos.',
        'warning'
      );
      return;
    }
    if (this.validarAgregar == 0) {
      Swal.fire(
        'Información',
        'Busque el nuevo centro de costos.',
        'warning'
      );
      return;
    }

    this.newForm.controls.CODCC.enable();

    this.moduleCostCenterService
      .agregarCentroCostos(this.newForm.value)
      .subscribe(
        (res) => {
          Swal.fire('Información', res.Result.P_SMESSAGE, 'success');
        },
        (err) => {
          Swal.fire(
            'Información',
            'Ha ocurrido un error al guardar los centros de costos.',
            'error'
          );
        }
      );
    this.modalService.dismissAll();
  }

  mostrarModalAsignar(content: any) {
    this.assignForm.controls.NBRANCH.setValue(61);
    this.assignForm.controls.NPRODUCT.setValue(0);
    this.assignForm.controls.CODCC.setValue('');
    this.assignForm.controls.NTIPOBUSQ.setValue(0);
    this.assignForm.controls.DFECINI.setValue(null);
    this.assignForm.controls.DFECFIN.setValue(null);
    this.assignForm.controls.NPOLICY.setValue('');
    this.listToShowAsig = [];
    this.listToShowPoliza = [];
    this.checkCenCos = [];
    this.checkPoliza = [];
    this.seleccionarRamosAgregar();
    this.tipoBusqueda();
    this.modalService.open(content, {
      backdrop: 'static',
      size: 'xl',
      keyboard: false,
      centered: true,
    });
  }

  buscarAsignarCC() {
    if (this.assignForm.value.NPRODUCT == 0) {
      Swal.fire('Información', 'Seleccione un producto.', 'warning');
      return;
    }
    this.listarAsignarCC(this.assignForm.value);
  }

  listarAsignarCC = (item) => {
    this.listarAsignarCenCos = [];
    this.moduleCostCenterService.listarCentroCostos(item).subscribe(
      (res) => {
        this.listarAsignarCenCos = res.Result.lista;
        this.listToShowAsig = this.listarAsignarCenCos;
        this.checkCenCos = [];
      },
      (err) => {
        Swal.fire(
          'Información',
          'Ha ocurrido un error al obtener los centros de costos.',
          'error'
        );
      }
    );
  };

  buscarAsignarPoliza() {
    this.fechaInicio = this.assignForm.value.DFECINI;
    this.fechaFin = this.assignForm.value.DFECFIN;

    if (this.assignForm.value.NPRODUCT == 0) {
      Swal.fire('Información', 'Seleccione un producto.', 'warning');
      return;
    }
    if (
      this.assignForm.value.DFECINI == 'Invalid Date' ||
      this.assignForm.value.DFECFIN == 'Invalid Date'
    ) {
      Swal.fire('Información', 'Formato de fecha incorrecto.', 'warning');
      return;
    }
    if (this.assignForm.value.NTIPOBUSQ == 1) {
      if (
        this.assignForm.value.DFECINI !== null &&
        this.assignForm.value.DFECINI !== undefined
      ) {
        if (
          this.assignForm.value.DFECFIN !== null &&
          this.assignForm.value.DFECFIN !== undefined
        ) {
          if (this.assignForm.value.DFECINI > this.assignForm.value.DFECFIN) {
            Swal.fire('Información', 'Rango de fechas erróneo.', 'warning');
            return;
          }
          this.assignForm.value.DFECFIN = this.formatoFecha(
            this.assignForm.value.DFECFIN
          );
        } else {
          Swal.fire('Información', 'Ingrese la fecha de fin.', 'warning');
          return;
        }
        this.assignForm.value.DFECINI = this.formatoFecha(
          this.assignForm.value.DFECINI
        );
      } else {
        Swal.fire('Información', 'Ingrese la fecha de inicio.', 'warning');
        return;
      }
    }

    this.listarPoliza(this.assignForm.value);
  }

  listarPoliza(item) {
    this.listarAsignarPoliza = [];
    this.tablaPoliza = [];
    //this.listarCenCosPoliza ={};
    this.moduleCostCenterService.listarPoliza(item).subscribe(
      (res) => {
        this.listarAsignarPoliza = res.Result.lista;
        this.listarAsignarPoliza.forEach((e, i) => {
          this.fechaPrueba = new Date(e.FECHA);
          e.FECHA = this.formatoFecha(this.fechaPrueba);
          e.INDEX = i;
          this.tablaPoliza.push(e);
        });
        this.listToShowPoliza = this.listarAsignarPoliza;

        this.assignForm.value.DFECINI = this.fechaInicio;
        this.assignForm.value.DFECFIN = this.fechaFin;

        this.checkAll = false;
        this.checkPoliza = [];
        this.mostrarOcultar(this.listarAsignarPoliza.length);
      },
      (err) => {
        Swal.fire(
          'Información',
          'Ha ocurrido un error al obtener los centros de costos.',
          'error'
        );
      }
    );
  }

  mostrarOcultar(item) {
    this.ocultarTodos = document.querySelector('tr.mostrar-ocultar');
    if (item > 1) {
      this.ocultarTodos.style.display = 'block';
    } else {
      this.ocultarTodos.style.display = 'none';
    }
  }
  comprobarCenCos(checkbox, item) {
    this.checkTotalCC = document.querySelectorAll('[type=checkbox].chkAsignar');
    this.checkTotalCC.forEach((e) => {
      if (e.checked == true) {
        e.checked = false;
      }
    });
    checkbox.checked = true;
    this.checkCenCos = item;
  }

  comprobarPoliza(checkbox, item) {
    let validar = [];
    this.checkAll = false;

    this.checkTotal = document.querySelectorAll('[type=checkbox].chkPoliza');
    this.checkTotal.forEach((e, i, o) => {
      if (e.checked == true) {
        validar.push(true);
      }
    });

    let valor = item.INDEX;
    if (checkbox == true) {
      this.checkPoliza.push(item);
    } else {
      this.checkPoliza.forEach((e, i, o) => {
        if (e.INDEX == valor) {
          o.splice(i, 1);
        }
      });
    }

    if (validar.length == this.listToShowPoliza.length) {
      this.checkAll = true;
    }
  }

  seleccionarTodos(checkbox, item) {
    this.checkPoliza = [];
    this.checkTotal = document.querySelectorAll('[type=checkbox].chkPoliza');
    this.checkTotal.forEach((e) => {
      if (checkbox == true) {
        e.checked = true;
        this.checkAll = true;
      } else {
        e.checked = false;
        this.checkAll = false;
      }
    });
    checkbox == true ? (this.checkPoliza = item) : (this.checkPoliza = []);
  }

  tipoBusqueda() {
    if (this.assignForm.value.NTIPOBUSQ == 0) {
      this.assignForm.controls.DFECINI.disable();
      this.assignForm.controls.DFECINI.setValue(null);
      this.assignForm.controls.DFECFIN.disable();
      this.assignForm.controls.DFECFIN.setValue(null);
      this.assignForm.controls.NPOLICY.enable();
    } else {
      this.assignForm.controls.DFECINI.enable();
      this.assignForm.controls.DFECINI.setValue(this.diaActual);
      this.assignForm.controls.DFECFIN.enable();
      this.assignForm.controls.DFECFIN.setValue(this.diaActual);
      this.assignForm.controls.NPOLICY.disable();
    }
    this.assignForm.controls.NPOLICY.setValue('');
  }

  guardarAsignacion() {
    if (this.checkCenCos.length == 0) {
      Swal.fire('Información', 'Seleccione un centro de costos.', 'warning');
      return;
    }
    if (this.checkPoliza.length == 0) {
      Swal.fire('Información', 'Seleccione una o más pólizas.', 'warning');
      return;
    }
    this.checkPoliza.forEach((e) => {
      this.regAssignForm.value.NBRANCH = this.assignForm.value.NBRANCH;
      this.regAssignForm.value.NPRODUCT = this.assignForm.value.NPRODUCT;
      this.regAssignForm.value.NIDCENCOS = this.checkCenCos.NIDCENCOS;
      this.regAssignForm.value.NPOLICY = e.NPOLICY;
      this.registrarAsignacion(this.regAssignForm.value);
    });
  }

  registrarAsignacion(item) {
    this.moduleCostCenterService.registrarAsignacion(item).subscribe(
      (res) => {
        // Swal.fire('Información', res.Result.P_SMESSAGE, 'success');
        Swal.fire('Información', 'Pólizas seleccionadas, asignadas correctamente.', 'success');
        this.modalService.dismissAll();
      },
      (err) => {
        Swal.fire(
          'Información',
          'Ha ocurrido un error al registrar la asignación.',
          'error'
        );
      }
    );
  }
}
