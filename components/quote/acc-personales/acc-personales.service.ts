import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../../../../app.config';
import { ClientInformationService } from '../../../services/shared/client-information.service';
import { PolicyemitService } from '../../../services/policy/policyemit.service';
import { QuotationService } from '../../../services/quotation/quotation.service';
import { AccPersonalesConstants } from './core/constants/acc-personales.constants';
import { CommonMethods } from '../../common-methods';

@Injectable()
export class AccPersonalesService {
    CONSTANTS: any = AccPersonalesConstants;
    private Url = AppConfig.URL_API_SCTR;
    private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    constructor(
        private http: HttpClient,
        private clientInformationService: ClientInformationService,
        private policyemitService: PolicyemitService,
        private quotationService: QuotationService,) {
        this.CONSTANTS.RAMO = CommonMethods.branchXproduct(JSON.parse(localStorage.getItem('codProducto'))['productId']);
    }

    public getBranchesList(params: any): Observable<any[]> {
        return this.clientInformationService.getBranch(params.branchId);
    }

    public getProductList(params: any): Observable<any[]> {
        return this.clientInformationService.getProductList(params.productId, params.epsId, this.CONSTANTS.RAMO);
    }

    public getProductsListByBranch(params: any): Observable<any[]> {
        return this.clientInformationService.getProductsListByBranch(params.branch);
    }

    public getProductListForBranch(params: any): Observable<any[]> {
        return this.clientInformationService.getProductListForBranch(params.branch);
    }

    public getQuotationStatusList(params: any): Observable<any[]> {
        return this.quotationService.getStatusList(params.certype, params.productId);
    }

    public getQuotationReasonList(params: any): Observable<any[]> {
        return this.quotationService.getReasonList(params.code, params.branch);
    }

    public calcularCotizador(params: any): Observable<any> {
        params.noBase64 = true;
        return this.http.post(this.Url + '/QuotationManager/ReCalcularTrama', params);
    }

    public calcularCotizadorSinTrama(params: any): Observable<any> {
        params.noBase64 = true;
        return this.http.post(this.Url + '/QuotationManager/CalcularPrima', params);
    }

    public reenviarDPS(params: any): Observable<any> {
        params.noBase64 = true;
        return this.http.post(this.Url + '/QuotationManager/ResendDPS', params);
    }

    public calcularCotizadorConCoberturas(params: any): Observable<any> {
        params.noBase64 = true;
        return this.http.post(this.Url + '/QuotationManager/ReCalcularPrima', params);
    }
    public calcularCotizadorConCoberturasSinTrama(params: any): Observable<any> {
        params.noBase64 = true;
        return this.http.post(this.Url + '/QuotationManager/ReCalcularPrimaPol', params);
    }

    public getModalidad(params: any): Observable<any> {
        params.noBase64 = true;
        return this.http.post(this.Url + '/QuotationManager/GetModalidad', params, { headers: this.headers });
    }

    public getTiposPlan(params: any): Observable<any> {
        params.noBase64 = true;
        return this.http.post(this.Url + '/QuotationManager/GetTypePlan', params, { headers: this.headers });
    }

    public getTiposComision(): Observable<any> {
        return this.http.post(this.Url + '/QuotationManager/GetListComision', null);
    }

    public getTiposCoberturas(params: any): Observable<any> {
        params.noBase64 = true;
        return this.http.post(this.Url + '/QuotationManager/GetCoberturas', params, { headers: this.headers });
    }

    public getAssits(params: any): Observable<any> {
        params.noBase64 = true;
        return this.http.post(this.Url + '/QuotationManager/ListAssists', params, { headers: this.headers });
    }

    public getBenefits(params: any): Observable<any> {
        params.noBase64 = true;
        return this.http.post(this.Url + '/QuotationManager/ListBenefits', params, { headers: this.headers });
    }

    public getSurcharges(params: any): Observable<any> {
        params.noBase64 = true;
        return this.http.post(this.Url + '/QuotationManager/ListSurcharges', params, { headers: this.headers });
    }

