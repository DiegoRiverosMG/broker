import { Component, Input, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ValidateLockReponse } from '@root/layout/broker/interfaces/validate-lock-response';
import { ValidateLockRequest } from '@root/layout/broker/models/collection/validate-lock-request';
import { CobranzasService } from '@root/layout/broker/services/cobranzas/cobranzas.service';
import { ClientInformationService } from '@root/layout/broker/services/shared/client-information.service';
import Swal from 'sweetalert2';
import { PolicyCreateInsuredComponent } from '../policy-create-insured/policy-create-insured.component';
import { PolicyemitService } from '@root/layout/broker/services/policy/policyemit.service';
import { CommonMethods } from '../../common-methods';

@Component({
  selector: 'app-policy-change-user',
  templateUrl: './policy-change-user.component.html',
  styleUrls: ['./policy-change-user.component.css']
})
export class PolicyChangeUserComponent implements OnInit {

  @Input() public user: any;
  @Input() public reference: any;
  @Input() public response: any;
  @Input() public request: any;
  typeDocuments : any[];
  searchInsured : any = {};
  validateLockResponse: ValidateLockReponse = {};
  listInsured : any[] = [];
  insured : any = {};
  exist = true;
  maxlength = 9;
  isLoading = false;
  insuredCreate : any;

  constructor(public clientInformationService : ClientInformationService, private collectionsService: CobranzasService,  private modalService: NgbModal, private policyErmitService: PolicyemitService){
  }
  
  ngOnInit(): void {
    this.searchInsured.P_NIDDOC_TYPE  = "2";
    this.obtenerDocumentos();
  }

  obtenerDocumentos(){
    this.clientInformationService.getDocumentTypeList('').subscribe(
      res => {
        this.typeDocuments = res;
      }
    )
  }

  changeType(){
    this.searchInsured.P_SIDDOC = "";
  }

  textValidate(event:any){
    CommonMethods.validarNroDocumento(event, this.searchInsured.P_NIDDOC_TYPE)
  }

  async search(){

    if(this.searchInsured.P_SIDDOC == "" || this.searchInsured.P_SIDDOC == undefined || this.searchInsured.P_SIDDOC == null){
      Swal.fire('Información','Debe ingresar un nro. de documento','warning');
      return;
    }

    if(this.searchInsured.P_NIDDOC_TYPE == 2){ //DNI
      let validate = CommonMethods.validateDNI(this.searchInsured.P_SIDDOC)
      if(validate){
        Swal.fire('Información','Introduzca un DNI válido', 'warning');
        this.listInsured = [];
        this.insured = {};
        return;
      }
    }

    if(this.searchInsured.P_NIDDOC_TYPE == 4){ //CE
      let validate = CommonMethods.validateCE(this.searchInsured.P_SIDDOC)
      if(validate){
        Swal.fire('Información','Introduzca un CARNET DE EXTRANJERIA válido', 'warning');
        this.listInsured = [];
        this.insured = {};
        return;
      }
    }

    if(this.searchInsured.P_NIDDOC_TYPE == 6){ //PASS
      let validate = CommonMethods.validatePass(this.searchInsured.P_SIDDOC)
      if(validate){
        Swal.fire('Información','Introduzca un PASAPORTE válido', 'warning');
        this.listInsured = [];
        this.insured = {};
        return;
      }
    }


    const data: any = {}
    data.P_TipOper = 'CON';
    data.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
    data.P_NIDDOC_TYPE = this.searchInsured.P_NIDDOC_TYPE != '-1' ? this.searchInsured.P_NIDDOC_TYPE : '';
    data.P_SIDDOC = this.searchInsured.P_SIDDOC.toUpperCase();
    data.P_SFIRSTNAME = '';
    data.P_SLASTNAME = '';
    data.P_SLASTNAME2 = '';
    data.P_SLEGALNAME = '';

    //Validate Lock
    const validateLockReq = new ValidateLockRequest();
    validateLockReq.branchCode = 73;
    validateLockReq.productCode = 1;
    validateLockReq.documentType = this.searchInsured.P_NIDDOC_TYPE;
    validateLockReq.documentNumber = this.searchInsured.P_SIDDOC;
    this.validateLockResponse = await this.getValidateLock(validateLockReq);
    

    if (this.validateLockResponse.lockMark == 1) {
      Swal.fire('Información', this.validateLockResponse.observation, 'error');
      return;
    }
    this.isLoading = true;
    await this.clientInformationService.getCliente360(data).toPromise().then(
      async res => {
        this.listInsured = [];
        this.insured = {};
        this.isLoading = false;
        if (res.EListClient.length > 0) {
          if(res.EListClient[0].P_SCLIENT == null){
            this.insured.P_SIDDOC = this.searchInsured.P_SIDDOC.toUpperCase();
            this.insured.P_NIDDOC_TYPE = this.searchInsured.P_NIDDOC_TYPE;
            this.insured.P_SFIRSTNAME = 'EL ASEGURADO NO EXISTE';
            this.insured.P_DBIRTHDAT = 'NO EXISTE';
            if(this.searchInsured.P_NIDDOC_TYPE == 2){
              this.insured.EListClient = {};
              this.insured.EListClient = res.EListClient[0]
            } 
            this.exist = false;
            this.listInsured.push(this.insured);
          }else{
            this.insured = res.EListClient[0];
            this.exist = true;
            this.listInsured.push(this.insured);
          }
        }else{
          //No existe
          this.insured.P_SIDDOC = this.searchInsured.P_SIDDOC.toUpperCase();
          this.insured.P_NIDDOC_TYPE = this.searchInsured.P_NIDDOC_TYPE;
          this.insured.P_SFIRSTNAME = 'EL ASEGURADO NO EXISTE';
          this.insured.P_DBIRTHDAT = 'NO EXISTE';
          this.exist = false;
          this.listInsured.push(this.insured);
        }
      }
    )

  }


