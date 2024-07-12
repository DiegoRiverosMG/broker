import { Component, OnInit, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PolicyemitService } from '../../../services/policy/policyemit.service';
import { AdjuntoInterface, AdjuntoResponse } from '../../../interfaces/Adjunto.Interface';
import { CommonMethods } from '../../common-methods';
import { Router } from '@angular/router';
import swal from 'sweetalert2';

@Component({
  selector: 'app-policy-link',
  templateUrl: './policy-link.component.html',
  styleUrls: ['./policy-link.component.css']
})
export class PolicyLinkComponent implements OnInit {

  @ViewChild('payment')
  content;
  modalRef: BsModalRef;

  /*paymentUrl_Pension: SafeResourceUrl;
  paymentUrl_Salud: SafeResourceUrl;*/
  successfullPayment = false;
  paymentUrl_Pension: string = "";
  paymentUrl_Salud: string = "";
  paymentUrl: string = "";
  loading = true;
  loading_prin = false;
  valid = false;
  approve = false;
  pagadocip = false;
  existentecip = false;
  expiradocip = false;
  flagCipExistente = 0;
  cipNumber: string = "";
  cipNumberPension: string = "";
  cipNumberSalud: string = "";
  flagMixSCTR: any = 1;
  compProducto: string = "";
  compPension: string = "Protecta";
  compSalud: string = "GRANDIA EPS";
  desTipoPago: string = "";
  desMoneda: string = "";
  codPago: string = "";
  desTransaction: string = "";
  transac: string = "";
  idPaymentPEN: any = "";
  idPaymentSAL: any = "";
  cod_pago_PEN: any = "";
  cod_pago_SAL: any = "";
  cod_pago: string = "";
  
  policyData = JSON.parse(localStorage.getItem('policydata'));
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
  epsItem = JSON.parse(localStorage.getItem('eps'));
    
  constructor(
    private readonly modalService: BsModalService,
    private readonly sanitizer: DomSanitizer,
    private policyemit: PolicyemitService,
    private readonly router: Router
  ) { }

  async ngOnInit() {
    if (this.policyData != null) {
        console.log('this.policyData');
        console.log(this.policyData);
        const transacItem = CommonMethods.desTransaction(this.policyData.transaccion);
        this.desTransaction = transacItem.desTransaction;
        this.flagMixSCTR = this.policyData.savedPolicyList?.[0]?.P_NCOT_MIXTA ?? this.policyData.savedPolicyList?.P_NCOT_MIXTA ?? 0;
        this.transac = transacItem.transac;
        
        const data = {
            quotation: this.policyData.dataCIP.quotationNumber,
            nidproc: this.policyData.dataCIP.ExternalId,
            codBranch: this.policyData.dataCIP.ramo,
        };
        
        await this.policyemit.validarCipExistente(data).toPromise().then(
            async res => {
            this.flagCipExistente = res.flagCip;
            this.cipNumber = res.numberOperation;
            }
        );

        if (this.flagCipExistente == 1) {
            this.loading = false;
            this.existentecip = true;
            this.approve = true;
            this.valid = true;
        } else if (this.flagCipExistente == 2) {
            this.loading = false;
            this.pagadocip = true;
            this.approve = true;
            this.valid = true;
        } else if (this.flagCipExistente == 3) {
            this.loading = false;
            this.expiradocip = true;
            this.approve = true;
            this.valid = true;
        } else {
            var request = {
                quotation: this.policyData.dataCIP.quotationNumber,
                codBranch: this.policyData.dataCIP.ramo,
                premium: this.policyData.dataCIP.monto
            };

            var premiumFix = await this.totalPremiumFix(request);

            if (premiumFix.codError == 0) {
                this.policyData.dataCIP.monto = premiumFix.premium;
                await this.generateCip();
            } else {
                this.loading = false;
                const res = {
                    existo: false,
                    mensaje: 'PRIMAFIX_ERROR'
                };
                
                this.verifyError(res);
            }
        }
        
        console.log(this.policyData);
        this.desTipoPago = this.policyData.dataCIP.tipoPago == "3" ? "Transferencia" : "Cash"; 
        this.desMoneda = this.policyData.dataCIP.Moneda == 1 ? "Soles" : "Dólares";

        if(this.flagMixSCTR == 0){
            if(this.policyData.dataCIP.producto == 1){
                this.compProducto = this.compPension;
            }else{
                this.compProducto = this.compSalud;        
            }
        }
        /*
        await this.policyemit.getCodPagoKushki(this.policyData.dataCIP.ramo, , ,).toPromise().then(
            (res: any) =>{
                this.co_pago_PEN = res.
                this.co_pago_PEN = res.
            }
        ); */
    }
  }

