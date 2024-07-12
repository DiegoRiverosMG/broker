import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PolicyemitService } from '../../../services/policy/policyemit.service';
import { QuotationService } from '../../../services/quotation/quotation.service';
import swal from 'sweetalert2';
import { CommonMethods } from './../../common-methods';
import { ClientInformationService } from '../../../services/shared/client-information.service';
import { TransactService } from '../../../services/transact/transact.service';
import { CobranzasService } from '../../../services/cobranzas/cobranzas.service';
import * as FileSaver from 'file-saver';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { AccPersonalesService } from '../../quote/acc-personales/acc-personales.service';

@Component({
    selector: 'app-transact-evaluation',
    templateUrl: './transact-evaluation.component.html',
    styleUrls: ['./transact-evaluation.component.css']
})
export class TransactEvaluationComponent implements OnInit {

    tramite: any = {};
    poliza: any = {};
    cotizacion: any = {};
    filter: any = {};
    inputsQuotation: any = {};
    isLoading: Boolean = false; // true:mostrar | false:ocultar pantalla de carga
    modal: any = {};// variables de prueba para abrir modal de pagos
    tramitelogin = JSON.parse(sessionStorage.getItem('tramitelogin'));
    quotationNumber = 0;
    CommissionList: any = [];
    CalculateList: any = [];
    CalculateDetailList: any = [];
    ProposalList: any = [];
    ProposalDetailList: any = [];
    AuthorizedList: any = [];
    AuthorizedDetailList: any = [];
    categoryList: any = [];
    QuotationData: any = {};
    nTransac: number = 0;
    sAbrTran: string = '';
    codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
    userCode; //JSON.parse(localStorage.getItem('currentUser'))['id'];
    vidaLeyID = JSON.parse(localStorage.getItem('vidaleyID'));
    policyNumber: any = 0;
    creditHistory: any = null;
    contractingdata: any = [];
    files: File[] = [];
    comment = "";
    symbolMoney = "";
    datoDeclaracion = null;
    currentDate: Date = new Date();
    dataRenovacion: any = {};
    iniVigAseg;
    tipoEndosoList: any = [];
    tipoEndoso = '';
    emsionDirecta = '';
    CreditDataNC: any;
    cotizacionNC: any;
    CanalNC: any;
    UserID: any; //AVS NC
    FlagPagoNC: any;
    flagBotonNC: any; //AVS NC
    sComissionVL: string = "";
    constructor(
        private policyService: PolicyemitService,
        private router: Router,
        private quotationService: QuotationService,
        private clientInformationService: ClientInformationService,
        private transactService: TransactService,
        private accPersonalesService: AccPersonalesService,
        private collectionsService: CobranzasService,
    ) { }


    // healthProductId = JSON.parse(localStorage.getItem('saludID'));
    // pensionProductId = JSON.parse(localStorage.getItem('pensionID'));

    // epsItem = JSON.parse(sessionStorage.getItem('eps'));


    async ngOnInit() {
        this.isLoading = true;
        this.userCode = this.tramitelogin.P_NUSERCODE;
        sessionStorage.setItem('isTransact', '1');
        console.log(this.tramitelogin)
        await this.transactService.ValidarRechazoEjecutivo(this.tramitelogin).toPromise().then(
            async resValidacion => {
                if (resValidacion.P_FLAG_RECHAZO == 2) {
                    swal.fire('Información', resValidacion.P_MESSAGE, 'error').
                        then((result) => {
                            this.isLoading = false;
                            if (result.value) {
                                this.router.navigate(['/']);
                            }
                        });
                }
            }
        );

        await this.policyService.getPolicyEmitCab(this.tramitelogin.P_NID_COTIZACION, "", this.tramitelogin.P_NUSERCODE).toPromise().then(
            async res => {
                this.tramite = res.GenericResponse;
                this.quotationNumber = this.tramitelogin.P_NID_COTIZACION;
                await this.getInfoQuotation();
                await this.getInfoExperia(res);
                await this.dataClient();
                await this.getInfoComer();
                await this.SetTransac();
                this.inputsQuotation.tipoTransaccion = this.nTransac;
                console.log(this.tramite);


            }
        );

        await this.getInfoAuth();
        this.symbolMoney = this.tramite.COD_MONEDA == 1 ? "S/" : "$";
        await this.getCommission(this.tramite);
        this.isLoading = false;
        CommonMethods.clearBack();
    }

    async getInfoQuotation() {
        this.filter = {
            QuotationNumber: this.tramitelogin.P_NID_COTIZACION,
            Nbranch: 73,
            ProductType: 1,
            User: this.tramitelogin.P_NUSERCODE
        }
        await this.quotationService.getQuotationList(this.filter).toPromise().then(
            res => {
                this.QuotationData = res.GenericResponse[0];
            }
        );
    }

    async getInfoComer() {
        await this.policyService.getPolicyEmitComer(this.quotationNumber).toPromise().then(
            res => {
                this.inputsQuotation.SecondaryBrokerList = [];
                res.forEach(item => {
                    item.COMISION_PENSION = CommonMethods.ConvertToReadableNumber(item.COMISION_PENSION);
                    item.COMISION_PENSION_PRO = CommonMethods.ConvertToReadableNumber(item.COMISION_PENSION_PRO);
                    item.COMISION_PENSION_AUT = item.COMISION_PENSION_AUT == '0' ? CommonMethods.ConvertToReadableNumber(item.COMISION_PENSION_PRO) : CommonMethods.ConvertToReadableNumber(item.COMISION_PENSION_AUT);
                    item.COMISION_SALUD_PRO = CommonMethods.ConvertToReadableNumber(item.COMISION_SALUD_PRO);
                    item.COMISION_SALUD = CommonMethods.ConvertToReadableNumber(item.COMISION_SALUD);
                    item.COMISION_SALUD_AUT = item.COMISION_SALUD_AUT == '0' ? CommonMethods.ConvertToReadableNumber(item.COMISION_SALUD_PRO) : CommonMethods.ConvertToReadableNumber(item.COMISION_SALUD_AUT);
                    item.valItemSal = false;
                    item.valItemSalPr = false;
                    item.valItemPen = false;
                    item.valItemPenPr = false;
                    item.OriginalHealthPropCommission = item.COMISION_SALUD_PRO;
                    item.OriginalPensionPropCommission = item.COMISION_PENSION_PRO;
                    item.OriginalHealthAuthCommission = item.COMISION_SALUD_AUT;
                    item.OriginalPensionAuthCommission = item.COMISION_PENSION_AUT;
                    this.inputsQuotation.SecondaryBrokerList.push(item);
                });
            }
        )
    }