  async getValidateLock(request: ValidateLockRequest): Promise<ValidateLockReponse> {
    this.isLoading = false
    let validateLockRespone: ValidateLockReponse = {};
    await this.collectionsService.validateLock(request).toPromise().then(
      res => {
        this.isLoading = true;
        validateLockRespone = res;
      },
      err => {
        this.isLoading = true;
      }
    );
    return validateLockRespone;
  }

  createInsured(item:any){
    console.log(item);
    
    let modalRef: NgbModalRef;
    modalRef = this.modalService.open(PolicyCreateInsuredComponent, { size: 'lg', windowClass: 'modalCustom', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
    modalRef.componentInstance.reference = modalRef;
    modalRef.componentInstance.insured = item;
    modalRef.componentInstance.documents = this.typeDocuments;
    modalRef.componentInstance.changeUser = this.user;
    modalRef.componentInstance.insuredCreateResult = this.insuredCreate;
    modalRef.result.then(async (res) => {
      if(res != undefined){
        await this.search();
      }
    });
  }

  changeInsured(){

    Swal.fire({
      title: 'Información',
      text: '¿Estas seguro de reemplazar al asegurado?. Se realizará el relanzamiento de documentos.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      allowOutsideClick: false,
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.value) {
        const request: any = {}
        request.nidProc = this.user.nidProc;
        request.sclient = this.user.sclient;
        request.updateSclient = this.insured.P_SCLIENT;
        request.nroDoc = this.insured.P_SIDDOC;
        request.typeDoc = this.insured.P_NIDDOC_TYPE;
        request.npolicy = this.request.npolicy;
        request.nbranch = this.request.NBRANCH,
        request.nproduct = this.request.NPRODUCT,
        request.nidheaderproc = this.request.NIDHEADERPROC,
        request.sruta = this.request.SRUTA,
        request.suser = JSON.parse(localStorage.getItem('currentUser'))['id']
        console.log(request);
        
        this.policyErmitService.updateInsuredPolicy(request).subscribe(
          res => {
            if(res.P_NCODE == 0){
              Swal.fire('Información', 'Se ha realizado la actualización correctamente', 'success').then((value) => {
                this.response = res
                this.reference.close(this.response);
              });
            }else{
              Swal.fire('Información', res.P_SMESSAGE, 'error');
            }
          }
        )
      }
    })
  }

  closeModal(){
    this.reference.close(this.response)
  }

}
