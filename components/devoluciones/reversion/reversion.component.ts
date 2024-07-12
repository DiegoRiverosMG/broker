/**********************************************************************************************/
/*  NOMBRE              :   creditNote.component.TS                                               */
/*  DESCRIPCION         :   Capa components                                                       */
/*  AUTOR               :   MATERIAGRIS - BEDON GONZALES JORGE LUIS                               */
/*  FECHA               :   21/06/2022                                                            */
/*  VERSION             :   1.0 - Devoluciones                                                    */
/*************************************************************************************************/
import { Component, OnInit, ViewChild, ɵConsole } from '@angular/core';
//import { NgbNav,NgbNavItem, NgbNavLink, NgbNavContent, NgbNavOutlet } from '@ng-bootstrap/ng-bootstrap';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CheckboxControlValueAccessor, FormBuilder, Validators } from '@angular/forms';
//import { ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { CreditNoteService } from '../../../services/creditNote/creditNote.service';
//import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, Validator } from '@angular/forms';
import Swal from 'sweetalert2';
import moment from 'moment';
import { NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { element } from 'protractor';
import { Payroll } from '../../../models/payroll/payroll';
import { NULL_EXPR, THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { CallTracker } from 'assert';
import { NgxSpinnerService } from 'ngx-spinner';
import { DevolucionesService } from '@root/layout/broker/services/devoluciones/devoluciones.service';
import { GlobalValidators } from '../../global-validators';


export interface listarCombos {
  NTIPDOC: number;
  DES_TIP_DOC: string;
}
// export class envioFechas  {
//   fechaInicio ?: Date;
//   fechaFin?: Date;
//   sdocumento?: string;
// }
export class envioReversion {
  p_niddev?: string;
  p_sdetalle_correo_rcliente?: string;
  p_sdetalle_correo_rcobranza?: string;
  p_correo_cli?: string;
  P_tipo_correo?: string;
  c_nombrecliente?: string;
}
export interface filtroFechas {
  dfmovimientoDesc: Date;
  dfmovimientoValue: Date;
}
export class listCorreosResults {
  NIDDEV: number = null;
  SCUENTACLIENTE: string = '';
  SCLIENAME: string = '';
  SCORREOCLI: string = '';
  SNUMERO_OPERACION: string = '';
  STRANSFERENCIA: string = '';
  SDETALLE_CORREO: string = '';
  IS_SELECT: boolean = false;
}
export class modalCorreoResults {
  INDEX?: number = null;
  SNUMERO_OPERACION?: string = '';
  SDETALLE_CORREO?: string = '';
  STRANSFERENCIA?: boolean = false;
}
export class listPremiumResults {
  COMPROBANTE: string = '';
  DEFFECDATE: Date = null;
  DDESDE: Date = null;
  DEXPIRDAT: Date = null;
  EMP_ID: number = null;
  IMPDEVO: number = null;
  NAMOUNT: number = null;
  NBRANCH: number = null;   //pk
  NCERTIF: number = null;
  NEWDEFFECDATE: Date = null;
  NEWDEXPIRDAT: Date = null;
  NEWIMPDEVO: number = null;
  NEWPORDEVO: number = null;
  NPOLICY: number = null;
  NPRODUCT: number = null; //pk
  NRECEIPT: number = null;  //pk
  NRECEIPTDEV: number = null;
  NTYPCLIENTDOC: number = null;
  PORDEVO: number = null;
  SCERTYPE: string = '';  //pk
  SCLIENAME: string = '';
  SCLIENT: string = '';
  SCLINUMDOCU: string = '';
  SDES_BRANCH: string = '';
  SDES_COMPRO: string = '';
  SDES_DOCIDE: string = '';
  SDES_MONEDA: string = '';
  SDES_PRODMAST: string = '';
  IS_SELECT: boolean = false;
  PK_IMAGINARIO: string = '';

}


@Component({
  selector: 'app-reversion',
  templateUrl: './reversion.component.html',
  styleUrls: ['./reversion.component.css'],
  providers: [NgbModalConfig, NgbModal],

})
export class ReversionComponent implements OnInit {
  filterForm = new FormGroup({
    idBranch: new FormControl(''),
    Parameter: new FormControl(''),
    idProduct: new FormControl(''),
    NPOLICY: new FormControl(''),
    certificado: new FormControl(''),
    idDocumento: new FormControl(''),
    documento: new FormControl(''),
    idTipCompro: new FormControl(''),
    comprobante: new FormControl(''),
    startDate: new FormControl(''),
    endDate: new FormControl(''),
  });

  selecionadosCarrito: number = 0;
  diaActual = moment(new Date()).toDate();

  filterForm2 = new FormGroup({});
  totalItems = 0;
  currentPage = 1;
  active = 1;

  listToShow: any = [];
  itemsPerPage = 10;

  submitted: boolean = false;
  filterFormN: FormGroup;

  selectedRowIds: Set<number> = new Set<number>();//para prueba grilla
  selecRowIds: Set<number> = new Set<number>();//para prueba grilla POPUP 1
  //Llenamos los combos
  ListBranch: any = [];
  ListProduct: any = [];
  ListParameter: any = [];
  ListDocument: any = [];
  ListBills: any = [];
  listComPago: any = [];
  productTypeList: any[] = [];  //Lista de tipos de producto
  ListState: any = [];
  //para tablas
  listPremiumResults: listPremiumResults[] = [];
  listPremiumResultsCarrito: listPremiumResults[] = [];


  listCorreosResults: listCorreosResults[] = [];
  listCorreosResultsCarrito: listCorreosResults[] = [];

  modalCorreoResults: modalCorreoResults;

  filtroFechas: filtroFechas[] = [];

  listarCombos: listarCombos[] = [];

  // envioFechas:envioFechas;
  envioReversion: envioReversion;

  listReciDev: any[] = [];
  listDetRecDev: any[] = [];
  listReciResu: any[] = [];
  //verifica los datos de la grilla 1 de recibos
  haveBillsDataNC = true;
  haveBillsDataPago = true;
  selectedType = 'predefined';


  //Pantalla de carga
  isLoading: boolean = false;
  condicional: boolean = true;
  //Fechas
  bsConfig: Partial<BsDatepickerConfig>;



  public options = [
    { value: true, id: "Aceptado" },
    { value: false, id: "Rechazado" },
  ]


  //Formato de la fecha
  constructor(
    config: NgbModalConfig, private modalService: NgbModal,
    //private modalService: NgbModal,
    private DevolucionesService: DevolucionesService,
    private CreditNoteService: CreditNoteService,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
  ) {
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: "DD/MM/YYYY",
        locale: "es",
        showWeekNumbers: false
      }
    );
    config.backdrop = 'static';
    config.keyboard = false;
  }

  //Funciones que se ejecutarán tras la compilación
  ngOnInit(): void {


    // this.envioFechas={};
    // this.envioReversion={};
    // this.modalCorreoResults={};

    this.diaActual = new Date(this.diaActual.getFullYear(), this.diaActual.getMonth(), this.diaActual.getDate()); // DGC 09/06/2023
    this.comboBusqueda();
    this.createForm();
    this.initializeForm();
  }


  initializeForm() {
    this.envioReversion = {};
    this.modalCorreoResults = {};
    this.filterFormN.setValidators([GlobalValidators.dateSortE]);
  }

  private createForm(): void {
    this.filterFormN = this.formBuilder.group({
      tipo: [null, [Validators.required]],
      sdocumento: [null, [Validators.required]],
      fechaInicio: [moment(this.diaActual).format('YYYY-MM-DD'), [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]],
      fechaFin: [moment(this.diaActual).format('YYYY-MM-DD'), [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]]
    });
  }

  comboBusqueda(): void {
    this.spinner.show();
    this.DevolucionesService.comboMetodo().subscribe(
      res => {
        console.log("🚀 ~ file: reversion.component.ts ~ line 208 ~ ReversionComponent ~ comboBusqueda ~ res", res)
        this.listarCombos = res.Result.Combos;
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
        Swal.fire('Información', 'Ha ocurrido un error al traer los ramos', 'error');
      }
    )
  }
  buscarReversion(): void {
    // if((this.envioFechas.sdocumento==null || this.envioFechas.sdocumento=="") || (this.envioFechas.fechaInicio==null || this.envioFechas.fechaFin==null)){
    //   console.log("error");
    //   Swal.fire('Información', 'Debe llenar el número de documento y el rango de fechas para realizar la búsqueda.', 'info');
    //   this.spinner.hide();
    // }
    // else{
    this.submitted = true;
    if (this.filterFormN.valid) {
      this.spinner.show();
      this.DevolucionesService.busquedaListarCombo(this.filterFormN.value).subscribe(
        res => {
          this.listCorreosResults = res.Result.Lista;
          this.listToShow = this.listCorreosResults.slice(
            (this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage
          );
          console.log("🚀 ~ file: reversion.component.ts ~ line 221 ~ ReversionComponent ~ buscarReversion ~ listToShow", this.listToShow)

          console.log("🚀 ~ file: reversion.component.ts ~ line 215 ~ ReversionComponent ~ buscarReversion ~ res", res)
          this.spinner.hide();
        },
        err => {
          Swal.fire('Información', 'Sin datos que mostrar', 'error');
          this.spinner.hide();
        }
      )
    }
  }

  onCheck(index: any): void {
    console.log("🚀 ~ file: reversion.component.ts ~ line 232 ~ ReversionComponent ~ onCheck ~ this.listToShow.length", this.listToShow.length)

    for (let i = 0; i < this.listToShow.length; i++) {
      if (i == index) {
        /* this.listToShow[i].IS_SELECT= true; */
        this.envioReversion.p_niddev = this.listToShow[i].niddev;
        this.envioReversion.p_correo_cli = this.listToShow[i].scorreocli;
        this.envioReversion.P_tipo_correo = 'Ningun Tipo',
          this.envioReversion.c_nombrecliente = this.listToShow[i].scliename;
      }
      /* else{
        console.log("🚀 ~ file: reversion.component.ts ~ line 230 ~ ReversionComponent ~ onCheck ~ this.listToShow", this.listToShow)
        this.listToShow[i].IS_SELECT= false;
      } */
    }
  }


  iniciarReversion(): void {
    this.spinner.show();
    if (this.envioReversion.p_niddev == null || this.envioReversion.p_niddev == '') {
      Swal.fire('Información', 'Debe seleccionar una devolución para iniciar la reversión.', 'warning')
      this.spinner.hide();
    } else
      if (this.envioReversion.p_sdetalle_correo_rcliente == null || this.envioReversion.p_sdetalle_correo_rcliente == '') {
        Swal.fire('Información', 'Ingrese cuerpo del correo.', 'warning')
        this.spinner.hide();
      } else
        if (this.envioReversion.p_sdetalle_correo_rcobranza == null || this.envioReversion.p_sdetalle_correo_rcobranza == '') {
          Swal.fire('Información', 'Ingrese cuerpo del correo.', 'warning')
          this.spinner.hide();
        } else
          if ((this.envioReversion.p_sdetalle_correo_rcliente == null || this.envioReversion.p_sdetalle_correo_rcliente == '') && (this.envioReversion.p_sdetalle_correo_rcobranza == null || this.envioReversion.p_sdetalle_correo_rcobranza == '')) {
            Swal.fire('Información', 'Ingrese cuerpo del correo.', 'warning')
            this.spinner.hide();
          }
          else {
            console.log("🚀 ~ file: reversion.component.ts ~ line 246 ~ ReversionComponent ~ iniciarReversion ~ data", this.envioReversion)
            this.DevolucionesService.enviarCorreoReversion(this.envioReversion).subscribe(
              res => {
                if (res == "Se ingreso Correctamente") {
                  Swal.fire('Información', 'La reversión de la devolución se realizó de manera exitosa.', 'success')
                  this.limpiarReversion();
                }
                else {
                  //Ocurrio algun error 
                  console.log("🚀 Error en el envio de correos", res)
                  this.limpiarReversion();

                }
                this.spinner.hide();

              },
              err => {
                Swal.fire('Información', 'Ha ocurrido un error al traer los ramos', 'error');
                this.spinner.hide();
                this.limpiarReversion();
              }
            )
          }


  }

  limpiarReversion(): void {
    this.envioReversion = {};
    this.listCorreosResults = [];
    this.listToShow = [];
    //this.envioFechas={};
  }

  horaFechaEnvio(): void {
    console.log("🚀 ~ file: correo.component.ts ~ line 199 ~ CorreoComponent ~ horaFechaEnvio ~ event", this.filterFormN.value)

    this.DevolucionesService.busquedaHoraFechasCorreo(this.filterFormN.value).subscribe(
      res => {
        console.log("🚀 ~ file: correo.component.ts ~ line 209 ~ CorreoComponent ~ horaFechaEnvio ~ res", res.Result.Lista)
        this.listCorreosResults = res.Result.Lista;
        this.totalItems = res.Result.Lista.length;
        this.listToShow = this.listCorreosResults.slice(
          (this.currentPage - 1) * this.itemsPerPage,
          this.currentPage * this.itemsPerPage
        );



        console.log("🚀 ~ file: correo.component.ts ~ line 229 ~ CorreoComponent ~ horaFechaEnvio ~ this.listToShow", this.listToShow)


      },
      err => { Swal.fire('Información', 'Ha ocurrido un error al traer los ramos', 'error'); }
    )
  }

  msgError(msg) {
    Swal.fire({ title: "Información", text: msg, icon: "error", allowOutsideClick: true, heightAuto: false })
  }

  soloNumeros(evt) {
    var code = (evt.which) ? evt.which : evt.keyCode;
    if (code == 8) { // espacios
      return true;
    } else if (code >= 48 && code <= 57) { // es un numero?


      return true;
    } else { // otros.
      return false;
    }
  }



  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.listCorreosResults.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }


}