    getInfoAuth() {
        let data: any = {};
        data.QuotationNumber = this.quotationNumber;

        this.quotationService.getInfoQuotationAuth(data).subscribe(
            res => {
                this.categoryList = res.CategoryList;
                this.CommissionList = res.CommissionList;
                this.CommissionList.forEach(element => {
                    this.inputsQuotation.PensionMinPremium = element.MinPremium;
                    this.inputsQuotation.desTipoComision = element.Commission;
                    this.inputsQuotation.desTipoPlan = element.Plan;
                    this.inputsQuotation.CommissionProposed = element.CommissionProposed;
                    this.inputsQuotation.CommissionAuthorized = element.CommissionAuthorized;
                });

                this.CalculateList = res.CalculateList;
                this.CalculateDetailList = res.CalculateDetailList;
                this.ProposalList = res.ProposalList;
                this.ProposalDetailList = res.ProposalDetailList;
                this.AuthorizedList = res.AuthorizedList;
                this.AuthorizedDetailList = res.AuthorizedDetailList;

                //this.inputsQuotation.desTipoPlan = this.descPlanBD; //msr
            },
            err => {
            }
        );
    }

    processTransact() {
        const pregunta = '¿Desea realizar la transacción de ' + this.QuotationData.TypeTransac.toLowerCase() + ' de la cotización N° ' + this.quotationNumber + '?';
        swal.fire({
            title: 'Información',
            text: pregunta,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Aprobar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'

        }).then((result) => {
            if (result.value) {
                this.objetoTrx();
            }
        });
    }

    async getInfoExperia(res): Promise<any> {
        const data: any = {};
        data.tipoid = res.GenericResponse.TIPO_DOCUMENTO == '1' ? '2' : '1';
        data.id = res.GenericResponse.NUM_DOCUMENTO;
        data.papellido = res.GenericResponse.P_SLASTNAME;
        data.sclient = this.tramite.SCLIENT;
        data.usercode = this.userCode;
        await this.clientInformationService.invokeServiceExperia(data).toPromise().then(
            res => {
                this.creditHistory = {};
                this.creditHistory.nflag = res.nflag;
                this.creditHistory.sdescript = res.sdescript;
            }
        );
    }

