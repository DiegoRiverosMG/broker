/**********************************************************************************************/
/*  NOMBRE              :   creditNote.component.TS                                              */
/*  DESCRIPCION         :   Capa components                                                      */
/*  AUTOR               :   MATERIAGRIS - FRANCISCO AQUIÑO RAMIREZ                               */
/*  FECHA               :   20-12-2021                                                           */
/*  VERSION             :   1.0 - Generación de NC - PD                                          */
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

// export class envioFechas  {
//   fechaInicio ?: Date;
//   fechaFin?: Date;
//   dfmovimiento?: Date;
// }

export interface filtroFechas {
  dfmovimientoDesc: Date;
  dfmovimientoValue: Date;
}

export class listCorreosResults  {
  NIDDEV : number =  null;
  SCUENTACLIENTE : string=  '';
  SCLIENAME : string=  '';
  SCORREOCLI : string=  '';
  SNUMERO_OPERACION : string=  '';
  STRANSFERENCIA : string=  '';
  SDETALLE_CORREO: string=  '';
  IS_SELECT:boolean = false;
}

export class modalCorreoResults{
  INDEX ?:number=null;
  SNUMERO_OPERACION ? : string=  '';
  SDETALLE_CORREO ?: string=  '';
  STRANSFERENCIA ?: boolean= false;
}


export class listPremiumResults  {
  COMPROBANTE: string=  '';
  DEFFECDATE: Date=  null;
  DDESDE: Date=  null;
  DEXPIRDAT: Date=  null;
  EMP_ID: number=  null;
  IMPDEVO: number=  null;
  NAMOUNT: number=  null;
  NBRANCH:number= null;   //pk
  NCERTIF:number= null;
  NEWDEFFECDATE: Date=  null;
  NEWDEXPIRDAT : Date=  null;
  NEWIMPDEVO:number= null;
  NEWPORDEVO:number= null;
  NPOLICY:number= null;
  NPRODUCT:number= null; //pk
  NRECEIPT:number= null;  //pk
  NRECEIPTDEV:number= null;
  NTYPCLIENTDOC:number= null;
  PORDEVO:number= null;
  SCERTYPE:string= '';  //pk
  SCLIENAME:string= '';
  SCLIENT:string= '';
  SCLINUMDOCU:string= '';
  SDES_BRANCH:string= '';
  SDES_COMPRO:string= '';
  SDES_DOCIDE:string= '';
  SDES_MONEDA:string= '';
  SDES_PRODMAST:string= '';
  IS_SELECT:boolean = false;
  PK_IMAGINARIO:string= '';

} 


@Component({
  selector: 'app-correo',
  templateUrl: './correo.component.html',
  styleUrls: ['./correo.component.css'],
  providers: [NgbModalConfig, NgbModal],
  
})
export class CorreoComponent implements OnInit {
  filterForm = new FormGroup({
    idBranch : new FormControl(''),
    Parameter : new FormControl(''),
    idProduct: new FormControl(''),
    NPOLICY: new FormControl('') ,
    certificado: new FormControl(''),
    idDocumento: new FormControl(''),
    documento: new FormControl(''),
    idTipCompro: new FormControl(''),
    comprobante: new FormControl(''),
    startDate: new FormControl(''),
    endDate: new FormControl(''),
  });

  selecionadosCarrito:number=0;

  filterFormN: FormGroup;
  filterForm2 = new FormGroup({});
  totalItems = 0;
  currentPage = 1;
  active = 1;
  submitted: boolean = false;

  listToShow: any = [];
  itemsPerPage = 10;
  diaActual = moment(new Date()).toDate();


  selectedRowIds: Set<number> = new Set<number>();//para prueba grilla
  selecRowIds: Set<number> = new Set<number>();//para prueba grilla POPUP 1
  //Llenamos los combos
  ListBranch: any = [];
  ListProduct: any = [];
  ListParameter: any = [];
  ListDocument: any =[];
  ListBills: any =[];
  listComPago: any = [];
  productTypeList: any[] = [];  //Lista de tipos de producto
  ListState: any = [];
  //para tablas
  listPremiumResults: listPremiumResults [] = [];
  listPremiumResultsCarrito: listPremiumResults [] = [];