    public getAdditionalServices(params: any): Observable<any> {
        params.noBase64 = true;
        return this.http.post(this.Url + '/QuotationManager/ListAdditionalServices', params, { headers: this.headers });
    }

    public obtenerPrimaMinima(): Observable<any> {
        return this.http.get(this.Url + '/QuotationManager/GetPremiumMin');
    }

    public emitirEvaluacion(params: any): Observable<any> {
        params.noBase64 = true;
        return this.http.post(this.Url + '/QuotationManager/EmitPolicyPol', params, { headers: this.headers });
    }

    public procesarTrama(params: any): Observable<any> {
        params.noBase64 = true;
        return this.http.post(this.Url + '/QuotationManager/ProcesarTrama', params, { headers: this.headers });
    }

    public obtenerFechasRenovacion(params: any): Observable<any> {
        return this.http.get(this.Url + '/QuotationManager/GetFechasRenovacion', { params: params });
    }

    public obtenerFormasPago(params: any): Observable<any> {
        params.noBase64 = true;
        return this.http.post(this.Url + '/SharedManager/getFormaPago', params, { headers: this.headers });
    }

    public GetAnnulment() {
        const url = this.Url + '/PolicyManager/MotivoAnulacion';
        return this.http.get(url);
    }

    public getCurrency(params: any): Observable<any[]> {
        params.nproduct = !!params.nproduct ? params.nproduct : "0";
        return this.clientInformationService.getCurrencyList(params.nbranch, params.nproduct);
    }
    public GetAlcance(params: any) {
        const url = this.Url + '/SharedManager/GetAlcance';
        return this.http.get(url, { params: params });
    }
    public GetHoras() {
        const url = this.Url + '/SharedManager/GetHoras';
        return this.http.get(url);
    }
    public GetTipoViaje() {
        const url = this.Url + '/SharedManager/GetTipoViaje';
        return this.http.get(url);
    }
    public GetDepartmentList() {
        const url = this.Url + '/SharedManager/GetDepartamentos';
        return this.http.get(url);
    }
    public GetCountryList() {
        const url = this.Url + '/SharedManager/GetCountryList';
        return this.http.get(url);
    }
    public GetTipoRenovacionGraph(params: any): Observable<any> {
        params.noBase64 = true;
        return this.http.post(this.Url + '/PolicyManager/GetTipoRenovacionGraph', params, { headers: this.headers });
    }
    public GetFrecuenciaPagoGraph(params: any): Observable<any> {
        params.noBase64 = true;
        return this.http.post(this.Url + '/PolicyManager/GetFrecuenciaPagoGraph', params, { headers: this.headers });
    }
    public GetTechnicalTariffList(params: any): Observable<any> {
        params.noBase64 = true;
        return this.http.post(this.Url + '/PolicyManager/GetTechnicalTariffList', params, { headers: this.headers });
    }
    public getEconomicActivityList(params: any): Observable<any[]> {
        return this.clientInformationService.getEconomicActivityList(params.codActividad);
    }
    public getOccupationsList(): Observable<any[]> {
        return this.clientInformationService.getOccupationsList();
    }
    public getTypesFactura(params: any): Observable<any[]> {
        return this.clientInformationService.getTypesFactura(params.nproduct, params.perfil);
    }

    public getFechaFinService(params: any): Observable<any> {
        params.noBase64 = true;
        return this.http.post(this.Url + '/SharedManager/FechaCalculada', params);
    }

    public insertNCTemp(data: FormData): Observable<any> {
        return this.http
          .post(
            this.Url + '/SharedManager/insertNCTemp', data);
    }

    public NCParcialVISA(data: FormData): Observable<any> {
        return this.http
          .post(
            this.Url + '/SharedManager/NCParcialVISA', data);
    }

    public NCParcialPF(data: FormData): Observable<any> {
        return this.http
          .post(
            this.Url + '/SharedManager/NCParcialPF', data);
    }

    public searchBroker(params: any): Observable<any> {
        return this.quotationService.searchBroker(params);
    }

    public getTipoTarifario(params: any): Observable<any> {
        params.noBase64 = true;
        return this.http.post(this.Url + '/QuotationManager/GetTipoTarifario', params, { headers: this.headers });
    }
}