    async objetoTrx() {
        this.isLoading = true;
        /* Validar Retroactividad antes de pagar */
        /*if (this.codProducto == 3 && this.typeTran != "Endoso" && this.inputsQuotation.formaPago) {
          const response: any = await this.ValidateRetroactivity(2);
          if (response.P_NCODE == 4) {
            this.router.navigate(['/extranet/request-status']);
            swal.fire('Información', response.P_SMESSAGE, 'error');
            return;
          }
        }*/
        /* * Validar Retroactividad antes de pagar * */
        if (this.inputsQuotation.tipoTransaccion == 1) {
            await this.policyService.getPolicyEmitCab(
                this.quotationNumber, "", this.userCode
            ).toPromise().then(async (res: any) => {
                if (!!res.GenericResponse && res.GenericResponse.COD_ERR == 0) {
                    //   await this.policyService.getPolicyEmitDet(
                    //   this.quotationNumber,this.userCode
                    //  .toPromise().then(
                    //  async resDet => {
                    // const efectoWS = new Date(res.GenericResponse.EFECTO_COTIZACION_VL)
                    // const fechaEfecto = CommonMethods.formatDate(new Date(res.GenericResponse.EFECTO_COTIZACION_VL));
                    console.log(res.GenericResponse)
                    const params = [
                        {
                            P_NID_COTIZACION: this.quotationNumber,
                            P_NID_PROC: res.GenericResponse.NID_PROC,
                            P_NBRANCH: this.vidaLeyID.nbranch,
                            P_NPRODUCT: this.vidaLeyID.id,
                            P_SCOLTIMRE: res.GenericResponse.TIP_RENOV,
                            P_DSTARTDATE: CommonMethods.formatDate(new Date(res.GenericResponse.EFECTO_COTIZACION)),
                            P_DEXPIRDAT: CommonMethods.formatDate(new Date(res.GenericResponse.EXPIRACION_COTIZACION)),
                            P_NPAYFREQ: res.GenericResponse.FREQ_PAGO,
                            P_SFLAG_FAC_ANT: 1,
                            P_FACT_MES_VENCIDO: 0, //provisional hasta traer el real
                            P_NPREM_NETA: this.AuthorizedDetailList[0].AmountAuthorized,
                            P_IGV: this.AuthorizedDetailList[1].AmountAuthorized,
                            P_NPREM_BRU: this.AuthorizedDetailList[2].AmountAuthorized,
                            P_SCOMMENT: this.comment.toUpperCase().replace(/[<>%]/g, ''),
                            P_NUSERCODE: this.userCode,
                            P_DSTARTDATE_ASE: CommonMethods.formatDate(new Date(res.GenericResponse.EFECTO_ASEGURADOS)),
                            P_DEXPIRDAT_ASE: CommonMethods.formatDate(new Date(res.GenericResponse.EXPIRACION_ASEGURADOS)),

                            //P_NTYPE_TRANSAC: this.inputsQuotation.tipoTransaccion,
                            //P_NMOV_ANUL: 0,
                            //P_NNULLCODE: 0,
                            //P_POLICY: this.QuotationData.PolicyNumber,

                            //P_STRAN: this.sAbrTran,

                            //FlagCambioFecha: 0,
                            /* Campos para retroactividad */
                            //Ini - RI
                            P_NAMO_AFEC: this.AuthorizedDetailList[0].AmountAuthorized,
                            P_NIVA: this.AuthorizedDetailList[1].AmountAuthorized,
                            P_NAMOUNT: this.AuthorizedDetailList[2].AmountAuthorized
                            //Fin - RI
                        }
                    ];

                    if (params[0].P_NID_PROC == '') {
                        await this.quotationService.getProcessCode(this.quotationNumber).toPromise().then(
                            resCod => {
                                console.log(resCod);
                                params[0].P_NID_PROC = resCod;
                            }
                        );
                    }
                    this.OpenModalPagos(params);
                    // }
                    // )
                    // );
                }
            });
        } else if (this.inputsQuotation.tipoTransaccion == 14) {

            await this.policyService.getPolicyEmitCab(
                this.quotationNumber, "", this.userCode
            ).toPromise().then(async (res: any) => {
                if (!!res.GenericResponse && res.GenericResponse.COD_ERR == 0) {
                    console.log(res.GenericResponse)
                    const params = [
                        {
                            P_NID_COTIZACION: this.quotationNumber,
                            P_NID_PROC: res.GenericResponse.NID_PROC,
                            P_NPRODUCT: this.vidaLeyID.id,
                            P_NBRANCH: this.vidaLeyID.nbranch,
                            P_SCOLTIMRE: res.GenericResponse.TIP_RENOV,
                            P_DSTARTDATE: CommonMethods.formatDate(new Date(res.GenericResponse.EFECTO_COTIZACION)),
                            P_DEXPIRDAT: CommonMethods.formatDate(new Date(res.GenericResponse.EXPIRACION_COTIZACION)),
                            P_NPAYFREQ: res.GenericResponse.FREQ_PAGO,
                            P_SFLAG_FAC_ANT: 1,
                            P_FACT_MES_VENCIDO: 0, //provisional hasta traer el real
                            P_NPREM_NETA: this.AuthorizedDetailList[0].AmountAuthorized,
                            P_IGV: this.AuthorizedDetailList[1].AmountAuthorized,
                            P_NPREM_BRU: this.AuthorizedDetailList[2].AmountAuthorized,
                            P_NAMO_AFEC: this.AuthorizedDetailList[0].AmountAuthorized,
                            P_NIVA: this.AuthorizedDetailList[1].AmountAuthorized,
                            P_NAMOUNT: this.AuthorizedDetailList[2].AmountAuthorized,
                            P_SCOMMENT: this.comment.toUpperCase().replace(/[<>%]/g, ''),
                            P_NUSERCODE: this.userCode,
                            P_DSTARTDATE_ASE: CommonMethods.formatDate(new Date(res.GenericResponse.EFECTO_ASEGURADOS)),
                            P_DEXPIRDAT_ASE: CommonMethods.formatDate(new Date(res.GenericResponse.EXPIRACION_ASEGURADOS)),
                            planId: res.GenericResponse.NIDPLAN,
                            FlagCambioFecha: 0,
                            P_NPOLICY: res.GenericResponse.NPOLICY,
                            P_NDE: 0,
                            P_NIDPAYMENT: 0
                        }
                    ];

                    if (params[0].P_NID_PROC == '') {
                        await this.quotationService.getProcessCode(this.quotationNumber).toPromise().then(
                            resCod => {
                                console.log(resCod);
                                params[0].P_NID_PROC = resCod;
                            }
                        );
                    }
                    this.OpenModalPagos(params);
                }
            });


        } else if ((this.inputsQuotation.tipoTransaccion == 2 ||
            this.inputsQuotation.tipoTransaccion == 4 ||
            this.inputsQuotation.tipoTransaccion == 8) ||
            this.inputsQuotation.tipoTransaccion == 3) {

            await this.policyService.getPolicyEmitCab(this.quotationNumber, '1', this.userCode).toPromise().then(
                async res => {
                    await this.quotationService.getProcessCode(this.quotationNumber).toPromise().then(
                        resCod => {
                            const params = {
                                P_NPRODUCTO: this.vidaLeyID.id,
                                P_NBRANCH: this.vidaLeyID.nbranch,
                                P_NID_COTIZACION: this.quotationNumber,
                                P_DEFFECDATE: this.nTransac == 3 ? CommonMethods.formatDate(new Date(res.GenericResponse.FECHA_EXCLUSION)) : this.nTransac == 8 ? CommonMethods.formatDate(new Date(res.GenericResponse.EFECTO_ASEGURADOS)) : CommonMethods.formatDate(new Date(res.GenericResponse.EFECTO_ASEGURADOS)),
                                P_DEXPIRDAT: this.nTransac == 8 || this.nTransac == 3 ? CommonMethods.formatDate(new Date(res.GenericResponse.EXPIRACION_ASEGURADOS)) : CommonMethods.formatDate(new Date(res.GenericResponse.EXPIRACION_ASEGURADOS)),
                                P_NUSERCODE: this.userCode,
                                P_NTYPE_TRANSAC: this.inputsQuotation.tipoTransaccion,
                                P_NID_PROC: resCod,
                                P_FACT_MES_VENCIDO: this.nTransac == 3 ? res.GenericResponse.SDEVOLPRI : 0, //provisional hasta traer el real
                                P_SFLAG_FAC_ANT: 1,
                                P_SCOLTIMRE: res.GenericResponse.TIP_RENOV,
                                P_NPAYFREQ: res.GenericResponse.FREQ_PAGO,
                                P_NMOV_ANUL: 0,
                                P_NNULLCODE: 0,
                                P_SCOMMENT: this.comment.toUpperCase().replace(/[<>%]/g, ''),
                                P_NPREM_BRU: this.AuthorizedDetailList[2].AmountAuthorized,
                                P_POLICY: this.QuotationData.PolicyNumber,
                                /* Campos para retroactividad */
                                P_STRAN: this.sAbrTran,
                                P_DSTARTDATE_ASE: CommonMethods.formatDate(new Date(res.GenericResponse.EFECTO_ASEGURADOS)),
                                FlagCambioFecha: 0,
                                /* Campos para retroactividad */
                                //Ini - RI
                                P_DSTARTDATE_POL: CommonMethods.formatDate(new Date(res.GenericResponse.EFECTO_COTIZACION)),
                                P_DEXPIRDAT_POL: CommonMethods.formatDate(new Date(res.GenericResponse.EXPIRACION_COTIZACION)),
                                P_NAMO_AFEC: this.AuthorizedDetailList[0].AmountAuthorized,
                                P_NIVA: this.AuthorizedDetailList[1].AmountAuthorized,
                                P_NAMOUNT: this.AuthorizedDetailList[2].AmountAuthorized
                                //Fin - RI
                            };

                            if (this.QuotationData.Mode === 'Evaluar') {
                                const actualizarCotizacion = {
                                    QuotationNumber: this.quotationNumber,
                                    Status: 2,
                                    Reason: '',
                                    Comment: this.comment,
                                    User: this.userCode,
                                    Product: this.vidaLeyID.id,
                                    Nbranch: this.vidaLeyID.nbranch,
                                    Gloss: '',
                                    GlossComment: '',
                                    saludAuthorizedRateList: [],
                                    pensionAuthorizedRateList: [],
                                    BrokerList: [],
                                    Flag: 0,
                                    FlagCIP: 0 //pago CIP
                                };
                                this.inputsQuotation.actualizarCotizacion = actualizarCotizacion;
                            }
                            console.log(params);
                            if (this.inputsQuotation.tipoTransaccion == 3) {
                                this.trxDirect(params);
                            } else {
                                if (this.nTransac == 8) {
                                    let _primaTotal = 0;
                                    try {
                                        _primaTotal = this.AuthorizedDetailList[2].AmountAuthorized
                                    } catch (e) {
                                        _primaTotal = 0;
                                    }
                                    if (_primaTotal <= 0) {
                                        this.trxDirect(params);
                                    } else {
                                        this.OpenModalPagos(params);
                                    }
                                } else {
                                    this.OpenModalPagos(params);
                                }
                            }
                        });
                });
        }
    }