  listCorreosResults: listCorreosResults [] = [];
  listCorreosResultsCarrito: listCorreosResults [] = [];

  modalCorreoResults:modalCorreoResults;

  filtroFechas: filtroFechas[] = [];


  // envioFechas:envioFechas;

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
    {value: true, id:"Aceptado"},
    {value: false, id:"Rechazado"},
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
    // this.modalCorreoResults={};
    this.diaActual = new Date(this.diaActual.getFullYear(), this.diaActual.getMonth(), this.diaActual.getDate()); // DGC 09/06/2023
    this.createForm();
    this.initializeForm();
  }

  private createForm(): void {
    this.filterFormN = this.formBuilder.group({
      dfmovimiento:  [null],
      fechaInicio: [moment(this.diaActual).format('YYYY-MM-DD'), [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]],
      fechaFin: [moment(this.diaActual).format('YYYY-MM-DD'), [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]]
    });
  }

  initializeForm(){
    this.modalCorreoResults={};
    this.filterFormN.setValidators([GlobalValidators.dateSortE]);
  }

  buscarFechas(): void {

    this.filtroFechas=[];
    this.listToShow={};
    this.listCorreosResults=[];

    console.log("🚀 ~ file: correo.component.ts ~ line 161 ~ CorreoComponent ~ buscarFechas ~ this.envioFechas", this.filterFormN.value)
    
    this.submitted = true;
    if (this.filterFormN.valid) { 
      this.DevolucionesService.busquedaFechasCorreo(this.filterFormN.value).subscribe(
        res => { 
          console.log("🚀 ~ file: devolucion.component.ts ~ line 55 ~ DevolucionComponent ~ ngOnInit ~ res", res.Result.Lista)  
  /*         for(let i=0;i<res.Result.Lista.length;i++){

            res.Result.Lista[i].dfmovimientoDesc= res.Result.Lista[i].dfmovimientoDesc.replace('T', ' ');
          } */
          this.filtroFechas=res.Result.Lista;
          console.log("🚀 ~ file: correo.component.ts ~ line 174 ~ CorreoComponent ~ buscarFechas ~ this.filtroFechas", this.filtroFechas)
          // this.filterForm.controls.dfmovimiento=null;
          this.filterFormN.controls.dfmovimiento.setValue(null);

          //this.horaFechaEnvio();
          /* this.ListBranch = res; */ 
      /*  this.filtroMotivoDev=res.Result.Combos;*/ 
      },
        err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los ramos', 'error'); }
      )
    }
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
  err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los ramos', 'error'); }
)
}

