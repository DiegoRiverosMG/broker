/**********************************************************************************************/
/*  NOMBRE              :   creditNote.Service.TS                                               */
/*  DESCRIPCION         :   Capa Services                                                       */
/*  AUTOR               :   MATERIAGRIS - FRANCISCO AQUIÑO RAMIREZ                              */
/*  FECHA               :   20-12-2021                                                          */
/*  VERSION             :   1.0 - Generación de NC - PD                                         */
/*************************************************************************************************/

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {
  HttpClient,
  HttpHeaders,
  HttpClientModule,
} from '@angular/common/http';
import { AppConfig } from '../../../../app.config';
import { formatDate } from '@angular/common';
import { Color, defaultColors } from 'ng2-charts';

@Injectable({
  providedIn: 'root',
})
export class CreditNoteService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  private Url = AppConfig.URL_API_SCTR;
  constructor(private http: HttpClient) {}
  //Obtener Lista de Ramos
  public GetBranchesPremiumReport(): Observable<any> {   
    const _params = {}  
    return this.http.get(this.Url + '/ReportKuntur/', {
      params: _params });
  }
  //Obtener Lista de Productos
  // public GetProductPremiumReport(data:any): Observable<any> {
  //   const _params = {IdBranch:data }; 
  //   return this.http.get(this.Url + '/ReportKuntur/', {
  //      params: _params });
  // }
  //Obtener Lista de Ramos
  public getBranchTypesList(): Observable<any> {
    return this.http.get<any[]>(this.Url + '/NoteCredit/Branches');
  }

  // Lista los tipos de documento
  public getDocuTypesList(): Observable<any> {
    return this.http.get<any[]>(this.Url + '/NoteCredit/GetDocumentTypeList');
  }

  // Lista los tipos de comprobante de pago
  public getBillTypeList(): Observable<any> {
    return this.http.get<any[]>(this.Url + '/NoteCredit/GetBillTypeList');
  }

  //Obtener Lista de Productos
  public GetProductPremiumReport(idata: any): Observable<any> {
    const data = JSON.stringify(idata);
    return this.http.post(
      this.Url + '/NoteCredit/GetProductsListByBranch',
      data,
      { headers: this.headers }
    );
  }

  //Obtener Lista de masivos
  public GetParameter(idata: any): Observable<any> {
    const data = JSON.stringify(idata);
    return this.http.post(this.Url + '/NoteCredit/GetParameter', data, {
      headers: this.headers,
    });
  }

  public getOpenDevComPago(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/NoteCredit/GetOpenDevPago', body, {
      headers: this.headers,
    });
  }
  // busca y lista los recibos para devolver
  public getListPremiumDev(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/NoteCredit/GetListPremium', data, {
      headers: this.headers,
    });
  }

  public pruebas(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/NoteCredit/pruebas', data, {
      headers: this.headers,
    });
  }

  public getListReciDev(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/NoteCredit/GetListReciDev', body, {
      headers: this.headers,
    });
  }

  public getListDetRecDev(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/NoteCredit/GetListDetRecDev', data, {
      headers: this.headers,
    });
  }

  public getFilaResi(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/NoteCredit/GetFilaResi', data, {
      headers: this.headers,
    });
  }
  
  // evalua la opcion de carga masiva //migrantes 12/09/2023
  public valCargaMasiva(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/NoteCredit/valCargaMasiva', data, {
      headers: this.headers,
    });
  }

  // inserta los datos del excel a la tabla //migrantes 12/09/2023
  public insertarTrama(data: FormData): Observable<any> {
    return this.http.post(this.Url + '/NoteCredit/insertarTrama', data);
  }

  // evalua la opcion de carga masiva //migrantes 12/09/2023
  public genNcMasiva(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/NoteCredit/genNcMasiva', data, {
      headers: this.headers,
    });
  }

}