    trxDirect(objeto) {
        const params: FormData = new FormData();
        this.isLoading = true;
        if (this.files.length > 0) {
            this.files.forEach(file => {
                params.append('adjuntos', file, file.name);
            });
        }

        params.append('transaccionProtecta', JSON.stringify(objeto));
        params.append('transaccionMapfre', JSON.stringify(null));

        this.policyService.transactionPolicy(params).subscribe(
            res => {
                this.isLoading = false;
                if (res.P_COD_ERR == 0) {
                    if (!!this.quotationNumber) {
                        let msgDirecto = '';
                        if (this.nTransac == 3) {
                            msgDirecto = 'Se ha generado correctamente la exclusión de la póliza N° ';
                        } else {
                            msgDirecto = 'Se ha generado correctamente el endoso de la póliza N° ';
                        }
                        swal.fire({
                            title: 'Información',
                            text: msgDirecto + this.QuotationData.PolicyNumber,
                            icon: 'success',
                            allowOutsideClick: false,
                        }).then(
                            (result) => {
                                if (result.value) {
                                    this.router.navigate(['/']);
                                }
                            });
                    }
                } else {
                    swal.fire({
                        title: 'Información',
                        text: res.P_MESSAGE,
                        icon: 'error',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                    })/*.then((result) => {
            if (result.value) {
              this.router.navigate(['/extranet/policy-transactions-all']);
            }
          });*/
                }
            },
            err => {
                this.isLoading = false;
            }
        );
    }

    async dataClient() {
        let data: any = {};
        data.P_TipOper = 'CON';
        data.P_NUSERCODE = this.userCode;
        data.P_NIDDOC_TYPE = this.tramite.TIPO_DOCUMENTO;
        data.P_SIDDOC = this.tramite.NUM_DOCUMENTO.toUpperCase().trim();

        await this.clientInformationService.getCliente360(data).toPromise().then(
            res => {
                if (res.P_NCODE == 0) {

                    this.contractingdata = res.EListClient[0];
                    this.inputsQuotation.P_SISCLIENT_GBD = (this.contractingdata.P_SISCLIENT_GBD == null ? '2' : this.contractingdata.P_SISCLIENT_GBD);
                }
            }
        );
    }

    // Funcion de prueba para abrir modal de pagos
    async OpenModalPagos(paramsTrx) {

        await this.ValidacionPago();
        console.log(paramsTrx);

        this.inputsQuotation.trama = {
            PRIMA_TOTAL: this.AuthorizedDetailList[2].AmountAuthorized,
            // this.inputsQuotation.tipoTransaccion == 1 ? paramsTrx[0].P_NPREM_BRU : paramsTrx.P_NPREM_BRU,
            NIDPROC: this.inputsQuotation.tipoTransaccion == 1 || this.inputsQuotation.tipoTransaccion == 14 ? paramsTrx[0].P_NID_PROC : paramsTrx.P_NID_PROC,
        };

        this.inputsQuotation.contratante = {
            email: this.tramite.CORREO,
            NOMBRE_RAZON: this.tramite.NOMBRE_RAZON,
            COD_PRODUCT: this.vidaLeyID.id,
            tipoDocumento: {
                Id: this.tramite.TIPO_DOCUMENTO
            },
            tipoPersona: {
                codigo: this.tramite.TIPO_DOCUMENTO == 1 &&
                    this.tramite.NUM_DOCUMENTO.substr(0, 2) == '20' ? 'PJ' : 'PN',
            },
            numDocumento: this.tramite.NUM_DOCUMENTO,
            // emisionDirecta: (this.QuotationData.Mode === 'Visualizar' && this.creditHistory.sdescript=='RIESGO BAJO' && this.contractingdata.P_SISCLIENT_GBD !=1 && Number(this.AuthorizedDetailList[2].AmountAuthorized) <100 )|| (this.QuotationData.Mode === 'Visualizar' && this.creditHistory.sdescript=='RIESGO ALTO' && this.contractingdata.P_SISCLIENT_GBD !=1 ) || this.QuotationData.Mode === 'Evaluar' ? 'N' : 'S',
            emisionDirecta: this.emsionDirecta,
            creditHistory: this.creditHistory,
            codTipoCuenta: this.contractingdata.P_SISCLIENT_GBD,
            lockMark: 0,
            cliente360: this.contractingdata,
            nombres: this.contractingdata.P_SFIRSTNAME,
            apellidoPaterno: this.contractingdata.P_SLASTNAME,
            apellidoMaterno: this.contractingdata.P_SLASTNAME2,
            razonSocial: this.contractingdata.P_SLEGALNAME,
        };

        this.inputsQuotation.poliza = {
            producto: {
                COD_PRODUCT: this.vidaLeyID.id,
            }
        };

        this.inputsQuotation.prepago = {
            P_NID_COTIZACION: this.inputsQuotation.tipoTransaccion == 1 || this.inputsQuotation.tipoTransaccion == 14 ? paramsTrx[0].P_NID_COTIZACION : paramsTrx.P_NID_COTIZACION,
        };
        this.inputsQuotation.brokers = this.inputsQuotation.SecondaryBrokerList;

        for (const item of this.inputsQuotation.brokers) {
            item.COD_CANAL = item.CANAL;
        }

        // this.inputsQuotation.tipoTransaccion = this.tipoTransaccion();
        this.inputsQuotation.files = this.files;
        this.inputsQuotation.paramsTrx = paramsTrx;
        this.inputsQuotation.tipoTransaccion = this.nTransac;
        this.inputsQuotation.transac = this.sAbrTran;
        this.inputsQuotation.numeroCotizacion = this.inputsQuotation.tipoTransaccion == 1 || this.inputsQuotation.tipoTransaccion == 14 ?
            paramsTrx[0].P_NID_COTIZACION : paramsTrx.P_NID_COTIZACION;
        this.inputsQuotation.flagTramite = 1;
        this.cotizacion = this.inputsQuotation;
        localStorage.removeItem('creditdata'); // AVS PRY NC
        localStorage.removeItem('botonNC'); // AVS PRY NC
        this.modal.pagos = true;
        this.isLoading = true;
        /*if (this.QuotationData.Mode == 'Evaluar') {
    
        } else {
          if (this.QuotationData.Mode !== 'Evaluar') {
            if (this.inputsQuotation.tipoTransaccion == 1) {
              //this.emitirTrx(this.inputsQuotation.paramsTrx);
            } else {
              //this.renovacionTrx(this.inputsQuotation.paramsTrx);
            }
          }
        }*/
    }

