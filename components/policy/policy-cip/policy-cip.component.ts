import { Component, OnInit, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AppConfig } from './../../../../../../app/app.config';
import { Router } from '@angular/router';
import { PolicyemitService } from './../../../../../../app/layout/broker/services/policy/policyemit.service';
import { QuotationService } from './../../../services/quotation/quotation.service';
import { CommonMethods } from '../../common-methods';
import { AccPersonalesService } from '../../quote/acc-personales/acc-personales.service';
import { PolicyDataType } from './../../../types/PolicyDataType';
import { AdjuntoInterface, AdjuntoResponse } from '../../../interfaces/Adjunto.Interface';
@Component({
    selector: 'app-policy-cip',
    templateUrl: './policy-cip.component.html',
    styleUrls: ['./policy-cip.component.css']
})
export class PolicyCipComponent implements OnInit {
    @ViewChild('payment')
    content;

    modalRef: BsModalRef;

    contractor: any;
    ref;

    successfullPayment = false;
    loading = true;
    valid = false;
    approve = false;
    flagCipExistente = 0;
    existentecip = false;
    pagadocip = false;
    cipNumber = 0;
    expiradocip = false;
    validMessages: string;
    messages: string[];
    paymentUrl: SafeResourceUrl;
    paymentUrl_Pension: SafeResourceUrl; //AVS - INTERCONEXION SABSA 25/09/2023
    paymentUrl_Salud: SafeResourceUrl; //AVS - INTERCONEXION SABSA 25/09/2023
    policyData = JSON.parse(localStorage.getItem('policydata'));
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
    creditData = JSON.parse(localStorage.getItem('creditdata'));

    desTransaction = '';
    transac = '';
    trxInfo: any = [];
    files: File[] = [];

    CreditDataNC: any;
    cotizacionNC: any;
    CanalNC: any;
    UserID: any; //AVS NC
    FlagPagoNC: any;
    flagBotonNC: any; //AVS NC
    valMixSAPSA: any; //AVS - INTERCONEXION SABSA
    template: any = {}
    epsItem = JSON.parse(localStorage.getItem('eps'))
    dataQuotation = JSON.parse(localStorage.getItem('dataQuotation_EPS_EM'));
    pensionID = JSON.parse(localStorage.getItem('pensionID'));
    constructor(
        private readonly modalService: BsModalService,
        private readonly sanitizer: DomSanitizer,
        private quotationService: QuotationService,
        private policyemit: PolicyemitService,
        private accPersonalesService: AccPersonalesService,
        private readonly router: Router
    ) { }

    async ngOnInit() {
        // Configuracion del Template
        this.template = await CommonMethods.configuracionTemplate(this.codProducto, this.epsItem?.NCODE || '1') //AVS - INTERCONEXION SABSA

        if (this.policyData != null) {
            const transacItem = CommonMethods.desTransaction(this.policyData.transaccion);
            this.desTransaction = transacItem.desTransaction;
            this.transac = CommonMethods.textFormat(transacItem.transac);

            this.valMixSAPSA = this.policyData.savedPolicyList?.[0]?.P_NCOT_MIXTA ?? this.policyData.savedPolicyList?.P_NCOT_MIXTA ?? 0; //AVS - INTERCONEXION SABSA

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

                var request = { //AVS Nota de Credito se cambia const por var
                    quotation: this.policyData.dataCIP.quotationNumber,
                    codBranch: this.policyData.dataCIP.ramo,
                    premium: this.policyData.dataCIP.monto
                };

                this.FlagPagoNC = JSON.parse(localStorage.getItem('creditdata'));//AVS - PROY NC
                this.flagBotonNC = JSON.parse(localStorage.getItem('botonNC'));//AVS - PROY NC

                if ((this.codProducto == 3 || this.codProducto == 6 || this.codProducto == 8) && this.FlagPagoNC != null && this.flagBotonNC == true) {
                    var premiumFixCred = await this.totalPremiumCred(request); //AVS Nota de Credito

                    if (premiumFixCred.codError == 0) {
                        this.policyData.dataCIP.monto = premiumFixCred.premium;
                        await this.generateCipNC();
                    } else {
                        this.loading = false;
                        const res = {
                            existo: false,
                            mensaje: 'PRIMAFIX_ERROR'
                        };
                        this.verifyError(res);
                    }

                } else {
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
            });

        return response;
    }

