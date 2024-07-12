import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Autorizacion } from '../../../../../../app/layout/client/shared/models/autorizacion.model';
import { AppConfig } from '../../../../../app.config';
import { PolicyemitService } from '../../../services/policy/policyemit.service';
import { DomSanitizer } from '@angular/platform-browser';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CommonMethods } from '../../common-methods';
import { EmisionService } from '../../../../client/shared/services/emision.service';
import { QuotationService } from './../../../services/quotation/quotation.service';
import { isNullOrUndefined } from 'util';
import { AccPersonalesService } from '../../quote/acc-personales/acc-personales.service';
import { AdjuntoInterface, AdjuntoResponse } from '../../../interfaces/Adjunto.Interface';
@Component({
    selector: 'app-policy-result',
    templateUrl: './policy-result.component.html',
    styleUrls: ['./policy-result.component.css']
})
export class PolicyResultComponent implements OnInit {
    transactionKey = '';
    content;
    modalRef: BsModalRef;
    auth: any = {};
    monedaItem: any = {};
    validationMessage: string;
    messages: string[];
    files: File[] = [];
    visaPayment;
    enableSubscription = false;
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    policyData = JSON.parse(localStorage.getItem('policydata'));
    pdf = this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
    codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
    pensionNumber: number;
    saludNumber: number;
    vleyNumber: number;
    sctrNumber: number;
    policyNumber: number; // Número de poliza generica para todos los ramos excepto vley y sctr
    constanciaNumber: number;

    loading = true;
    successfullCall = false;
    payment = false;
    successfullPayment = false;
    valid = false;
    approve = false;
    desTransaction = '';
    CreditDataNC: any;
    cotizacionNC: any;
    CanalNC: any;
    UserID: any; //AVS NC
    FlagPagoNC: any;
    flagBotonNC: any; //AVS NC

    constructor(
        private emisionService: EmisionService,
        private route: ActivatedRoute,
        private router: Router,
        private readonly sanitizer: DomSanitizer,
        private appConfig: AppConfig,
        private readonly modalService: BsModalService,
        private quotationService: QuotationService,
        private accPersonalesService: AccPersonalesService,
        private policyemit: PolicyemitService) { }

    async ngOnInit() {
        const transactionKey = this.route.snapshot.paramMap.get('key') || '';
        if (transactionKey !== null) {
            this.transactionKey = transactionKey;
        }

        const transacItem = CommonMethods.desTransaction(this.policyData.transaccion);
        this.desTransaction = transacItem.desTransaction;
        this.monedaItem = CommonMethods.desMoneda(!!this.policyData.monedaId ? this.policyData.monedaId : 1);
        
        if (this.transactionKey !== '') {
            if (this.codProducto != 4) {
                await this.verifyPay();
            }
            else {
                await this.verifyPayNiubiz();
            }

        }
    }

    async verifyPay() {
        const nameClient =
            this.policyData.contractingdata.P_NPERSON_TYP === 1 ?
                this.policyData.contractingdata.P_SFIRSTNAME : this.policyData.contractingdata.P_SLEGALNAME;
        const lastnameClient =
            this.policyData.contractingdata.P_NPERSON_TYP === 1 ?
                this.policyData.contractingdata.P_SLASTNAME + ' ' + this.policyData.contractingdata.P_SLASTNAME2 : '';
        const dataVerify: any = {};
        dataVerify.Id = this.policyData.visaData.idProcess;
        dataVerify.TransactionToken = this.transactionKey;
        dataVerify.SessionToken = this.policyData.visaData.sessionToken;
        dataVerify.Pdf_CustomerName = nameClient + ' ' + lastnameClient;
        dataVerify.Pdf_Email = this.policyData.visaData.email;
        dataVerify.Pdf_PhoneNumber = !!this.policyData.contractingdata.EListPhoneClient ?
            this.policyData.contractingdata.EListPhoneClient.length > 0 ? this.policyData.contractingdata.EListPhoneClient[0].P_SPHONE : '' : '';
        dataVerify.ProcessName = 'VL';

        await this.policyemit.verifyVisa(dataVerify, this.currentUser.token).toPromise().then(
            async res => {
                await this.generateInfo(res);      

                if (res.indProcess === 1) {

                    if (this.codProducto == 2) {
                        let myFormData: FormData = new FormData()
                        myFormData.append('objetoDet', JSON.stringify(JSON.parse(localStorage.getItem('objetoDet'))));
            
                        try {
                            const res: any = await this.policyemit.insertdetTR(myFormData).toPromise();
                        } catch (error) {
                            console.error('Error en insertDetTr:', error);
                            return { P_COD_ERR: 1, P_SMESSAGE: 'Error en insertDetTr' };
                        }
                    }

                    if (!!this.policyData.actualizarCotizacion) {
                        await this.actualizarCotizacion();                       
                    } else {
                        await this.transactionPolicy();
                    }
                } else {
                    await this.dismissPolicy(res);
                }
            }, error => {
                if (error.status !== 200) {
                    this.loading = false;
                    this.valid = false;
                    this.approve = true;
                    this.successfullPayment = false;
                    this.validationMessage = 'Hubo un error al procesar su solicitud (verifyVisa)';
                }
            });
        
            console.log(this.validationMessage);
    }

