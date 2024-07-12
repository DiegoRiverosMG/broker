import { Branch } from './../../models/branch/branch.model';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig } from '../../../../app.config';
import { Observable } from 'rxjs';
import { DocumentType } from '../../models/shared/client-information/document-type';
import { PersonType } from '../../models/shared/client-information/person-type';
import { Nacionality } from '../../models/shared/client-information/nationality-type';
import { Gender } from '../../models/shared/client-information/gender-type';
import { CivilStatus } from '../../models/shared/client-information/civilStatus-type';
import { Profession } from '../../models/shared/client-information/profession-type';
import { EconomicActivity } from '../../models/shared/client-information/economic-activity';
import { PhoneType } from '../../models/shared/client-information/phone-type';
import { CityCode } from '../../models/shared/client-information/city-code';
import { EmailType } from '../../models/shared/client-information/email-type';
import { DirectionType } from '../../models/shared/client-information/direction-type';
import { RoadType } from '../../models/shared/client-information/road-type';
import { InteriorType } from '../../models/shared/client-information/interior-type';
import { BlockType } from '../../models/shared/client-information/block-type';
import { CJHTType } from '../../models/shared/client-information/cjht-type';
import { Country } from '../../models/shared/client-information/country';
import { Currency } from '../../models/shared/client-information/currency-type';
import { Response } from '../../models/shared/client-information/response';
import { Tariff } from '../../models/shared/client-information/tariff';
import { ProductRP } from '../../models/product/panel/Response/ProductRP';
// import { Branch } from '../../models/branch/branch.model';
import { State } from '../../models/shared/client-information/state';
import { Mortality } from '../../models/shared/client-information/mortality';
import { Contability } from '../../models/shared/client-information/contability-branch';
import { ReInsurance } from '../../models/shared/client-information/reinsurance-branch';
import { Clasification } from '../../models/shared/client-information/clasification-branch';
import { Generic } from '../../models/shared/client-information/generic-branch';
import { Sinister } from '../../models/shared/client-information/sinister-branch';
import { RechargeType } from '../../models/shared/client-information/recharge-type';
import { CoverType } from '../../models/shared/client-information/cover-type';
import { DocumentTypeSnt } from '../../models/shared/document-type-snt';
import { ProfileEsp } from '../../models/shared/client-information/Profile-Esp';
import { ActivityDesgravamen } from '../../models/shared/client-information/activity-desgravamen';
import { StateType } from '../../models/shared/client-information/state-type';
@Injectable({
  providedIn: 'root'
})
export class ClientInformationService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  private Url = AppConfig.URL_API_SCTR;

  constructor(private http: HttpClient) { }

  // INI MARC
  public invokeServiceExperia(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/ClientManager/InvokeServiceExperia', body, {
      headers: this.headers
    });
  }

  public getCreditHistory(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/ClientManager/GetCreditHistory', body, {
      headers: this.headers
    });
  }

  public getMailFE(): Observable<any> {
    return this.http.get(this.Url + '/SharedManager/GetMailFE');
  }

  public getDocumentTypeSntList(): Observable<DocumentTypeSnt[]> {
    return this.http.get<DocumentTypeSnt[]>(this.Url + '/SharedManager/GetDocumentTypeSntList');
  }

  public getCurrencyDescription(NCODIGINT: any): Observable<any> {
    const _params = { NCODIGINT: NCODIGINT };
    return this.http.get(this.Url + '/SharedManager/GetCurrencyDescription', { params: _params });
  }

  public getRechargeDescription(NCODREC: any): Observable<any> {
    const _params = { NCODREC: NCODREC };
    return this.http.get(this.Url + '/SharedManager/GetRechargeDescription', { params: _params });
  }

  public getCoverTypeList(): Observable<CoverType[]> {
    return this.http.get<CoverType[]>(this.Url + '/SharedManager/GetCoverTypeList');
  }

  public gettRechargeTypeList(): Observable<RechargeType[]> {
    return this.http.get<RechargeType[]>(this.Url + '/SharedManager/GetRechargeTypeList');
  }

  public getSinisterList(): Observable<Sinister[]> {
    return this.http.get<Sinister[]>(this.Url + '/SharedManager/GetSinisterList');
  }

  public getGenericList(): Observable<Generic[]> {
    return this.http.get<Generic[]>(this.Url + '/SharedManager/GetGenericList');
  }

  public getClasificationList(): Observable<Clasification[]> {
    return this.http.get<Clasification[]>(this.Url + '/SharedManager/GetClasificationList');
  }

  public getReInsuranceList(): Observable<ReInsurance[]> {
    return this.http.get<ReInsurance[]>(this.Url + '/SharedManager/GetReInsuranceList');
  }

  public getContabilityList(): Observable<Contability[]> {
    return this.http.get<Contability[]>(this.Url + '/SharedManager/GetContabilityList');
  }

  public getMortalityList(): Observable<Mortality[]> {
    return this.http.get<Mortality[]>(this.Url + '/SharedManager/GetMortalityList');
  }

  public getStateList(): Observable<State[]> {
    return this.http.get<State[]>(this.Url + '/SharedManager/GetStateList');
  }

  public getBranch(branchId?: string): Observable<Branch[]> {
    const params = { branch: branchId };
    return this.http.get<Branch[]>(this.Url + '/SharedManager/GetBranchList', { params: params });
  }

  public getBranches(productId: string, epsId: string): Observable<any> {
    const params = { productId: productId, epsId: epsId };
    return this.http.get<Branch[]>(this.Url + '/SharedManager/GetBranches', { params: params });

  }

  public getProductsListByBranch(P_NBRANCH: string): Observable<ProductRP[]> {
    const params = { P_NBRANCH: P_NBRANCH };
    return this.http.get<ProductRP[]>(this.Url + '/SharedManager/GetProductsListByBranch', { params: params });
  }
  public getDocumentTypeList(codProducto: any): Observable<DocumentType[]> {
    const params = { codProducto: codProducto };
    return this.http.get<DocumentType[]>(this.Url + '/SharedManager/GetDocumentTypeList', { params: params });
  }

  public getProfileEsp(): Observable<ProfileEsp[]> {
    return this.http.get<ProfileEsp[]>(this.Url + '/SharedManager/GetProfileEsp');
  }

  public getPersonTypeList(): Observable<PersonType[]> {
    return this.http.get<PersonType[]>(this.Url + '/SharedManager/GetPersonTypeList');
  }
  public getNationalityList(): Observable<Nacionality[]> {
    return this.http.get<Nacionality[]>(this.Url + '/SharedManager/GetNationalityList');
  }
  public getGenderList(): Observable<Gender[]> {
    return this.http.get<Gender[]>(this.Url + '/SharedManager/GetGenderList');
  }
  public getCivilStatusList(): Observable<CivilStatus[]> {
    return this.http.get<CivilStatus[]>(this.Url + '/SharedManager/GetCivilStatusList');
  }
  public getProfessionList(): Observable<Profession[]> {
    return this.http.get<Profession[]>(this.Url + '/SharedManager/GetProfessionList');
  }
  public getTechnicalActivityList(codProducto?: any): Observable<any> {
    const params = { codProducto: codProducto };
    return this.http.get<any>(this.Url + '/SharedManager/GetTechnicalActivityList', { params: params });
  }
  public getEconomicActivityList(technicalActivityId: string): Observable<EconomicActivity[]> {
    const params = { technicalActivityId: technicalActivityId };
    return this.http.get<EconomicActivity[]>(this.Url + '/SharedManager/GetEconomicActivityList', { params: params });
  }
  public getOccupationsList(): Observable<EconomicActivity[]> {
    return this.http.get<EconomicActivity[]>(this.Url + '/SharedManager/GetOccupationsList');
  }
  //------------------------------------------------------
  public GetActivityDesgravamenList(): Observable<ActivityDesgravamen[]> {
    return this.http.get<ActivityDesgravamen[]>(this.Url + '/SharedManager/GetActivityDesgravamenList');
  }
  //------------------------------------------------------
  public getPhoneTypeList(): Observable<PhoneType[]> {
    return this.http.get<PhoneType[]>(this.Url + '/SharedManager/GetPhoneTypeList');
  }
  public getCityCodeList(): Observable<CityCode[]> {
    return this.http.get<CityCode[]>(this.Url + '/SharedManager/GetCityCodeList');
  }
  public getEmailTypeList(): Observable<EmailType[]> {
    return this.http.get<EmailType[]>(this.Url + '/SharedManager/GetEmailTypeList');
  }
  public getDirectionTypeList(): Observable<DirectionType[]> {
    return this.http.get<DirectionType[]>(this.Url + '/SharedManager/GetDirectionTypeList');
  }
  public getRoadTypeList(): Observable<RoadType[]> {
    return this.http.get<RoadType[]>(this.Url + '/SharedManager/GetRoadTypeList');
  }
  public getInteriorTypeList(): Observable<InteriorType[]> {
    return this.http.get<InteriorType[]>(this.Url + '/SharedManager/GetInteriorTypeList');
  }
  public getBlockTypeList(): Observable<BlockType[]> {
    return this.http.get<BlockType[]>(this.Url + '/SharedManager/GetBlockTypeList');
  }
  public getCJHTTypeList(): Observable<CJHTType[]> {
    return this.http.get<CJHTType[]>(this.Url + '/SharedManager/GetCJHTTypeList');
  }
  public getCountryList(): Observable<Country[]> {
    return this.http.get<Country[]>(this.Url + '/SharedManager/GetCountryList');
  }
  public getCurrencyList(nbranch: string = "0", nproduct: string = "0"): Observable<Currency[]> {
    const params = { nbranch: nbranch, nproduct: nproduct };
    return this.http.get<Currency[]>(this.Url + '/SharedManager/GetCurrencyList', { params: params });
  }
  public getCiiuList(): Observable<any[]> {
    return this.http.get<any[]>(this.Url + '/SharedManager/GetCiiuList');
  }
  public getProductList(productId: string = '', epsId: string = '', branch: string = ''): Observable<any[]> {
    const params = { productId: productId, epsId: epsId, branch: branch };
    return this.http.get<any[]>(this.Url + '/SharedManager/GetProducts', { params: params });
  }

  public getProductListForBranch(branch: string = ''): Observable<any[]> {
    const params = { branch: branch };
    return this.http.get<any[]>(this.Url + '/SharedManager/GetListProductsForBranch', { params: params });
  }
  public getContactTypeList(data: Response): Observable<any> {
    const request = JSON.stringify(data);
    return this.http.post(this.Url + '/SharedManager/GetContactTypeList', request, {
      headers: this.headers
    });
  }
  public getVariables(key: string): Observable<String> {
    const params = { key: key };
    return this.http.get<String>(this.Url + '/SharedManager/GetVariables', { params: params });
  }
  public valPhone(data: Response): Observable<any> {
    const request = JSON.stringify(data);
    return this.http.post(this.Url + '/SharedManager/ValPhone', request, {
      headers: this.headers
    });
  }
  public ValCiiu(data: Response): Observable<any> {
    const request = JSON.stringify(data);
    return this.http.post(this.Url + '/SharedManager/ValCiiu', request, {
      headers: this.headers
    });
  }
  public ValEmail(data: Response): Observable<any> {
    const request = JSON.stringify(data);
    return this.http.post(this.Url + '/SharedManager/ValEmail', request, {
      headers: this.headers
    });
  }
  public ValStreet(data: Response): Observable<any> {
    const request = JSON.stringify(data);
    return this.http.post(this.Url + '/SharedManager/ValStreet', request, {
      headers: this.headers
    });
  }
  public ValContact(data: Response): Observable<any> {
    const request = JSON.stringify(data);
    return this.http.post(this.Url + '/SharedManager/ValContact', request, {
      headers: this.headers
    });
  }
  public getCliente360(data: any): Observable<any> {
    const request = JSON.stringify(data);
    return this.http.post(this.Url + '/QuotationManager/GesCliente360', request, {
      headers: this.headers
    });
  }
  public getTariff(data: Tariff): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/QuotationManager/GetTariff', body, {
      headers: this.headers
    });
  }
  public insertQuotation(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/QuotationManager/InsertQuotation', body, {
      headers: this.headers
    });
  }
  public getTypesFactura(codProducto: any, perfil: any): Observable<any> {
    return this.http.get<any[]>(this.Url + '/SharedManager/GetTypeFactura?codProducto=' + codProducto + '&perfil=' + parseInt(perfil));
  }

  public GetUserProfile(product, usercode): Observable<any> {
    return this.http.get<any[]>(this.Url + '/SharedManager/GetUserProfile?product=' + product + '&usercode=' + usercode,
     {
       headers: this.headers
      });
  }

  public getProviderList(data: any): Observable<any> {
    const request = JSON.stringify(data);
    return this.http.post(this.Url + '/ProviderManager/getProviderList', request, {
      headers: this.headers
    });
  }

  public insProvider(data: any): Observable<any> {
    const request = JSON.stringify(data);
    return this.http.post(this.Url + '/ProviderManager/insProvider', request, {
      headers: this.headers
    });
  }

  public updProvider(data: any): Observable<any> {
    const request = JSON.stringify(data);
    return this.http.post(this.Url + '/ProviderManager/updProvider', request, {
      headers: this.headers
    });
  }

  public getTypeProviderList(cod_tabla: any): Observable<any[]> {
    const params = { cod_tabla: cod_tabla };
    return this.http.get<any[]>(this.Url + '/ProviderManager/getTypeProviderList', { params: params });
  }

  public deltProvider(data: any): Observable<any> {
    const request = JSON.stringify(data);
    return this.http.post(this.Url + '/ProviderManager/deltProvider', request, {
      headers: this.headers
    });
  }

  public GetBrkDepartamento(nbranch, nproduct): Observable<any> {
    return this.http.post<any[]>(this.Url + '/SharedManager/GetBrokerDepartamento?nbranch=' + nbranch + '&nproduct=' + nproduct,
     {
       headers: this.headers
      });
  }

  public GetBrkObl(nbranch): Observable<any> {
    return this.http.post<any[]>(this.Url + '/TransactManager/GetBrokerObl?nbranch=' + nbranch,
     {
       headers: this.headers
      });
  }

  public getNotaCreditoList(P_CONTRATANTE: any, P_REC_NC: any, P_TIPO: any, P_TIPO_MONEDA: any, P_PRIMA: any): Observable<any> {
    return this.http.get<any[]>(this.Url + '/SharedManager/GetNotaCreditoList?P_CONTRATANTE=' + P_CONTRATANTE+'&P_REC_NC='+P_REC_NC + '&P_TIPO='+P_TIPO+'&P_TIPO_MONEDA='+P_TIPO_MONEDA+'&P_PRIMA='+P_PRIMA);
  }

  public getStateTypeList(): Observable<StateType[]> {
    return this.http.get<StateType[]>(this.Url + '/SharedManager/GetStateTypeList');
  }

  public getOccupationTypeList(): Observable<any[]> {
    return this.http.get<any[]>(this.Url + '/SharedManager/GetOccupationTypeList');
  }

}