  goToMain(value, transaccion) {
    if (value) {
        if (this.policyData.flagTramite == 1) {
            this.router.navigate(['/']);
        } else {
            if (!!this.policyData.urlContinuar) {
                this.router.navigate([this.policyData.urlContinuar]);
            } else {
                if (transaccion == 1) {
                    if (this.codProducto == 2) { 
                        this.router.navigate(['/extranet/sctr/consulta-cotizacion']);
                    }
                } else {
                    if (this.codProducto == 2) { 
                        this.router.navigate(['/extranet/sctr/consulta-polizas']);
                    }
                }
            }
        }
    } 
  }

  async totalPremiumFix(request: any) {
    var response: any = {};
    await this.policyemit.totalPremiumFix(request).toPromise().then(
        async res => {
            response = res;
        }, error => {
            response = {
                codError: 1,
                desError: '',
                premium: 0
            }
        }
    );

    return response;
  }

  descargarPDFProm(producto: string): Promise<void>{
    return new Promise((resolve, reject) => {
        let enlace = "";
        let cupon = "";

        if(this.flagMixSCTR == 1){
            if(producto == "1"){
                enlace = this.paymentUrl_Pension;
                cupon = "cupon_PENSION";
            }else if(producto == "2"){
                enlace = this.paymentUrl_Salud;
                cupon = "cupon_SALUD";
            }
        }else{
            enlace = this.paymentUrl;

            if(this.policyData.dataCIP.producto == 1){
                cupon = "cupon_PENSION";
            }else{
                cupon = "cupon_SALUD";       
            }
        } 
        
        const xhr = new XMLHttpRequest();
        xhr.open('GET', enlace, true);
        xhr.responseType = 'arraybuffer';

        xhr.onload = function (oEvent) {
            const arrayBuffer = xhr.response;
            const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
            const dataUrl = URL.createObjectURL(blob);
        
            var link = document.createElement('a');
            link.href = dataUrl;
            link.download = cupon + '.pdf';
            link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

            setTimeout(function () {
                window.URL.revokeObjectURL(dataUrl);
                link.remove();
                resolve();
            }, 100);
        };

        xhr.onerror = function () {
            reject(new Error('Error al descargar el PDF'));
        };

        xhr.send();
    });
  }

  descargarPDF(producto: string) {
    this.loading_prin = true;

    this.descargarPDFProm(producto).then(() => {
        this.loading_prin = false;
    }).catch(error => {
        this.loading_prin = false;

        swal.fire({
            title: 'Información',
            text: "",
            icon: 'error',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
        })
    });
  }

  openLink(producto: string){
    let enlace = "";

    if(this.flagMixSCTR == 1){
        if(producto == "1"){
            enlace = this.paymentUrl_Pension;
        }else if(producto == "2"){
            enlace = this.paymentUrl_Salud;
        }
    }else{
        enlace = this.paymentUrl;
    }    
    
    window.open(enlace, '_blank');
  }

  copiarLink(producto: string){
    let enlaceACopiar = "";

    if(this.flagMixSCTR == 1){
        if(producto == "1"){
            enlaceACopiar = this.paymentUrl_Pension;
        }else if(producto == "2"){
            enlaceACopiar = this.paymentUrl_Salud;
        }
    }else{
        enlaceACopiar = this.paymentUrl;
    }

    navigator.clipboard.writeText(enlaceACopiar).then(() => {
      //alert('¡Enlace copiado al portapapeles!');
    }, (err) => {
      console.error('Error al copiar enlace: ', err);
    });
  }