    async verifyPayNiubiz() {
        const dataVerify: any = {};
        dataVerify.idPayment = this.policyData.niubizData.data.idPayment;
        dataVerify.token = this.transactionKey;

        await this.policyemit.verifyNiubiz(dataVerify, this.currentUser.token).toPromise().then(
            async res => {
                await this.generateInfoNiubiz(res);

                if (res.statusCode === 200) {
                    //await this.actualizarCotizacion();
                    await this.transactionPolicy();           //Desac. Temporal - Para llenado
                }
                /*
                if (res.indProcess === 1) {
                    if (!!this.policyData.actualizarCotizacion) {
                        await this.actualizarCotizacion();
                    } else {
                        await this.transactionPolicy();
                        if (this.codProducto == 2) {
                            if (this.policyData.savedPolicyList.P_NID_COTIZACION != undefined) {
                            }
                        }
                    }
                } else {
                    await this.dismissPolicy(res);
                }
                */
            }, error => {
                if (error.status !== 200) {
                    this.loading = false;
                    this.valid = false;
                    this.approve = true;
                    this.successfullPayment = false;
                    this.validationMessage = 'Hubo un error al procesar su solicitud (verifyVisa)';
                }
            });
    }

    async generateInfo(response) {
        const transacItem = CommonMethods.desTransaction(this.policyData.transaccion);
        this.auth.authorizedAmount = response.authorizedAmount;
        this.auth.cardNumber = response.cardNumber;
        this.auth.orderNumber = response.orderNumber == null ? 0 : response.orderNumber;
        this.auth.transactionDateTime =
            response.transactionDateTime == null ? CommonMethods.formatDate(new Date()) :
                response.transactionDateTime;
        this.auth.fullDate = response.fullDate;
        this.auth.email = response.pdf_Email;
        this.auth.phoneNumber = response.pdf_PhoneNumber;
        this.auth.customerName = response.pdf_CustomerName;
        this.auth.errorMessage = response.errorDesc;
        this.auth.pdf_Id = response.pdf_ID;
        this.auth.desTransaction = transacItem.desTransaction;
        this.auth.transac = CommonMethods.textFormat(transacItem.transac);
        this.auth.description = 'Seguro Protecta Security';
        this.auth.producto = CommonMethods.productoDescripcion(this.codProducto);
    }

    async generateInfoNiubiz(response) {
        const transacItem = CommonMethods.desTransaction(this.policyData.transaccion);
        this.auth.authorizedAmount = response.data.montoAutorizado
        this.auth.cardNumber = response.data.numeroTarjeta;
        this.auth.orderNumber = response.data.idProceso == null ? 0 : response.data.idProceso;
        this.auth.transactionDateTime =
            response.data.transactionDateTime == null ? CommonMethods.formatDate(new Date()) :
                response.data.transactionDateTime;
        this.auth.fullDate = response.data.transactionDateTime;
        this.auth.email = this.policyData.contractingdata.EListEmailClient[0].P_SE_MAIL;
        this.auth.phoneNumber = this.policyData.contractingdata.EListPhoneClient[0].P_SPHONE;
        this.auth.customerName = this.policyData.contractingdata.P_SLEGALNAME;
        this.auth.errorMessage = response.data.message;
        this.auth.pdf_Id = "-";
        this.auth.desTransaction = transacItem.desTransaction;
        this.auth.transac = CommonMethods.textFormat(transacItem.transac);
        this.auth.description = 'Seguro Protecta Security';
        this.auth.producto = CommonMethods.productoDescripcion(this.codProducto);
    }