    async totalPremiumCred(request: any) {
        var response: any = {};
        await this.policyemit.totalPremiumCred(request).toPromise().then(
            async res => {
                response = res;
            }, error => {
                response = {
                    codError: 1,
                    desError: '',
                    premium: 0
                }
            });
        return response;
    }

  async generateCip() {
    let mixta = this.policyData.savedPolicyList[0]?.P_NCOT_MIXTA ?? this.policyData.savedPolicyList?.P_NCOT_MIXTA; //AVS - INTERCONEXION SABSA
    const dataCIP = new FormData();
    let data: any = {}

    if (!!this.policyData.actualizarCotizacion) {
      data.actualizarCotizacion = this.policyData.actualizarCotizacion;
      data.actualizarCotizacion.FlagCIP = 1;
      data.actualizarCotizacion.origen = 'pasarela';
    }
    data.token            = this.currentUser.token;
    data.savedPolicyList  = JSON.stringify(this.policyData.savedPolicyList);
    data.dataCIPBM        = this.policyData.dataCIP;
    data.userCode         = this.policyData.dataCIP.codUser;
    data.idProcess        = this.policyData.dataCIP.ExternalId;
    data.idProcess_EPS    = mixta == 1 && Number(this.epsItem?.NCODE || '1') == 3 ? this.policyData.dataCIP.ExternalId_EPS : null; //AVS - INTERCONEXION SABSA
    data.quotationNumber  = this.policyData.dataCIP.quotationNumber;
    data.typeTransaction  = this.policyData.transaccion;
    data.flagRelanzarCip  = 0; //AVS - INTERCONEXION SABSA
    data.jsonLnk          = JSON.stringify(!!this.policyData.emisionMapfre || null);

    if (this.policyData.adjuntos != null) {
      for (let file of this.policyData.adjuntos) {
        let adjunto = await this.GetAdjuntoBase64(file)
        dataCIP.append(adjunto.name, adjunto, adjunto.name);
        console.log(adjunto);
      }
    }

    dataCIP.append('dataTransaccionesPD', JSON.stringify(data));
    await this.policyemit.GenerateCipPD(dataCIP).toPromise().then(
        async res => {
          this.loading = false;
          this.valid = res.valid;
          this.approve = res.approve;
          if (res.P_COD_ERR == 0) {
            if (this.codProducto == 2) {
                this.getModal_EPS(res.data); //AVS - INTERCONEXION SABSA
            } else {
                this.getModal(res.cipResponse);
            }
          } else {
            if (!!res.cipResponse) {
              res.mensaje = 'PEFECTIVO_ERROR';
              this.verifyError(res.cipResponse);
            }
          }
        console.log(res);
        }
        , error => {
              if (error.status !== 200) {
                this.loading = false;
                const res: any = {};
                res.existo = false;
                res.mensaje = 'PEFECTIVO_ERROR';
                this.verifyError(res.cipResponse);
              }
          }
    );
  }

    async generateCipNC() {
        await this.policyemit.generateCIPNC(this.policyData.dataCIP, this.currentUser.token).toPromise().then(
            async res => {
                if (res.exito) {
                    if (!!this.policyData.actualizarCotizacion) {
                        localStorage.setItem('CodPay', JSON.stringify(res.cipNumero)); //AVS Nota de Credit 23/01/2023
                        await this.InsertPFNC(); //AVS Nota de credito 
                        await this.actualizarCotizacion(res);
                    } else {
                        localStorage.setItem('CodPay', JSON.stringify(res.cipNumero)); //AVS Nota de Credit 23/01/2023
                        await this.InsertPFNC(); //AVS Nota de credito 
                        await this.transactionPolicy(res);
                    }
                } else {
                    this.verifyError(res);
                }
            }, error => {
                if (error.status !== 200) {
                    this.loading = false;
                    const res: any = {};
                    res.existo = false;
                    res.mensaje = 'PEFECTIVO_ERROR';
                    this.verifyError(res);
                }

            });
    }