    async ValidacionPago() {
        let data: any = {}
        data.ncotizacion = this.quotationNumber;
        data.nusercode = this.userCode;
        data.npendiente = 0;
        await this.quotationService.ValidarReglasPagos(data).toPromise().then(res => {

            this.emsionDirecta = res.P_SAPROBADO
        })
    }
    async formaPagoElegido() {
        //console.log(this.polizaEmitCab.paramsTrx);
        if (this.inputsQuotation.poliza.pagoElegido === 'efectivo') {
            this.router.navigate(['/extranet/policy/pago-efectivo']);
        }

        if (this.inputsQuotation.poliza.pagoElegido === 'voucher') {
            if (!!this.inputsQuotation.file) {

                if (!!this.inputsQuotation.actualizarCotizacion) {
                    //apago el flag de pago
                    const params = new FormData();

                    this.inputsQuotation.files.forEach(function (file) {
                        params.append(file.name, file, file.name);
                    });

                    if (!!this.inputsQuotation.file) {
                        params.append(
                            this.inputsQuotation.file.name,
                            this.inputsQuotation.file,
                            this.inputsQuotation.file.name
                        );
                    }

                    params.append('statusChangeData', JSON.stringify(this.inputsQuotation.actualizarCotizacion));

                    swal.fire({
                        title: 'Información',
                        text: '¿Deseas adjuntar el voucher?',
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Adjuntar',
                        allowOutsideClick: false,
                        cancelButtonText: 'Cancelar',
                    })
                        .then((result) => {
                            if (result.value) {

                                this.quotationService.changeStatusVL(params).subscribe(
                                    (res) => {
                                        this.isLoading = false;
                                        if (Number(res.StatusCode) === 0) {
                                            swal.fire({
                                                title: 'Información',
                                                text: 'Se adjuntó el voucher correctamente.',
                                                icon: 'success',
                                                allowOutsideClick: false,
                                            }).then(
                                                (result) => {
                                                    if (result.value) {
                                                        this.router.navigate(['/']);
                                                    }
                                                });
                                        } else {
                                            swal.fire(
                                                'Información',
                                                CommonMethods.listToString(res.ErrorMessageList),
                                                'error'
                                            );
                                        }
                                    },
                                    (err) => {
                                        swal.fire(
                                            'Información',
                                            'Hubo un problema al comunicarnos con el servidor.',
                                            'error'
                                        );
                                        this.isLoading = false;
                                    }
                                );
                            } else {
                                this.isLoading = false;
                                this.modal.pagos = true;
                            }
                        });

                }
            } else {
                this.isLoading = false;
                this.modal.pagos = true;
                swal.fire(
                    'Información',
                    'Debes adjuntar voucher para continuar',
                    'error'
                );
            }
        }

        if (this.inputsQuotation.poliza.pagoElegido === 'directo') {

            if (this.nTransac == 1) {
                if (this.tramite.POLIZA_MATRIZ == '1') {
                    this.inputsQuotation.paramsTrx[0].P_NID_PROC = '';
                }
                this.inputsQuotation.paramsTrx[0].P_SPAGO_ELEGIDO = 'directo';
                this.SaveEmitPol(this.inputsQuotation.paramsTrx);
            } else if (this.nTransac == 14) {
                const myFormData: FormData = new FormData();
                this.inputsQuotation.paramsTrx[0].P_SPAGO_ELEGIDO = 'directo';
                myFormData.append('objetoCE', JSON.stringify(this.inputsQuotation.paramsTrx));
                this.emitirCertificadoEstado(myFormData)
            } else {


                const msgIncRenov = this.nTransac == 2 ? 'la Inclusión' : this.nTransac == 8 ? 'el Endoso' : this.sAbrTran == 'RE' ? 'la Renovación' : 'la Declaración';

                const params: FormData = new FormData();
                this.isLoading = true;
                if (this.files.length > 0) {
                    this.files.forEach(file => {
                        params.append('adjuntos', file, file.name);
                    });
                }

                this.inputsQuotation.paramsTrx.P_SPAGO_ELEGIDO = 'directo';

                this.FlagPagoNC = JSON.parse(localStorage.getItem('creditdata'));//AVS - PROY NC
                this.flagBotonNC = JSON.parse(localStorage.getItem('botonNC'));//AVS - PROY NC

                if (this.codProducto == 3 && this.FlagPagoNC != null && this.flagBotonNC == true) { //AVS - PROY NC
                    this.isLoading = true;
                    this.inputsQuotation.paramsTrx.P_NCOT_NC = 1;
                    // await this.InsertPayNCTEMP();
                }

                params.append('transaccionProtecta', JSON.stringify(this.inputsQuotation.paramsTrx));
                params.append('transaccionMapfre', JSON.stringify(null));
                params.append('notaCredito', JSON.stringify(JSON.parse(localStorage.getItem('creditdata'))));

                this.policyService.transactionPolicy(params).subscribe(
                    res => {
                        this.isLoading = false;
                        if (res.P_COD_ERR == 0) {
                            if (!!this.quotationNumber) {
                                swal.fire({
                                    title: 'Información',
                                    text: 'Se ha generado correctamente ' + msgIncRenov + ' de la póliza N° ' + this.QuotationData.PolicyNumber,
                                    icon: 'success',
                                    allowOutsideClick: false,
                                }).then(
                                    (result) => {
                                        if (result.value) {
                                            this.router.navigate(['/']);
                                        }
                                    });
                            }
                        } else {
                            swal.fire({
                                title: 'Información',
                                text: res.P_MESSAGE,
                                icon: 'error',
                                confirmButtonText: 'OK',
                                allowOutsideClick: false,
                            })/*.then((result) => {
              if (result.value) {
                this.router.navigate(['/extranet/policy-transactions-all']);
              }
            });*/
                        }
                    },
                    err => {
                        this.isLoading = false;
                    }
                );

            }



        }

        /*if (this.inputsQuotation.poliza.pagoElegido === 'omitir') {
          const msgIncRenov = this.nTransac == 2 ? 'el inclusión' : this.nTransac == 8 ? 'el endoso' : 'el renovación';
          if (this.inputsQuotation.paramsTrx.P_DIRECTO == 'V') {
            swal.fire('Información', this.inputsQuotation.paramsTrx.P_MESSAGE, 'success');
            this.router.navigate(['/extranet/policy-transactions-all']);
          } else {
            swal.fire(
              'Información',
              'Debes seleccionar una de las opciones de pago para ' + msgIncRenov +
              ' de la póliza N° ' + this.QuotationData.PolicyNumber,
              'error')
              .then((value) => {
                this.isLoading = false;
                this.modal.pagos = true;
              });
          }
        }*/
    }
    async RefuseTransact() {

        await this.transactService.ValidarRechazoEjecutivo(this.tramitelogin).toPromise().then(
            async resValidacion => {
                if (resValidacion.P_FLAG_RECHAZO == 2 || resValidacion.P_FLAG_RECHAZO == 1) {
                    swal.fire('Información', resValidacion.P_MESSAGE, 'error').
                        then((result) => {
                            this.isLoading = false;
                            if (result.value) {
                                this.router.navigate(['/']);
                            }

                        });

                } else {
                    if (this.comment == '') {
                        swal.fire('Información', 'Ingrese un comentario con el motivo del rechazo.', 'error');
                    } else {
                        swal.fire({
                            title: 'Información',
                            text: "¿Desea rechazar la transaccion de " + this.QuotationData.TypeTransac + " de la póliza " + this.QuotationData.PolicyNumber + "?",
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonText: "Rechazar",
                            allowOutsideClick: false,
                            cancelButtonText: 'Cancelar'
                        }).then((result) => {
                            if (result.value) {
                                this.isLoading = true;
                                let dataQuotation: any = {};
                                const data: FormData = new FormData(); /* Para los archivos EH */
                                this.files.forEach(file => {
                                    data.append(file.name, file);
                                });

                                dataQuotation.P_NID_TRAMITE = this.tramite.NID_TRAMITE;
                                dataQuotation.P_NID_COTIZACION = this.quotationNumber;
                                dataQuotation.P_NUSERCODE = this.userCode;
                                dataQuotation.P_NSTATUS_TRA = 21;
                                dataQuotation.P_SCOMMENT = this.comment.toUpperCase().replace(/[<>%]/g, '');
                                dataQuotation.P_FLAG_EJECCOM = 1;

                                data.append('objeto', JSON.stringify(dataQuotation));

                                this.transactService.InsertDerivarTransact(data).subscribe(
                                    res => {
                                        if (res.P_COD_ERR == 0) {
                                            this.isLoading = false;
                                            swal.fire({
                                                title: 'Información',
                                                text: "Transacción rechazada.",
                                                icon: 'success',
                                                allowOutsideClick: false,
                                            }).then(
                                                result => {
                                                    if (result.value) {
                                                        this.router.navigate(['/']);
                                                    }
                                                }
                                            );
                                        } else {
                                            this.isLoading = false;
                                            swal.fire('Información', res.P_MESSAGE, 'error');
                                        }
                                    },
                                    err => {
                                        this.isLoading = false;
                                        swal.fire('Información', 'Hubo un error con el servidor', 'error');
                                    }
                                );
                            }
                        });
                    }
                }
            }
        );
    }