    async actualizarCotizacion() {
        const params = new FormData();

        if (this.policyData.adjuntos != null) {
            for (let file of this.policyData.adjuntos) {
                let adjunto = await this.GetAdjuntoBase64(file)
                params.append(adjunto.name, adjunto, adjunto.name);
                console.log(adjunto);
            }
        }

        this.policyData.actualizarCotizacion.origen = "pasarela";
        params.append('statusChangeData', JSON.stringify(this.policyData.actualizarCotizacion));

        this.quotationService.changeStatusVL(params).subscribe(
            async res => {
                if (res.StatusCode == 0) {

                    await this.policyemit.getPolicyEmitCab(
                        this.policyData.actualizarCotizacion.QuotationNumber, '1',
                        JSON.parse(localStorage.getItem('currentUser'))['id']
                    ).toPromise().then(async (resCab: any) => {
                        if (this.policyData.transaccion == 1) {
                            this.policyData.savedPolicyList.forEach(item => {
                                item.P_NID_PROC = resCab.GenericResponse.NID_PROC;
                                item.P_SCOLTIMRE = resCab.GenericResponse.TIP_RENOV;
                                item.P_NPAYFREQ = resCab.GenericResponse.FREQ_PAGO;
                                item.P_SCOMMENT = this.codProducto == 3 ? item.P_DSTARTDATE !=
                                    CommonMethods.formatDate(new Date(resCab.GenericResponse.EFECTO_COTIZACION_VL)) ?
                                    'Se ha modificado el inicio de vigencia: Antes = ' +
                                    CommonMethods.formatDate(new Date(resCab.GenericResponse.EFECTO_COTIZACION_VL)) +
                                    '.Ahora = ' + item.P_DEXPIRDAT : '' : '';
                                item.P_NIDPAYMENT = this.policyData.visaData.idProcess;
                                item.P_NPRODUCT = resCab.GenericResponse.NPRODUCT;
                                item.P_NBRANCH = resCab.GenericResponse.NBRANCH;
                            });
                        } else {
                            this.policyData.savedPolicyList.P_NIDPAYMENT = this.policyData.visaData.idProcess;
                            this.policyData.savedPolicyList.P_NID_PROC = resCab.GenericResponse.NID_PROC;
                            this.policyData.savedPolicyList.P_SCOLTIMRE = resCab.GenericResponse.TIP_RENOV;
                            this.policyData.savedPolicyList.P_NPAYFREQ = resCab.GenericResponse.FREQ_PAGO;
                            this.policyData.savedPolicyList.P_SCOMMENT = null;
                            this.policyData.savedPolicyList.P_NPRODUCT = resCab.GenericResponse.NPRODUCT;
                            this.policyData.savedPolicyList.P_NBRANCH = resCab.GenericResponse.NBRANCH;
                        }

                    });

                    console.log(this.policyData.savedPolicyList);

                    await this.transactionPolicy();

                }
            });
    }

    async transactionPolicy() {
        this.successfullPayment = true;
        this.FlagPagoNC = JSON.parse(localStorage.getItem('creditdata'));//AVS - PROY NC
        this.flagBotonNC = JSON.parse(localStorage.getItem('botonNC'));//AVS - PROY NC
        if ((this.codProducto == 3 || this.codProducto == 6 || this.codProducto == 8) && this.FlagPagoNC != null && this.flagBotonNC == true) { //AVS - PROY NC
            this.InsertVisaNC();
        }

        if (this.policyData.transaccion === 1) {           
            await this.emitPolicy();
        }
        else if (this.codProducto == 3 && this.policyData.transaccion === 14) { // emision de certificados VL
            await this.emitCertificatePolicy();
        }
        else {
            await this.createJob();
        }
    }