    async transactionPolicy(pdf) {
        const dataPrePayment = await this.dataPrePayment();
        await this.policyemit.insertPrePayment(dataPrePayment).toPromise().then(
            async res => {
                if (res.P_COD_ERR == '0') {
                    this.loading = false;
                    this.valid = true;
                    this.approve = true;
                    this.getModal(pdf);
                } else {
                    this.loading = false;
                    this.valid = true;
                    this.approve = false;
                }

            });
    }

    async actualizarCotizacion(paramsCip) {
        const params = new FormData();

        if (this.policyData.adjuntos != null) {
            this.policyData.adjuntos.forEach(function (file) {
                params.append(file.name, file, file.name);
            });
        }

        this.policyData.actualizarCotizacion.FlagCIP = 1;
        this.policyData.actualizarCotizacion.origen = 'pasarela';
        params.append('statusChangeData', JSON.stringify(this.policyData.actualizarCotizacion));

        this.quotationService.changeStatusVL(params).subscribe(
            async res => {
                if (res.StatusCode == 0) {
                    await this.policyemit.getPolicyEmitCab(
                        this.policyData.dataCIP.quotationNumber, '1',
                        JSON.parse(localStorage.getItem('currentUser'))['id']
                    ).toPromise().then(async (resCab: any) => {
                        if (resCab.GenericResponse.COD_ERR == '0') {
                            if (this.policyData.transaccion == 1) {
                                this.policyData.savedPolicyList.forEach(item => {
                                    item.P_NID_PROC = resCab.GenericResponse.NID_PROC;
                                    item.P_SCOLTIMRE = resCab.GenericResponse.TIP_RENOV;
                                    item.P_NPAYFREQ = resCab.GenericResponse.FREQ_PAGO;
                                    // item.P_SCOMMENT = item.P_DSTARTDATE !=
                                    //   CommonMethods.formatDate(new Date(resCab.GenericResponse.EFECTO_COTIZACION_VL)) ?
                                    //   'Se ha modificado el inicio de vigencia: Antes = ' +
                                    //   CommonMethods.formatDate(new Date(resCab.GenericResponse.EFECTO_COTIZACION_VL)) +
                                    //   '.Ahora = ' + item.P_DEXPIRDAT : '';
                                    item.P_NIDPAYMENT = 0;
                                });
                            } else {
                                this.policyData.savedPolicyList.P_NIDPAYMENT = 0;
                                this.policyData.savedPolicyList.P_NID_PROC = resCab.GenericResponse.NID_PROC;
                                this.policyData.savedPolicyList.P_SCOLTIMRE = resCab.GenericResponse.TIP_RENOV;
                                this.policyData.savedPolicyList.P_NPAYFREQ = resCab.GenericResponse.FREQ_PAGO;
                                /* this.policyData.savedPolicyList.P_SCOMMENT =  this.codProducto == 3 ? this.policyData.savedPolicyList.P_DSTARTDATE !=
                                  CommonMethods.formatDate(new Date(resCab.GenericResponse.EFECTO_COTIZACION_VL)) ?
                                  'Se ha modificado el inicio de vigencia: Antes = ' +
                                  CommonMethods.formatDate(new Date(resCab.GenericResponse.EFECTO_COTIZACION_VL)) +
                                  '.Ahora = ' + this.policyData.savedPolicyList.P_DEXPIRDAT : '' : '';*/
                            }
                            this.policyData.dataCIP.ExternalId = resCab.GenericResponse.NID_PROC;
                        }

                    });

                    console.log(this.policyData);
                    await this.transactionPolicy(paramsCip);
                }
            });
    }