  async generateCip() {
    let mixta = this.policyData.savedPolicyList[0]?.P_NCOT_MIXTA ?? this.policyData.savedPolicyList?.P_NCOT_MIXTA;

    const dataCIP = new FormData();
    let data: any = {};

    if (!!this.policyData.actualizarCotizacion) {
        data.actualizarCotizacion = this.policyData.actualizarCotizacion;
        data.actualizarCotizacion.FlagCIP = 1;
        data.actualizarCotizacion.origen = 'pasarela';
    }
    
    data.token              = this.currentUser.token;
    data.savedPolicyList    = JSON.stringify(this.policyData.savedPolicyList);
    data.dataCIPBM          = this.policyData.dataCIP;
    data.userCode           = this.policyData.dataCIP.codUser;
    data.idProcess          = this.policyData.dataCIP.ExternalId;
    data.idProcess_EPS      = mixta == 1 && Number(this.epsItem?.NCODE || '1') == 3 ? this.policyData.dataCIP.ExternalId_EPS : null; 
    data.quotationNumber    = this.policyData.dataCIP.quotationNumber;
    data.typeTransaction    = this.policyData.transaccion;
    data.flagRelanzarCip    = 0; 
    data.jsonLnk            = JSON.stringify(!!this.policyData.emisionMapfre || null);
  
    if (this.policyData.adjuntos != null) {
        for (let file of this.policyData.adjuntos) {
          let adjunto = await this.GetAdjuntoBase64(file)
          dataCIP.append(adjunto.name, adjunto, adjunto.name);
          console.log(adjunto);
        }
    }
    
    dataCIP.append('dataTransaccionesPD', JSON.stringify(data));
    await this.policyemit.GenerateCipKushkiPD(dataCIP).toPromise().then(
        async res => {
            this.loading = false;
            this.valid = res.valid;
            this.approve = res.approve;
            if (res.P_COD_ERR == 0) {
              this.getModal(res.data); 
            } else {
              if (!!res.cipResponse) {
                res.mensaje = 'PKUSHKI_ERROR';
                this.verifyError(res.cipResponse);
              }
            }
            console.log(res);
        }, error => {
            if (error.status !== 200) {
                this.loading = false;
                const res: any = {};
                res.existo = false;
                res.mensaje = 'PKUSHKI_ERROR';
                this.verifyError(res.cipResponse);
            }
        }    
    );    
  }

  verifyError(response: any) {
    if (response.mensaje === 'PKUSHKI_ERROR') {
        this.valid = true;
        this.approve = false;
    }
  }

  async GetAdjuntoBase64(file: any) {
    try {
        let adjunto: AdjuntoInterface = JSON.parse(file);
        let arr = adjunto.base64.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], adjunto.filename, { type: mime });

    } catch (e) {
        console.log(e);
    }
  }

  async getModal(response: any) {
    const modalConfig = { 
        class: 'custom-modal-width',
        animated: true,
    };

    if (response.cupones.length > 1) {
        this.paymentUrl_Pension = response.cupones[0].url;
        this.idPaymentPEN = response.cupones[0].idPayment;
        this.paymentUrl_Salud = response.cupones[1].url;
        this.idPaymentSAL = response.cupones[1].idPayment;        

        await this.policyemit.getCodPagoKushki(this.policyData.dataCIP.ramo, this.idPaymentPEN, this.idPaymentSAL).toPromise().then(
            async res =>{
                this.cod_pago_PEN = res.P_SCOD_PAGO_PEN;
                this.cod_pago_SAL = res.P_SCOD_PAGO_SAL;
            }
        );
    } else if (response.cupones.length === 1) {
        this.paymentUrl = response.cupones[0].url;

        if(this.policyData.dataCIP.producto == 1){
            this.idPaymentPEN = response.cupones[0].idPayment;
            this.idPaymentSAL = 0;
        }else{
            this.idPaymentPEN = 0;
            this.idPaymentSAL = response.cupones[0].idPayment;       
        }

        await this.policyemit.getCodPagoKushki(this.policyData.dataCIP.ramo, this.idPaymentPEN, this.idPaymentSAL).toPromise().then(
            async res =>{
                console.log(res);

                if(this.idPaymentPEN !== 0){
                    this.cod_pago = res.P_SCOD_PAGO_PEN;
                }else{
                    this.cod_pago = res.P_SCOD_PAGO_SAL;
                }
                
            }, error => {
                console.log('Error');
            }
        );

        console.log(this.cod_pago);
    }

    this.modalRef = this.modalService.show(this.content);
  }
  /*
  ngAfterViewInit(): void {
    this.modalRef = this.modalService.show(this.content);
  }*/

}