    async createJob() {
        const myFormData: FormData = new FormData();

        if (this.policyData.adjuntos != null) {
            for (let file of this.policyData.adjuntos) {
                let adjunto = await this.GetAdjuntoBase64(file)
                myFormData.append(adjunto.name, adjunto, adjunto.name);
                console.log(adjunto);
            }
        }

        myFormData.append('transaccionProtecta', JSON.stringify(this.policyData.savedPolicyList));
        myFormData.append('transaccionMapfre', JSON.stringify(!!this.policyData.emisionMapfre || null));

        await this.policyemit.transactionPolicy(myFormData).toPromise().then(
            res => {
                this.loading = false;
                if (res.P_COD_ERR === 0) {
                    this.valid = true;
                    this.approve = true;
                    this.sctrNumber = this.codProducto == 2 ? this.policyData.savedPolicyList.P_POLICY : 0;
                    this.vleyNumber = this.codProducto == 3 ? this.policyData.savedPolicyList.P_POLICY : 0;
                    this.policyNumber = this.policyData.savedPolicyList.P_POLICY;
                    this.constanciaNumber = res.P_NCONSTANCIA;
                } else if (res.P_COD_ERR === 2) {
                    this.valid = true;
                    this.approve = false;
                    this.validationMessage = res.P_MESSAGE;
                } else {
                    this.valid = false;
                    this.approve = false;
                    this.validationMessage = res.P_MESSAGE;
                }
            },
            err => {
                this.loading = false;
                this.valid = false;
                this.approve = false;
                this.validationMessage = 'Hubo un error al procesar su solicitud (servicio)';
            }
        );

    }

    async emitPolicy() {
        const myFormData: FormData = new FormData();

        if (this.policyData.adjuntos != null) {
            for (let file of this.policyData.adjuntos) {
                let adjunto = await this.GetAdjuntoBase64(file)
                myFormData.append(adjunto.name, adjunto, adjunto.name);
                console.log(adjunto);
            }
        }

        if (this.codProducto == 4) {
            this.policyData.savedPolicyList[0].P_NIDPAYMENT = this.policyData.niubizData.data.idPayment;
        }
        myFormData.append('objeto', JSON.stringify(this.policyData.savedPolicyList));
        myFormData.append('emisionMapfre', JSON.stringify(!!this.policyData.emisionMapfre || null));

        await this.policyemit.savePolicyEmit(myFormData).toPromise().then(
            res => {
                this.loading = false;
                if (res.P_COD_ERR === 0) {
                    this.valid = true;
                    this.approve = true;
                    this.pensionNumber = Number(res.P_POL_PENSION);
                    this.saludNumber = Number(res.P_POL_SALUD);
                    this.vleyNumber = Number(res.P_POL_VLEY);
                    this.policyNumber = Number(res.P_POL_AP);
                    this.constanciaNumber = Number(res.P_NCONSTANCIA);
                    if (!isNullOrUndefined(this.pensionNumber) && this.pensionNumber !== 0) {
                        this.auth.id = this.pensionNumber;
                    } else if (!isNullOrUndefined(this.saludNumber) && this.saludNumber !== 0) {
                        this.auth.id = this.saludNumber;
                    } else if (!isNullOrUndefined(this.vleyNumber) && this.vleyNumber !== 0) {
                        this.auth.id = this.vleyNumber;
                    } else if (!isNullOrUndefined(this.policyNumber) && this.policyNumber !== 0) {
                        this.auth.id = this.policyNumber;
                    } else {
                        this.auth.id = this.constanciaNumber;
                    }
                } else {
                    this.valid = false;
                    this.approve = false;
                    this.validationMessage = res.P_MESSAGE;
                }

            }, error => {
                this.loading = false;
                this.valid = false;
                this.approve = false;
                this.validationMessage = 'Hubo un error al procesar su solicitud (servicio)';
            });

    }