    async dataPrePayment() {
        const data: any = {};
        data.idProcess = this.policyData.dataCIP.ExternalId;
        data.quotationNumber = this.policyData.dataCIP.quotationNumber;
        data.typeTransaction = this.policyData.transaccion;
        if (this.policyData.transaccion == 1) {
            this.policyData.savedPolicyList.forEach(item => {
                item.P_NIDPAYMENT = 0;
            });
        } else {
            this.policyData.savedPolicyList.P_NIDPAYMENT = 0;
        }
        data.jsonPrt = JSON.stringify(this.policyData.savedPolicyList);
        data.jsonLnk = JSON.stringify(!!this.policyData.emisionMapfre || null);
        data.userCode = this.policyData.dataCIP.codUser;
        return data;
    }

    verifyError(response: any) {
        if (response.mensaje === 'EMISION_VALIDATON') {
            this.valid = false;
            this.approve = true;
            // this.validMessages = response.errorDesc.toString().substr(1);
            // this.messages = this.validMessages.split('|');
        }

        if (response.mensaje === 'PEFECTIVO_ERROR') {
            this.valid = true;
            this.approve = false;
            // this.validMessages = response.errorDesc;
        }

        if (response.mensaje === 'PRIMAFIX_ERROR') {
            this.valid = false;
            this.approve = false;
            // this.validMessages = response.errorDesc;
        }
    }

