/**********************************************************************************************/
/*  NOMBRE              :   creditNote.component.TS                                              */
/*  DESCRIPCION         :   Capa components                                                      */
/*  AUTOR               :   MATERIAGRIS - FRANCISCO AQUIÑO RAMIREZ                               */
/*  FECHA               :   20-12-2021                                                           */
/*  VERSION             :   1.0 - Generación de NC - PD                                          */
/*************************************************************************************************/
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { DevolucionesService } from '../../../services/devoluciones/devoluciones.service';
import { FormGroup } from '@angular/forms';
import moment from 'moment';
import Swal from 'sweetalert2';
import { NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { GlobalValidators } from '../../global-validators';
import { ExcelService } from '@root/shared/services/excel/excel.service';

export interface FiltroDevolucion {
  ntipdev: number;
  des_tipdev: string;
}
export interface FiltroDocDevolucion {
  ntipdoc: number;
  des_tip_doc: string;
}
export interface FiltroTipoDevolucion {
  nvalue: number;
  svalue: string;
}
export interface FiltroBancoCaja {
  id_entidad: number;
  id_tipo_entidad: number;
  vc_nombre: string;
}
export interface FiltroMotivoDev {
  nvalue: number;
  svalue: string;
}

export class listVisualizarResults  {
  NIDDEV: number;
  DFECHADEV: string=  '';
  SUSUARIO: string=  '';
  NRO_CERTIFICADO: string=  '';
  NRO_TRANSACCION: string=  '';
  MOTIVO_DEVOLUCION: string=  '';
  SPRODUCTO: string=  '';
  SCLIENTE:string=  '';
  FACTURA:string=  '';
  NOTA_CREDITO: string=  '';
  S_MONEDA : string=  '';
  IS_SELECT:boolean = false;
}
export interface EnviarExactus {
  bancoProtecta ?: string;
  numeroCuentaProtecta ?: string;
}

// export interface EnviarVisualizar {
//   nabonodev ?: number;
//   ntipodev ?: number;
//   dfechaini?: Date;
//   dfechafin?: Date;
// }

@Component({
  selector: 'app-devolucion',
  templateUrl: './devolucion.component.html',
  styleUrls: ['./devolucion.component.css'],
  providers: [NgbModalConfig, NgbModal],

})


export class DevolucionComponent implements OnInit {
   //Fechas

  public bsConfig: Partial<BsDatepickerConfig>;

  filtroDevolucion: FiltroDevolucion[] = [];
  filtroDocDevolucion: FiltroDocDevolucion[] = [];
  filtroTipoDevolucion: FiltroTipoDevolucion[] = [];
  filtroMotivoDev: FiltroMotivoDev[] = [];
  filtroBancoCaja: FiltroBancoCaja[] = [];
  EnviarExactus: EnviarExactus;
  //EnviarVisualizar: EnviarVisualizar;

  filterForm: FormGroup;
  submitted: boolean = false;

  listVisualizarResults: listVisualizarResults [] = [];
  listToShow: any = [];
  detalleDevoXLSX: [];
  currentPage = 1;
  itemsPerPage = 10;

  seleccionarTodos:boolean = false;
  diaActual = moment(new Date()).toDate();

  //Formato de la fecha
  constructor(
    private DevolucionesService: DevolucionesService,
    private formBuilder: FormBuilder,
    private excelService: ExcelService
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

  //Funciones que se ejecutarán tras la compilación
  ngOnInit(): void {
    this.diaActual = new Date(this.diaActual.getFullYear(), this.diaActual.getMonth(), this.diaActual.getDate()); // DGC 09/06/2023
    this.createForm();
    this.initializeForm();

    this.DevolucionesService.listarMotivo().subscribe(
      res => { /* this.ListBranch = res; */
      this.filtroMotivoDev=res.Result.Combos;
      console.log("🚀 ~ file: devolucion.component.ts ~ line 55 ~ DevolucionComponent ~ ngOnInit ~ res", res)},
      err => { Swal.fire('Información', 'Ha ocurrido un error al traer los ramos', 'error'); }
    )
    this.DevolucionesService.listarTipoDev().subscribe(
      res => {
        this.filtroTipoDevolucion=res.Result.Combos;

      console.log("🚀 ~ file: devolucion.component.ts ~ line 55 ~ DevolucionComponent ~ ngOnInit ~ res", res)},
      err => { Swal.fire('Información', 'Ha ocurrido un error al traer los ramos', 'error'); }
    )
    this.DevolucionesService.listarTipoDoc().subscribe(
      res => {
        this.filtroDocDevolucion=res.Result.Combos;

      console.log("🚀 ~ file: devolucion.component.ts ~ line 55 ~ DevolucionComponent ~ ngOnInit ~ res", res)},
      err => { Swal.fire('Información', 'Ha ocurrido un error al traer los ramos', 'error'); }
    )

    this.DevolucionesService.listarCombosDevoluciones().subscribe(
      res => {
        this.filtroDevolucion=res.Result.Combos;

      console.log("🚀 ~ file: devolucion.component.ts ~ line 55 ~ DevolucionComponent ~ ngOnInit ~ res", res)},
      err => { Swal.fire('Información', 'Ha ocurrido un error al traer los ramos', 'error'); }
    )

    this.DevolucionesService.listarBancosCajas().subscribe(
      res => {
        this.filtroBancoCaja=res.Result.Combos;

      console.log("🚀 ~ file: devolucion.component.ts ~ line 55 ~ DevolucionComponent ~ ngOnInit ~ res", res)},
      err => { Swal.fire('Información', 'Ha ocurrido un error al traer los ramos', 'error'); }
    )
  }

  private createForm(): void {
    this.filterForm = this.formBuilder.group({
      ntipodev:  [null, [Validators.required]],
      nabonodev: [null, [Validators.required]],
      dfechaini: [moment(this.diaActual).format('YYYY-MM-DD'), [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]],
      dfechafin: [moment(this.diaActual).format('YYYY-MM-DD'), [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]]
    });
  }

  initializeForm(){
    this.EnviarExactus={};
    this.EnviarExactus.bancoProtecta='0';
    this.filterForm.setValidators([GlobalValidators.dateSortA]);
  }

  visualizar(): void {
    this.submitted = true;
    if (this.filterForm.valid) { 
      this.DevolucionesService.vizualizarDevoluciones(this.filterForm.value).subscribe(
        res => {
          console.log("🚀 ~ file: devolucion.component.ts ~ line 55 ~ DevolucionComponent ~ ngOnInit ~ res", res);
          this.listVisualizarResults=res.Result.Lista;
          console.log("🚀 ~ file: devolucion.component.ts ~ line 175 ~ DevolucionComponent ~ visualizar ~ this.listVisualizarResults", this.listVisualizarResults)

          this.listToShow = this.listVisualizarResults.slice(
                          (this.currentPage - 1) * this.itemsPerPage,
                          this.currentPage * this.itemsPerPage
                        );
          console.log("🚀 ~ file: devolucion.component.ts ~ line 180 ~ DevolucionComponent ~ visualizar ~   this.listToShow ",   this.listToShow )

          },
        err => { Swal.fire('Información', 'Ha ocurrido un error al traer los ramos', 'error'); }
      )
    }
  }

  enviarExactus=()=>{
    if (this.listVisualizarResults.filter(x => x.IS_SELECT==true).length == 0) {
      Swal.fire('Información', 'Seleccione al menos un registro.', 'warning');
      return;
    } else if (this.EnviarExactus.bancoProtecta == "0") {
      Swal.fire('Información', 'Seleccione un banco.', 'warning');
      return;
    } else if (this.EnviarExactus.numeroCuentaProtecta == null || this.EnviarExactus.numeroCuentaProtecta == '') {
      Swal.fire('Información', 'Ingrese un número de cuenta.', 'warning');
      return;
    }
    else {
      //console.log("lleguw 12",this.EnviarExactus);
      //console.log("tamaño: ", this.listVisualizarResults.filter(x => x.IS_SELECT==true).length);
      let val: number = 0;
      for(let i=0;i<this.listVisualizarResults.filter(x => x.IS_SELECT==true).length;i++){
        //console.log("lleguw 1");
        if (i+1==this.listVisualizarResults.filter(x => x.IS_SELECT==true).length){
          val = 1;
        }
        let data={
          'P_NIDDEV':this.listVisualizarResults.filter(x => x.IS_SELECT==true)[i].NIDDEV,
          'P_NIDBANCOPROTECTA':this.EnviarExactus.bancoProtecta,
          'P_SNUMBACOPROTECTA':this.EnviarExactus.numeroCuentaProtecta,
          'P_NSTE':val
        }
                 
          console.log("DATA1 - ",data);
          this.DevolucionesService.enviarExactus(data).subscribe(
          res => {
            console.log("🚀 ~ DATA2 ~ res", res)
            if(res.Result.Lista.length>0){
              if(this.filterForm.controls.nabonodev.value == 1){
                this.detalleDevoXLSX = res.Result.Lista;
                this.excelService.exportDevoReport2(this.detalleDevoXLSX, 'RegistroExactus');
              }
              else{
                this.detalleDevoXLSX = res.Result.Lista;
                this.excelService.exportDevoReport(this.detalleDevoXLSX, 'RegistroExactus');
              }             
             
            }
          },
          err => { Swal.fire('Información', 'Ha ocurrido un error al generar el archivo', 'error'); }
        )
      }
      this.listVisualizarResults=[];
      this.listVisualizarResults=[];
      this.listToShow=[];
      this.EnviarExactus={};
      //this.EnviarVisualizar={};
      this.seleccionarTodos=false;
      Swal.fire({title: "Información",text: "Se generó el reporte correctamente.",icon: "success",allowOutsideClick: true,heightAuto: false})
    }
  }
  onRowClick1(){
    console.log("llegue a todos",this.seleccionarTodos);

    if(this.seleccionarTodos==true){
      this.seleccionarTodos=false;
      for(let i=0;i<this.listVisualizarResults.length;i++){
        this.listVisualizarResults[i].IS_SELECT =false;
      }
    }
    else{
      this.seleccionarTodos=true;
      for(let i=0;i<this.listVisualizarResults.length;i++){
        this.listVisualizarResults[i].IS_SELECT =true;

      }
    }


  }
  onRowClick(id: number,gri1:any) {

     if(gri1.IS_SELECT==true){
      this.listVisualizarResults[id].IS_SELECT =false;
    }
    else
    {
      this.listVisualizarResults[id].IS_SELECT =true;
     }

     console.log("🚀 ~ file: devolucion.component.ts ~ line 200 ~ DevolucionComponent ~ onRowClick ~ this.listToShow", this.listToShow);

  }

  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.listVisualizarResults.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }
  soloNumeros(evt){
    var code = (evt.which) ? evt.which : evt.keyCode;
        if(code==8) { // espacios
          return true;
        } else if(code>=48 && code<=57) { // es un numero?


          return true;
        } else{ // otros.
          return false;
        }
      }
}