    async dismissPolicy(response) {
        this.loading = false;

        if (response.errorCode === 'PAGO_VALIDATON') {
            this.valid = true;
            this.approve = false;
            this.validationMessage = response.errorDesc;
        }

        if (response.errorCode === 'EMISION_VALIDATON') {
            this.valid = false;
            this.approve = true;
            this.validationMessage = response.errorDesc
                ? response.errorDesc.toString().substr(1)
                : '';
            this.messages = this.validationMessage.split('|');
        }
    }

    downloadPdf() {
        this.emisionService.generarVoucherDigitalPdf(this.auth).subscribe(
            res => {
                this.downloadDigitalPdf(res);
            },
            err => {
                console.log(err);
            }
        );
    }

    downloadDigitalPdf(response) {
        if (response) {
            let linkSource = 'data:application/pdf;base64,';
            linkSource += response.file;
            const a = document.createElement('a');
            a.setAttribute('href', linkSource);
            a.setAttribute('download', response.id);
            a.setAttribute('target', '_blank');
            a.setAttribute('style', 'display:none;');
            document.body.appendChild(a);
            a.click();
            a.remove();
        }
    }

    showTermsAndConditions() {
        this.modalRef = this.modalService.show(this.content);
    }

    closePrivacyModal() {
        this.modalRef.hide();
    }

    goToMain(value, transaccion) {
        if (value) {
            if (this.policyData.flagTramite == 1) {
                // this.router.navigate(['/']);
                window.location.href = "/";
            } else {
                if (!!this.policyData.urlContinuar) {
                    this.router.navigate([this.policyData.urlContinuar]);
                } else {
                    if (transaccion === 1) {
                        if (this.codProducto == 2) { //AVS INTERCONEXION SABSA 17012023
                            this.router.navigate(['/extranet/sctr/consulta-polizas']);
                        } else {
                            this.router.navigate(['/extranet/policy-transactions']);
                            // this.router.navigate(['/extranet/policy/emit']);F
                        }
                    } else {
                        if (this.codProducto == 2) { //AVS INTERCONEXION SABSA 17012023
                            this.router.navigate(['/extranet/sctr/consulta-polizas']);
                        } else {
                            this.router.navigate(['/extranet/policy-transactions']);
                        }
                    }
                }
            }
        } else {
            if (this.policyData.flagTramite == 1) {
                if (this.policyData.savedPolicyList[0].nbranch == 71) {
                    this.router.navigate(['/extranet/transact-evaluation-desgravamen']);
                }
                else {
                    this.router.navigate(['/extranet/transact-evaluation']);
                }
            } else {
                if (!!this.policyData.urlVolver) {
                    this.router.navigate([this.policyData.urlVolver]);
                } else {
                    if (transaccion === 1) {
                        if (this.codProducto == 2) { //AVS INTERCONEXION SABSA 17012023
                            this.router.navigate(['/extranet/sctr/poliza/emitir'], { queryParams: { quotationNumber: this.policyData.visaData.quotationNumber } });
                        } else {
                            this.router.navigate(['/extranet/policy/emit'], { queryParams: { quotationNumber: this.policyData.visaData.quotationNumber } });
                        }
                    }
                    if (transaccion === 2) {
                        if (this.codProducto == 2) { //AVS INTERCONEXION SABSA 17012023
                            this.router.navigate(['/extranet/sctr/poliza/transaccion/include'], { queryParams: { nroCotizacion: this.policyData.visaData.quotationNumber } });

                        } else {
                            this.router.navigate(['/extranet/policy/transaction/include'], { queryParams: { nroCotizacion: this.policyData.visaData.quotationNumber } });
                        }
                    }
                    if (transaccion === 4) {
                        if (this.codProducto == 2) { //AVS INTERCONEXION SABSA 17012023
                            this.router.navigate(['/extranet/sctr/poliza/transaccion/renew'], { queryParams: { nroCotizacion: this.policyData.visaData.quotationNumber } });
                        } else {
                            this.router.navigate(['/extranet/policy/transaction/renew'], { queryParams: { nroCotizacion: this.policyData.visaData.quotationNumber } });
                        }
                    }
                }
            }
        }
    }

    ngOnDestroy(): void {
        localStorage.removeItem('policydata');
    }