    getModal(response: any) {
        const modalConfig = { //AVS - INTERCONEXION SABSA
            class: 'custom-modal-width',
            animated: true,
        };

        this.paymentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(response.uri);
        this.modalRef = this.modalService.show(this.content);
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
                        if (this.codProducto == 2) { //AVS - INTERCONEXION SABSA - 17/01/2023
                            this.router.navigate(['/extranet/sctr/consulta-polizas']);
                        } else {
                            this.router.navigate(['/extranet/policy-transactions']);
                        }
                    } else {
                        if (this.codProducto == 2) { //AVS - INTERCONEXION SABSA - 17/01/2023
                            this.router.navigate(['/extranet/sctr/consulta-polizas']);
                        } else {
                            this.router.navigate(['/extranet/policy-transactions']);
                        }
                    }
                }
            }
        } else {
            if (this.policyData.flagTramite == 1) {
                this.router.navigate(['/extranet/transact-evaluation']);
            } else {
                if (!!this.policyData.urlVolver) {
                    this.router.navigate([this.policyData.urlVolver]);
                } else {
                    if (transaccion == 1) {
                        if (this.codProducto == 2) { //AVS - INTERCONEXION SABSA - 17/01/2023
                            this.router.navigate(['/extranet/sctr/poliza/emitir'], { queryParams: { quotationNumber: this.policyData.dataCIP.quotationNumber } });
                        } else {
                            this.router.navigate(['/extranet/policy/emit'], { queryParams: { quotationNumber: this.policyData.dataCIP.quotationNumber } });
                        }
                    }
                    if (transaccion == 2) {
                        if (this.codProducto == 2) { //AVS - INTERCONEXION SABSA - 17/01/2023
                            this.router.navigate(['/extranet/sctr/poliza/transaccion/include'], { queryParams: { nroCotizacion: this.policyData.dataCIP.quotationNumber } });
                        } else {
                            // tslint:disable-next-line:max-line-length
                            this.router.navigate(['/extranet/policy/transaction/include'], { queryParams: { nroCotizacion: this.policyData.dataCIP.quotationNumber } });
                        }
                    }
                    if (transaccion == 4) {
                        if (this.codProducto == 2) { //AVS - INTERCONEXION SABSA - 17/01/2023
                            this.router.navigate(['/extranet/sctr/poliza/transaccion/renew'], { queryParams: { nroCotizacion: this.policyData.dataCIP.quotationNumber } });
                        } else {
                            // tslint:disable-next-line:max-line-length
                            this.router.navigate(['/extranet/policy/transaction/renew'], { queryParams: { nroCotizacion: this.policyData.dataCIP.quotationNumber } });
                        }
                    }
                }
            }
        }
    }

    // tslint:disable-next-line:use-lifecycle-interface
    ngOnDestroy(): void {
        localStorage.removeItem('policydata');
    }

    InsertPFNC() { //AVS Nota de Credito
        this.CreditDataNC = JSON.parse(localStorage.getItem('creditdata'));
        let CodPay = JSON.parse(localStorage.getItem('CodPay'));
        let NCRollQuotation: any = {};
        NCRollQuotation.ListainsertNCPF = [];

        if (this.transac == CommonMethods.TIPO_TRANSACCION.EMISION) {
            var trans = 'EM';
        } else if (this.transac == CommonMethods.TIPO_TRANSACCION.INCLUSION) {
            var trans = 'IN';
        } else if (this.transac == CommonMethods.TIPO_TRANSACCION.RENOVACION && (this.policyData.savedPolicyList.P_STRAN ?? this.policyData.savedPolicyList[0]?.P_STRAN) != 'DE') {
            var trans = 'RE';
        } else if (this.transac == CommonMethods.TIPO_TRANSACCION.ENDOSO) {
            var trans = 'EN';
        } else {
            var trans = 'DE';
        }


        for (let i = 0; i < this.CreditDataNC.length; i++) {
            const itemNCPF: any = {};
            itemNCPF.P_NIDPAYMENT = Number(CodPay);
            itemNCPF.P_NCURRENCY = Number(this.policyData.monedaId) || Number(this.CreditDataNC[i].moneda) || 1;
            itemNCPF.P_NIDPAYTYPE = this.CreditDataNC[i].forma_pago == 'NC' ? 4 : this.CreditDataNC[i].forma_pago || this.CreditDataNC[i].forma_pago == 'PCP' ? 7 : this.CreditDataNC[i].forma_pago;
            itemNCPF.P_SOPERATION_NUMBER = Number(this.CreditDataNC[i].documento_nc);
            itemNCPF.P_NAMOUNT = Number(this.CreditDataNC[i].monto);
            itemNCPF.P_NID_COTIZACION = this.policyData.savedPolicyList[0]?.P_NID_COTIZACION ?? this.policyData.savedPolicyList.P_NID_COTIZACION;
            itemNCPF.P_CODIGOCANAL = this.policyData.dataCIP.codigoCanal;
            itemNCPF.P_NIDUSER = this.policyData.dataCIP.codUser;
            itemNCPF.P_ESTADO = 1;
            itemNCPF.P_NTYPE_TRANSAC = trans === 'DE' ? 11 : this.policyData.transaccion;
            itemNCPF.P_STRANSAC = trans;

            NCRollQuotation.ListainsertNCPF.push(itemNCPF);
        }

        const myFormData: FormData = new FormData()
        this.files.forEach(file => {
            myFormData.append(file.name, file);
        });

        myFormData.append('NCPF', JSON.stringify(NCRollQuotation));

        this.accPersonalesService.NCParcialPF(myFormData).subscribe();
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

    formatDate(date: Date): string { //AVS - INTERCONEXION SABSA
        let anio = date.getFullYear();
        let mes = date.getMonth() + 1;
        let dia = date.getDate();
        return `${dia}/${mes}/${anio}`;
    }

  getModal_EPS(response: any) { //AVS - INTERCONEXION SABSA
    const modalConfig = {
      class: 'custom-modal-width',
      animated: true,
    };

    if (response.cupones.length > 1) {
        this.paymentUrl_Pension = this.sanitizer.bypassSecurityTrustResourceUrl(response.cupones[0].url);
        this.paymentUrl_Salud = this.sanitizer.bypassSecurityTrustResourceUrl(response.cupones[1].url);
    } else if (response.cupones.length === 1) {
        this.paymentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(response.cupones[0].url);
    }

    this.modalRef = this.modalService.show(this.content);
  }

}