    async getTramaFile(): Promise<any> {
        this.isLoading = true;
        const params: any = {};
        params.idMovimiento = 0;
        params.idCotizacion = this.quotationNumber;
        params.documentCode = 28;
        params.codProcess = this.tramite.NID_PROC;
        return this.collectionsService.getTramaFile(params).toPromise().then(
            res => {
                this.isLoading = false;
                if (res.indEECC === 0) {
                    const nameFile: string = "asegurados_" + this.QuotationData.TypeTransac.toLowerCase() + "_" + this.QuotationData.PolicyNumber;
                    const file = new File([this.obtenerBlobFromBase64(res.path, '')], nameFile + '.xlsx', { type: 'application/vnd.ms-excel' });
                    FileSaver.saveAs(file);
                } else {
                    swal.fire('Información', 'Error al obtener el archivo.', 'error');
                }
            },
            err => {
                this.isLoading = false;
                swal.fire('Información', 'Error inesperado, por favor contáctese con soporte.', 'error');
            }
        );
    }

    obtenerBlobFromBase64(b64Data: string, contentType: string) {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }
    async getTramaFileEndoso(): Promise<any> {
        this.isLoading = true;
        const params: any = {};
        params.idMovimiento = 0;
        params.idCotizacion = this.quotationNumber;
        params.documentCode = 28;
        params.codProcess = this.tramite.NID_PROC;
        return this.collectionsService.getTramaFileEndoso(params).toPromise().then(
            res => {
                this.isLoading = false;
                if (res.indEECC === 0) {
                    if (res.path == "") {
                        swal.fire('Información', 'Error al obtener el archivo.', 'error');
                    } else {
                        const nameFile: string = "asegurados_" + this.QuotationData.TypeTransac.toLowerCase() + "_" + this.QuotationData.PolicyNumber;
                        const file = new File([this.obtenerBlobFromBase64(res.path, '')], nameFile + '.xlsx', { type: 'application/vnd.ms-excel' });
                        FileSaver.saveAs(file);
                    }
                } else {
                    swal.fire('Información', 'Error al obtener el archivo.', 'error');
                }
            },
            err => {
                this.isLoading = false;
                swal.fire('Información', 'Error inesperado, por favor contáctese con soporte.', 'error');
            }
        );
    }

    getCoverDetail() {
        this.isLoading = true;
        const params: any = {};
        params.idMovimiento = 0;
        params.idCotizacion = this.quotationNumber;
        params.documentCode = 28;
        params.codProcess = this.tramite.NID_PROC;
        return this.collectionsService.getCoverDetail(params).toPromise().then(
            res => {
                this.isLoading = false;
                if (res.indEECC === 0) {
                    if (res.path == "") {
                        swal.fire('Información', 'Error al obtener el archivo.', 'error');
                    } else {
                        const nameFile: string = "coberturas_" + this.QuotationData.TypeTransac.toLowerCase() + "_" + this.QuotationData.PolicyNumber;
                        const file = new File([this.obtenerBlobFromBase64(res.path, '')], nameFile + '.xlsx', { type: 'application/vnd.ms-excel' });
                        FileSaver.saveAs(file);
                    }
                } else {
                    swal.fire('Información', 'Error al obtener el archivo.', 'error');
                }
            },
            err => {
                this.isLoading = false;

            }
        );
    }