mostrarModal(content:any,modal:any,indice:any){
  console.log("🚀 ~ file: correo.component.ts ~ line 220 ~ CorreoComponent ~ mostrarModal ~ modal", modal)
  console.log("🚀 ~ file: correo.component.ts ~ line 220 ~ CorreoComponent ~ mostrarModal ~ modal", indice)

  if(modal.STRANSFERENCIA==""){
    this.modalCorreoResults.INDEX=indice;
    this.modalCorreoResults.STRANSFERENCIA=true;
  }
  else{

    if(modal.STRANSFERENCIA==1){
      this.modalCorreoResults.STRANSFERENCIA=true;
    }
    else{
      this.modalCorreoResults.STRANSFERENCIA=false;
    }
    this.modalCorreoResults.INDEX=indice;
    this.modalCorreoResults.SNUMERO_OPERACION=modal.SNUMERO_OPERACION;
    this.modalCorreoResults.SDETALLE_CORREO=modal.SDETALLE_CORREO;
  }

  console.log("🚀 ~ file: correo.component.ts ~ line 252 ~ CorreoComponent ~ mostrarModal ~ this.modalCorreoResults", this.modalCorreoResults)
   


  this.modalService.open(content,{ size: 'lg',ariaLabelledBy: 'modal-basic-title' ,centered: true});
}
modalAceptar(){
  console.log("🚀 ~ file: modalCorreoResults", this.modalCorreoResults)
  console.log("🚀 ~ file: modalCorreoResults", this.listToShow)
  
  
  if(this.modalCorreoResults.STRANSFERENCIA==true){
    this.listToShow[this.modalCorreoResults.INDEX].STRANSFERENCIA=1;
    this.listToShow[this.modalCorreoResults.INDEX].SNUMERO_OPERACION=this.modalCorreoResults.SNUMERO_OPERACION;
    this.listToShow[this.modalCorreoResults.INDEX].IS_SELECT=true;
    this.listCorreosResultsCarrito.push(this.listToShow[this.modalCorreoResults.INDEX]);
    this.listToShow.splice(this.modalCorreoResults.INDEX,1); 
    this.modalService.dismissAll();
    this.selecionadosCarrito=this.listCorreosResultsCarrito.length;
    this.modalCorreoResults={};
  }
  else{
    if(this.modalCorreoResults.STRANSFERENCIA==false){
      this.listToShow[this.modalCorreoResults.INDEX].STRANSFERENCIA=2;
      this.listToShow[this.modalCorreoResults.INDEX].SDETALLE_CORREO=this.modalCorreoResults.SDETALLE_CORREO;
      this.listToShow[this.modalCorreoResults.INDEX].IS_SELECT=true;
      this.listCorreosResultsCarrito.push(this.listToShow[this.modalCorreoResults.INDEX]);
      this.listToShow.splice(this.modalCorreoResults.INDEX,1); 
      this.modalService.dismissAll();
      this.selecionadosCarrito=this.listCorreosResultsCarrito.length;
      this.modalCorreoResults={};
    }
    else{
      console.log("salio mal algo");
    }
  }

  

  console.log("🚀 ~ file: correo.component.ts ~ line 283 ~ CorreoComponent ~ modalAceptar ~ this.listCorreosResultsCarrito", this.listCorreosResultsCarrito)

}
modalCancelar(){
  this.modalCorreoResults={};
  this.modalService.dismissAll();
}

onRowClick(id: number,gri1:any) {
  this.listToShow.push(this.listCorreosResultsCarrito[id]);
  this.listCorreosResultsCarrito.splice(id,1); 
  this.selecionadosCarrito=this.listPremiumResultsCarrito.length;
  }

  enviarCorreos(){

    Swal.fire(
      {
      title: '¿Está seguro de enviar el correo?',  
      showCancelButton: true,
    }).then((result) => {  
      if (result.value) {  
        this.spinner.show();
        console.log("🚀 ~ file: correo.component.ts ~ line 318 ~ CorreoComponent ~ enviarCorreos ~ this.listCorreosResultsCarrito", this.listCorreosResultsCarrito)

        console.log("🚀 ~ file: correo.component.ts ~ line 333 ~ CorreoComponent ~ enviarCorreos ~ this.listCorreosResultsCarrito.length", this.listCorreosResultsCarrito.length)

        for (let i=0;i<this.listCorreosResultsCarrito.length;i++)
        
   
        {
          let data={
            P_NIDDEV:this.listCorreosResultsCarrito[i].NIDDEV,
            P_SDETALLE_CORREO:this.listCorreosResultsCarrito[i].SDETALLE_CORREO,
            P_STRANSFERENCIA:this.listCorreosResultsCarrito[i].STRANSFERENCIA,
            P_SNUMERO_OPERACION:this.listCorreosResultsCarrito[i].SNUMERO_OPERACION,
            C_CORREO:this.listCorreosResultsCarrito[i].SCORREOCLI,
            C_NOMBRECLIENTE:this.listCorreosResultsCarrito[i].SCLIENAME,
            C_NUMEROCUENTA:this.listCorreosResultsCarrito[i].SCUENTACLIENTE
          };
          this.DevolucionesService.enviarCorreo(data).subscribe(
            res => { 
              console.log("🚀 ~ file: correo.component.ts ~ line 331 ~ CorreoComponent ~ enviarCorreos ~ res", res)     
              console.log("🚀 ~ file: correo.component.ts ~ line 335 ~ CorreoComponent ~ enviarCorreos ~ i", i)
              if(i==this.listCorreosResultsCarrito.length-1){
                //SE CULMINO EL ENVIO DE CORREOS
              this.listCorreosResultsCarrito = [];
              this.selecionadosCarrito=0;
              Swal.fire('Información', 'Se realizó con éxito el envío de correos.', 'success'); 
              this.buscarFechas();
              this.spinner.hide();
              }
            },
            err => { Swal.fire('Información', 'Ha ocurrido un error al obetener los ramos.', 'error'); 
            this.spinner.hide();
          }
          )

        }
        
      }    
    });



  } 