    async emitCertificatePolicy() {
        const myFormData: FormData = new FormData();

        if (this.policyData.adjuntos != null) {
            for (let file of this.policyData.adjuntos) {
                let adjunto = await this.GetAdjuntoBase64(file)
                myFormData.append(adjunto.name, adjunto, adjunto.name);
                console.log(adjunto);
            }
        }
        myFormData.append('objetoCE', JSON.stringify(this.policyData.savedPolicyList));
        await this.policyemit.emitirCertificadoEstado(myFormData).toPromise().then(
            res => {
                this.loading = false;
                if (res.P_COD_ERR === 0) {
                    this.valid = true;
                    this.approve = true;
                    this.vleyNumber = Number(res.P_NPOLICY);
                    this.constanciaNumber = Number(res.P_NCONSTANCIA);
                    if (!isNullOrUndefined(this.vleyNumber) && this.vleyNumber !== 0) {
                        this.auth.id = this.vleyNumber;
                    } else {
                        this.auth.id = this.constanciaNumber;
                    }

                } else {
                    this.valid = false;
                    this.approve = false;
                    this.validationMessage = res.P_MESSAGE;
                }

            }, error => {
                this.loading = false;
                this.valid = false;
                this.approve = false;
                this.validationMessage = 'Hubo un error al procesar su solicitud (servicio)';
            });

    }

    InsertVisaNC() {
        this.CreditDataNC = JSON.parse(localStorage.getItem('creditdata'));

        let NCRollQuotation: any = {};
        NCRollQuotation.ListainsertNCVISA = [];

        if (this.auth.transac ==  CommonMethods.TIPO_TRANSACCION.EMISION) {
            var trans = 'EM';
        } else if (this.auth.transac ==  CommonMethods.TIPO_TRANSACCION.INCLUSION) {
            var trans = 'IN';
        } else if (this.auth.transac ==  CommonMethods.TIPO_TRANSACCION.RENOVACION && (this.policyData.savedPolicyList.P_STRAN ?? this.policyData.savedPolicyList[0]?.P_STRAN) != 'DE') {
            var trans = 'RE';
        } else if (this.auth.transac ==  CommonMethods.TIPO_TRANSACCION.ENDOSO) {
            var trans = 'EN';
        } else {
            var trans = 'DE';
        }

        for (let i = 0; i < this.CreditDataNC.length; i++) {
            const itemNCVisa: any = {};
            itemNCVisa.P_NIDPAYMENT = Number(this.policyData.visaData.idProcess);
            itemNCVisa.P_NCURRENCY = Number(this.CreditDataNC[i].moneda) || 1;
            itemNCVisa.P_NIDPAYTYPE = this.CreditDataNC[i].forma_pago == 'NC' ? 4 : this.CreditDataNC[i].forma_pago || this.CreditDataNC[i].forma_pago == 'PCP' ? 7 : this.CreditDataNC[i].forma_pago;
            itemNCVisa.P_SOPERATION_NUMBER = Number(this.CreditDataNC[i].documento_nc);
            itemNCVisa.P_NAMOUNT = Number(this.CreditDataNC[i].monto);
            itemNCVisa.P_NID_COTIZACION = this.policyData.savedPolicyList[0]?.P_NID_COTIZACION ?? this.policyData.savedPolicyList.P_NID_COTIZACION;
            itemNCVisa.P_CODIGOCANAL = this.policyData.visaData.codigoCanal;
            itemNCVisa.P_NIDUSER = this.currentUser.id;
            itemNCVisa.P_ESTADO = 2;
            itemNCVisa.P_NTYPE_TRANSAC = trans === 'DE' ? 11 : this.policyData.transaccion;
            itemNCVisa.P_STRANSAC = trans;
            NCRollQuotation.ListainsertNCVISA.push(itemNCVisa);
        }

        const myFormData: FormData = new FormData()
        this.files.forEach(file => {
            myFormData.append(file.name, file);
        });

        myFormData.append('NC', JSON.stringify(NCRollQuotation));

        this.accPersonalesService.NCParcialVISA(myFormData).subscribe();
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
}