    async SetTransac() {
        try {
            switch (this.QuotationData.TypeTransac) {
                case "Inclusión": {
                    this.nTransac = 2;
                    this.sAbrTran = "IN";
                    //this.setFechaIniVig();
                    break;
                }
                case "Declaración": {
                    this.nTransac = 4;
                    this.sAbrTran = "DE";
                    this.getInfoDeclaración();
                    break;
                }
                case "Renovación": {
                    this.nTransac = 4;
                    this.sAbrTran = "RE";
                    await this.getInfoRenovacion();
                    break;
                }
                case "Exclusión": {
                    this.nTransac = 3;
                    this.sAbrTran = "EX";
                    break;
                }
                case "Endoso": {
                    this.nTransac = 8;
                    this.sAbrTran = "EN";
                    //this.setFechaIniVig();
                    await this.getTypeEndoso();
                    break;
                }
                case "Broker": {
                    this.nTransac = 13;
                    this.sAbrTran = "BR";
                    break;
                }
                case "Emisión de certificados": {
                    this.nTransac = 14;
                    this.sAbrTran = "EC";
                    break;
                }
                default:
                    this.nTransac = 1;
                    this.sAbrTran = "EM";
                    break;
            }
        } catch (error) {
            this.nTransac = 1;
            this.sAbrTran = "EM";
        }
    }

    getInfoDeclaración() {
        let indexRenov = 0;
        let totRenov = 0;

        switch (this.tramite.TIP_RENOV) {
            case "1":
                switch (this.tramite.FREQ_PAGO) {
                    case "2": totRenov = 1;
                        indexRenov = this.getCurrentRenov(6);
                        break;
                    case "3": totRenov = 3;
                        indexRenov = this.getCurrentRenov(3);
                        break;
                    case "4": totRenov = 5;
                        indexRenov = this.getCurrentRenov(2);
                        break;
                    case "5": totRenov = 11;
                        indexRenov = this.getCurrentRenov(1);
                        break;
                    case "6": this.datoDeclaracion = "Declaración Única";
                        break;
                    case "7": totRenov = 364;
                        indexRenov = this.getCurrentRenovDays();
                        break;
                    case "8": this.datoDeclaracion = "Declaración en Cuotas";
                        break;
                    default: this.datoDeclaracion = "Declaración en Cuotas";
                }
                break;
            case "2":
                switch (this.tramite.FREQ_PAGO) {
                    case "3": totRenov = 1;
                        indexRenov = this.getCurrentRenov(3);
                        break;
                    case "4": totRenov = 2;
                        indexRenov = this.getCurrentRenov(2);
                        break;
                    case "5": totRenov = 5;
                        indexRenov = this.getCurrentRenov(1);
                        break;
                    case "6": this.datoDeclaracion = "Declaración Única";
                        break;
                    case "7": totRenov = 182;
                        indexRenov = this.getCurrentRenovDays();
                        break;
                    case "8": this.datoDeclaracion = "Declaración en Cuotas";
                        break;
                    default: this.datoDeclaracion = "Declaración en Cuotas";
                }
                break;
            case "3":
                switch (this.tramite.FREQ_PAGO) {
                    case "4": totRenov = 1;
                        indexRenov = this.getCurrentRenov(2);
                        break;
                    case "5": totRenov = 2;
                        indexRenov = this.getCurrentRenov(1);
                        break;
                    case "6": this.datoDeclaracion = "Declaración Única";
                        break;
                    case "7": totRenov = 90;
                        indexRenov = this.getCurrentRenovDays();
                        break;
                    case "8": this.datoDeclaracion = "Declaración en Cuotas";
                        break;
                    default: this.datoDeclaracion = "Declaración en Cuotas";
                }
                break;
            case "4":
                switch (this.tramite.FREQ_PAGO) {
                    case "5": totRenov = 1;
                        indexRenov = this.getCurrentRenov(1);
                        break;
                    case "6": this.datoDeclaracion = "Declaración Única";
                        break;
                    case "7": totRenov = 60;
                        indexRenov = this.getCurrentRenovDays();
                        break;
                    case "8": this.datoDeclaracion = "Declaración en Cuotas";
                        break;
                    default: this.datoDeclaracion = "Declaración en Cuotas";
                }
                break;
            case "5":
                switch (this.tramite.FREQ_PAGO) {
                    case "6": this.datoDeclaracion = "Declaración Única";
                        break;
                    case "7": totRenov = 30;
                        indexRenov = this.getCurrentRenovDays();
                        break;
                    case "8": this.datoDeclaracion = "Declaración en Cuotas";
                        break;
                    default: this.datoDeclaracion = "Declaración en Cuotas";
                }
                break;
            default: this.datoDeclaracion = "Declaración Especial";
        }
        if (this.datoDeclaracion == null) {
            this.datoDeclaracion = `${(indexRenov > totRenov ? totRenov : indexRenov)} de ${totRenov}`;
        }
    }

    getCurrentRenov(frecPago: number): number {
        /*let iniVig = new Date(this.tramite.EFECTO_COTIZACION);
        let fecDec = new Date(this.tramite.EFECTO_ASEGURADOS);
        let difference = fecDec.getMonth() - iniVig.getMonth() + (12 * (fecDec.getFullYear() - iniVig.getFullYear()));*/
        let difference = this.monthDiff(new Date(this.tramite.EFECTO_COTIZACION), new Date(this.tramite.EFECTO_ASEGURADOS));
        return Math.round(difference / frecPago);
    }

    monthDiff(d1, d2) {
        var months;
        months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth();
        months += d2.getMonth();
        return months <= 0 ? 0 : months;
    }

    getCurrentRenovDays(): number {
        let iniVig = new Date(this.tramite.EFECTO_COTIZACION);
        let fecDec = new Date(this.tramite.EFECTO_ASEGURADOS);
        let diff = Math.abs(fecDec.getTime() - iniVig.getTime());
        let diffDays = Math.ceil(diff / (1000 * 3600 * 24));
        return Math.round(diffDays);
    }