transferencia(){
if(this.modalCorreoResults.STRANSFERENCIA==true){
  this.modalCorreoResults.SDETALLE_CORREO="";
}else{
  this.modalCorreoResults.SNUMERO_OPERACION="";
}
}

 msgError(msg){
  Swal.fire({title: "Información",text: msg,icon: "error",allowOutsideClick: true,heightAuto: false})  
 }
 validacionBusqueda(){
    //VALIDACIONES
    console.log("1");
    //CASO UNO CUANDO SELECCIONA ALGUN TIPO DE DOCUMENTO ,TIENE QUE DIGITAR EL DOCUMENTO SELECCIONADO
    if(this.filterForm.value.idDocumento == null || this.filterForm.value.idDocumento == 0  ){
       //CASO DOS CUANDO SELECCIONE ALGUN RAMO O MASIVO O TIPO PRODUCTO O POLIZA ,SE TIENEN QUE LLENAR LOS 4 
     if(this.filterForm.value.idBranch == null || this.filterForm.value.idBranch == 0  ){
      this.msgError("Debe de ingresar el Ramo");  return false;
     }
     else{
      //CASO CUANDO SELECCIONAS DENTRO DE RAMO ALGUN MASIVO
      if(this.filterForm.value.idBranch == "999"){
        if(this.filterForm.value.Parameter == null || this.filterForm.value.Parameter == 0  ){
          this.msgError("Debe de ingresar el Masivo");  return false;
        }
        else{
          if(this.filterForm.value.idProduct == null || this.filterForm.value.idProduct == 0  ){
            this.msgError("Debe de ingresar el Producto");  return false;
          }
          else{
            if(this.filterForm.value.NPOLICY == null || this.filterForm.value.NPOLICY == 0  ){
              this.msgError("Debe de ingresar la Póliza");  return false;
            }
            else{
                return true;
            } 
          }
        }
      }
      else{
        if(this.filterForm.value.idProduct == null || this.filterForm.value.idProduct == 0  ){
          this.msgError("Debe de ingresar el Producto");  return false;
        }
        else{
          if(this.filterForm.value.NPOLICY == null || this.filterForm.value.NPOLICY == 0  ){
            this.msgError("Debe de ingresar la Póliza");  return false;
          }
          else{
              return true;
          } 
        }
      }
    }
  }
  else{
    if(this.filterForm.value.documento == null || this.filterForm.value.documento == 0  ){
      this.msgError("Debe de ingresar el numero del Documento");  return false;
    }
    else{
      return true;
    }
  }
 }

  searchNC(){
    this.spinner.show();
  //VALIDACIONES DE FORMA
    if(this.validacionBusqueda()==true){
      this.listPremiumDev() 
    }
    else{
      this.spinner.hide();
    }
  }

   // busca y lista los recibos para devolver
   listPremiumDev(){
    
    const data = {
      NBRANCH: null,
      NPRODUCT: this.filterForm.value.idProduct,
      NPOLICY: this.filterForm.value.NPOLICY,
      NCERTIF: null,
      COMPROBANTE: null,
      idTipCompro: null,
      SCLINUMDOCU: null,
      //NCERTIF: this.filterForm.value.certificado,
      DEFFECDATE: this.filterForm.value.startDate,
      DEXPIRDAT: this.filterForm.value.endDate,
    };

    console.log(data);
    if (this.filterForm.value.idBranch == '999'){
      data.NBRANCH = this.filterForm.value.Parameter;
    }else {
      data.NBRANCH = this.filterForm.value.idBranch;
    }
    if (this.filterForm.value.certificado == ''){
      data.NCERTIF = -1;
    }else {
      data.NCERTIF = this.filterForm.value.certificado;
    }
    if (this.filterForm.value.documento == ''){
      data.SCLINUMDOCU = '';
    }else {
      data.SCLINUMDOCU = this.filterForm.value.documento;
    }
    if (this.filterForm.value.idTipCompro == ''){
      data.idTipCompro = '';
    }else {
      data.idTipCompro = this.filterForm.value.idTipCompro;
    }
    if (this.filterForm.value.comprobante == ''){
      data.COMPROBANTE = -1;
    }else {
      data.COMPROBANTE = this.filterForm.value.comprobante;
    }
   
    
    this.CreditNoteService.getListPremiumDev(data).subscribe(
      res => {
        console.log(res.PremiumVM);
        console.log(res.MESSAGE);
                //VALIDACION DEL CLIENTE 
                if(res.PremiumVM.length > 0){

                  if(this.listPremiumResultsCarrito.length>0){

                      if(this.listPremiumResultsCarrito[0].SCLIENT==res.PremiumVM[0].SCLIENT)
                      {    

                          this.listPremiumResults = res.PremiumVM;
                        this.totalItems = res.PremiumVM.length;
                        this.listToShow = this.listPremiumResults.slice(
                          (this.currentPage - 1) * this.itemsPerPage,
                          this.currentPage * this.itemsPerPage
                        );

                           for(let i=0;i<this.listPremiumResults.length;i++){
                            this.listPremiumResults[i].PK_IMAGINARIO=
                            this.listPremiumResults[i].NBRANCH+"-"+
                            this.listPremiumResults[i].NPRODUCT+"-"+
                            this.listPremiumResults[i].NRECEIPT+"-"+
                            this.listPremiumResults[i].SCERTYPE;
                                for(let j=0;j<this.listPremiumResultsCarrito.length;j++){
                                  if(this.listPremiumResultsCarrito[j].PK_IMAGINARIO==this.listPremiumResults[i].PK_IMAGINARIO){           
                                    this.listPremiumResults[i].IS_SELECT= true      
                                  }
                              }
                          }        
                             console.log("PRIMERA GRILLA",this.listPremiumResults); 
                             this.isLoading = false;
                      }
                      else{
                        this.msgError("POR FAVOR NO CAMBIAR DE CLIENTE");
                      }
                  }
                  else{
                       this.listPremiumResults = res.PremiumVM;
                        this.totalItems = res.PremiumVM.length;
                        this.listToShow = this.listPremiumResults.slice(
                          (this.currentPage - 1) * this.itemsPerPage,
                          this.currentPage * this.itemsPerPage
                        );
     

                        for(let i=0;i<this.listPremiumResults.length;i++){
                        this.listPremiumResults[i].PK_IMAGINARIO=
                        this.listPremiumResults[i].NBRANCH+"-"+
                        this.listPremiumResults[i].NPRODUCT+"-"+
                        this.listPremiumResults[i].NRECEIPT+"-"+
                        this.listPremiumResults[i].SCERTYPE;
                            for(let j=0;j<this.listPremiumResultsCarrito.length;j++){
                              if(this.listPremiumResultsCarrito[j].PK_IMAGINARIO==this.listPremiumResults[i].PK_IMAGINARIO){
        
                                this.listPremiumResults[i].IS_SELECT= true;
        
                              }
                          }
                      }        
                          console.log("PRIMERA GRILLA",this.listPremiumResults); 
                          this.isLoading = false;
                  }

                  this.spinner.hide(); 
                } 
                else{
                  this.spinner.hide(); 
                  this.msgError(res.MESSAGE); 
                }  
                     
            },
      err => {
               // this.isLoading = false;
               this.spinner.hide();
            }
    );

  }

  //devuelve la lista seleccionada para realizar los calculos de prima  y prorrateo - grilla2
  listaReciDev(content){

    console.log("content",content);


    const data = this.listPremiumResults.filter(x => x.IS_SELECT==true) 
    //const data = this.listPremiumResults

   
    
    this.CreditNoteService.getListReciDev(data).subscribe(
      res => {
        console.log (res)
        if(res.PremiumVM.length>0){
          this.listReciDev = res.PremiumVM;

          for(let i = 0; i < this.listReciDev.length; i++){
            this.listReciDev[i].DDESDE= new Date(this.listReciDev[i].DDESDE);
            var day = ("0" + this.listReciDev[i].DDESDE.getDate()).slice(-2);
            var month = ("0" + (this.listReciDev[i].DDESDE.getMonth() + 1)).slice(-2);     
            this.listReciDev[i].DDESDE = this.listReciDev[i].DDESDE.getFullYear()+"-"+(month)+"-"+(day) ;
            this.listReciDev[i].TOTAL=this.listReciDev.length;
          }

          console.log("🚀 ~ file: creditNote.component.ts ~ line 342 ~ CreditNoteComponent ~ listaReciDev ~ this.listReciDev", this.listReciDev)

          //this.isLoading = false;
          this.modalService.open(content,{ size: 'xl' });
        
        }
        else{
          this.msgError(res.MESSAGE); 
        }
                
            },
      err => {
               // this.isLoading = false;
            }
    );
    
  }

  getProoduct(isSelected, product){
    console.log(isSelected, product.SCLIENAME)
  }


  detReciDev(content2){
    Swal.fire(
      {
      title: '¿Está seguro de realizar la devolución?',  
      showCancelButton: true,
    }).then((result) => {  
      if (result.value) {  
        this.spinner.show();
        console.log(this.listReciDev.filter(x => this.selecRowIds.has(x.NRECEIPT)))
        const data = this.listReciDev
    
        this.CreditNoteService.getListDetRecDev(data).subscribe(
          res => {
                    console.log(res)    
                    if(res.PremiumVM.length>0){
                      this.listDetRecDev = res.PremiumVM;
                      this.modalService.open(content2,{ size: 'xl' });
                     
                    }
                    else{
                      this.msgError(res.MESSAGE);
                    }
                    this.spinner.hide();
                },
          err => {
            this.spinner.hide();
                }
        );
      }    
    });
    
  }

  //checkIfAllSelected() {
   // this.listPremiumResults.every(function (item: Payroll) { return item.selected === true; });
  //}

  public selectUsers(event: any, listPremiumResults: any) {
    listPremiumResults.flag = !listPremiumResults.flag;
    console.log(listPremiumResults)
   }
   Pruebas()
  { 

 

    let prueba = [];


 /*    console.log("pruebas unitarias",prueba[0].nbranch);
    console.log("pruebas unitarias",prueba[1].nbranch); */

     for(let i=0 ;i < 20; i++){

      let ELEMENTOUNICO =(i+1)+"-"+(i+2)+"-"+"ELEMENTOUNICO";

      const data = {
        NBRANCH:       i,
        NPRODUCT:      i+1,
        NPOLICY:       i+2,
        NCERTIF:       i+9,
        DEFFECDATE:    new Date(),
        DEXPIRDAT:     new Date(),
        ELEMENTOUNICO: ELEMENTOUNICO
      };

        prueba.push(data);

        // CREAR UN IDENTIFICADOR UNICO PARA QUE AL MOMENTO DE HACER UN DELETE SEA MAS RAPIDO


        

       /*  this.CreditNoteService.pruebas(data).subscribe(
          res => {
            if(i==19){
                console.log("llegue",res);
  
            }
                }
        ); */

      }

      for(let i=0 ;i < prueba.length ; i++){
              if(prueba[i].ELEMENTOUNICO=="14-15-ELEMENTOUNICO")
              { 


                console.log("lo encontre",prueba[i].ELEMENTOUNICO); 
                prueba.splice(i,1);
              
              }
      }

 
       console.log("pruebas unitarias",prueba); 

      // es el indice el primer item y el 1 es la cantidad hacia arriba que debe eliminar
       
     


       console.log("pruebas unitarias",prueba); 


      
    } 

  rowIsSelected(id: number) {
    return this.selectedRowIds.has(id);
    console.log(id)
  }
  //capturador de eventos grilla 1 de recibos 
  
  //capturador de eventos grilla popup 1 y realiza calculos
  onRowClic2(filaResi:any,indice:number) {
  console.log("🚀 ~ file: creditNote.component.ts ~ line 499 ~ CreditNoteComponent ~ onRowClic2 ~ filaResi", filaResi)
  /*   console.log(filaResi)
    console.log(filaResi.DEXPIRDAT)
   
    console.log(document.getElementById(filaResi.DEFFECDATE)) */

   /*  for (let num of this.listReciDev)
    {
        if (num.NRECEIPT == filaResi.NRECEIPT)
        {
          console.log(filaResi.IMPDEVO)
        }
    } */

    //CONEXION CON BD 

    
    const data = filaResi;
    
    this.CreditNoteService.getFilaResi(data).subscribe(
      res => {
                console.log(res)        

                this.listDetRecDev = res.PremiumVM;

                  //Formato de fechas
                  this.listDetRecDev[0].DDESDE= new Date(this.listDetRecDev[0].DDESDE);
                  var day = ("0" + this.listDetRecDev[0].DDESDE.getDate()).slice(-2);
                  var month = ("0" + (this.listDetRecDev[0].DDESDE.getMonth() + 1)).slice(-2);           
                  this.listDetRecDev[0].DDESDE = this.listDetRecDev[0].DDESDE.getFullYear()+"-"+(month)+"-"+(day) ;
                  //Formato de fechas

                this.listReciDev[indice]=this.listDetRecDev[0];

                console.log("datos devueltos",this.listDetRecDev)  

                //this.isLoading = false;
                
            },
      err => {
               // this.isLoading = false;
            }
    ); 


  }

  rowIsSelected2(id: number) {
    return this.selecRowIds.has(id);
    console.log(id)
  }

  validarDocumento(evt){
    if(this.filterForm.value.idDocumento==null || this.filterForm.value.idDocumento==undefined || this.filterForm.value.idDocumento=='') {
      this.msgError("Por favor Seleccionar un Tipo de Documento");
      return false;
    }else{
      var code = (evt.which) ? evt.which : evt.keyCode; 
      if(code==8) { // espacios
        return true;
      } else if(code>=48 && code<=57) { // es un numero?
            if(this.filterForm.value.idDocumento==1){
                  if(this.filterForm.value.documento.length==0){
                    if(evt.key== 1 || evt.key== 2){
                      return true;
                    }else{
                      return false;                      
                    }
                  }
                  else{
                    if(this.filterForm.value.documento.length<11){
                      return true;
                    }
                    else{
                      this.msgError("Sobrepaso el limite de 11 numeros");
                      return false;
                    }
                  }
            }
            else{
              if(this.filterForm.value.idDocumento==2){
                if(this.filterForm.value.documento.length<8){
                  return true;
                }
                else{
                  this.msgError("Sobrepaso el limite de 8 numeros");
                  return false;
                }
              }
            }
        
      } else{ // otros.
        this.msgError("Por favor Ingresar solo Numeros");
        return false;
      }
    }
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


   limpiar(){
     this.modalService.dismissAll();
     this.listPremiumResults = [];
     this.listPremiumResultsCarrito= [];
     this.selecionadosCarrito=0;
   

     this.filterForm = new FormGroup({
      idBranch : new FormControl(''),
      Parameter : new FormControl(''),
      idProduct: new FormControl(''),
      NPOLICY: new FormControl('') ,
      certificado: new FormControl(''),
      idDocumento: new FormControl(''),
      documento: new FormControl(''),
      idTipCompro: new FormControl(''),
      comprobante: new FormControl(''),
      startDate: new FormControl(''),
      endDate: new FormControl(''),
    });
     this.ngOnInit();
     
  }
  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.listCorreosResults.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }


}