    async getInfoRenovacion() {
        this.filter = {
            P_NID_COTIZACION: this.tramitelogin.P_NID_COTIZACION
        }
        await this.transactService.GetVigenciaAnterior(this.filter).toPromise().then(
            res => {
                this.dataRenovacion = res.GenericResponse;
                console.log(this.dataRenovacion);
            }
        );
    }
    setFechaIniVig() {
        let fecha = new Date(this.tramite.EXPIRACION_ASEGURADOS);
        let nMonths = 0;
        switch (parseInt(this.tramite.FREQ_PAGO)) {
            case 1: {
                nMonths = 12;
                break;
            }
            case 2: {
                nMonths = 6;
                break;
            }
            case 3: {
                nMonths = 3;
                break;
            }
            case 4: {
                nMonths = 2;
                break;
            }
            case 5: {
                nMonths = 1;
                break;
            }
        }
        fecha.setMonth(fecha.getMonth() - nMonths);
        fecha.setDate(fecha.getDate() + 1);
        this.iniVigAseg = CommonMethods.formatDate(fecha);
    }
    getTypeEndoso() {
        this.policyService.GetTypeEndoso().toPromise().then(
            (res: any) => {
                this.tipoEndosoList = res;
                this.tipoEndoso = this.tipoEndosoList.filter(f => f.TYPE_ENDOSO == this.tramite.NTYPE_END)[0].DES_TYPE_ENDOSO;
            });
    }
    SaveEmitPol(saveCerti) {

        let title = this.nTransac == 1 ? 'Se ha generado correctamente la Emisión de la póliza N° ' : this.nTransac == 14 ? 'Se ha generado correctamente la Emisión de certificados  de la póliza N° ' + this.QuotationData.PolicyNumber : 'Se ha generado correctamente la Emisión de certificados  de la póliza N° ';


        const myFormData: FormData = new FormData();

        myFormData.append('objeto', JSON.stringify(saveCerti));
        myFormData.append('notaCredito', JSON.stringify(JSON.parse(localStorage.getItem('creditdata'))));

        this.FlagPagoNC = JSON.parse(localStorage.getItem('creditdata'));//AVS - PROY NC
        this.flagBotonNC = JSON.parse(localStorage.getItem('botonNC'));//AVS - PROY NC

        if (this.codProducto == 3 && this.FlagPagoNC != null && this.flagBotonNC == true) { //AVS - PROY NC
            saveCerti.P_NCOT_NC = 1;
            // this.InsertPayNCTEMP();
        }

        this.policyService.savePolicyEmit(myFormData).subscribe((res: any) => {

            this.isLoading = false;
            if (res.P_COD_ERR == 0) {
                let policyVLey = 0;
                let constancia = 0;

                policyVLey = Number(res.P_POL_VLEY);
                constancia = Number(res.P_NCONSTANCIA);

                if (policyVLey > 0) {
                    swal.fire({
                        title: 'Información',
                        text: title + policyVLey.toString(),
                        icon: 'success',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                    })
                        .then((result) => {
                            if (result.value) {
                                this.router.navigate(['/']);
                            }
                        });
                }

            }
        });

    }

    emitirCertificadoEstado(datasavecertificados) {
        this.policyService.emitirCertificadoEstado(datasavecertificados).subscribe(res => {

            if (res.P_COD_ERR == 0) {
                let policyVLey = 0;
                let constancia = 0;

                policyVLey = Number(res.P_POL_VLEY);
                constancia = Number(res.P_NCONSTANCIA);
                let title = 'Se ha generado correctamente la Emisión de Certificados de la póliza N° ';
                title = title + policyVLey.toString();
                swal.fire({
                    title: 'Información',
                    text: title,
                    icon: 'success',
                    confirmButtonText: 'OK',
                    allowOutsideClick: false,
                })
                    .then((result) => {
                        if (result.value) {
                            this.router.navigate(['/']);
                        }
                    });
            }
        }

        );

    }

    async InsertPayNCTEMP() { //AVS PRY NC
        this.CreditDataNC = JSON.parse(localStorage.getItem('creditdata'));
        this.cotizacionNC = JSON.parse(localStorage.getItem('policydata'));
        this.CanalNC = JSON.parse(localStorage.getItem('currentUser'));
        this.UserID = JSON.parse(localStorage.getItem('currentUser'))['id'];

        let NCRollQuotation: any = {};
        NCRollQuotation.ListainsertNCTEMP = [];

        for (let i = 0; i < this.CreditDataNC.length; i++) {
            const itemNCTEMP: any = {};
            itemNCTEMP.P_NID_COTIZACION = Number(this.cotizacion.numeroCotizacion);
            itemNCTEMP.P_NRECEIPT_NC = Number(this.CreditDataNC[i].documento_nc);
            itemNCTEMP.P_MONEDA = Number(this.tramite.COD_MONEDA) || Number(this.CreditDataNC.moneda) || 1;
            itemNCTEMP.P_NAMOUNT_NC = Number(this.CreditDataNC[i].monto);
            itemNCTEMP.P_SCODCHANNEL = Number(this.CanalNC.canal);
            itemNCTEMP.P_NIDPAYTYPE = this.CreditDataNC[i].forma_pago == 'NC' ? 4 : this.CreditDataNC[i].forma_pago || this.CreditDataNC[i].forma_pago == 'PCP' ? 7 : this.CreditDataNC[i].forma_pago;
            itemNCTEMP.P_NIDUSER = Number(this.UserID);
            itemNCTEMP.P_ESTADO = 1;
            itemNCTEMP.P_NTYPETRANSAC = this.sAbrTran == 'DE' ? 11 : (this.nTransac != null ? this.nTransac : 0);
            itemNCTEMP.P_DESTYPETRANSAC = this.sAbrTran != null ? this.sAbrTran : 'NO HAY REGISTRO';

            NCRollQuotation.ListainsertNCTEMP.push(itemNCTEMP);
        }

        const myFormData: FormData = new FormData()
        this.files.forEach(file => {
            myFormData.append(file.name, file);
        });

        myFormData.append('objeto', JSON.stringify(NCRollQuotation));

        await this.accPersonalesService.insertNCTemp(myFormData).toPromise().then(async (res: any) => { });
    }

    async getCommission(request): Promise<any> {
        const data: any = {};

        this.QuotationData.TypeTransac = CommonMethods.textFormat(this.QuotationData.TypeTransac);

        data.NID_COTIZACION = this.quotationNumber;
        data.NBRANCH = request.NBRANCH;
        data.NPRODUCT = request.NPRODUCT;
        data.NID_TRAMITE = request.NID_TRAMITE;
        data.NTYPE_TRANSAC = this.QuotationData.TypeTransac == 'Declaracion' ? 11 : this.nTransac;
        data.NTIP_NCOMMISSION = request.TIP_COMISS;
        console.log(this.QuotationData.TypeTransac);
        await this.policyService.getCommission(data).toPromise().then(
            res => {
                this.sComissionVL = res.commisionVL;
            }
        );
    }

}
