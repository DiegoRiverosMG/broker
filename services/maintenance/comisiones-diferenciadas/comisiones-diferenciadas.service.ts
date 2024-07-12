import { Injectable } from '@angular/core'
import { HttpClient,  HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfig } from '../../../../../app.config';

@Injectable({
  providedIn: 'root'
})
export class ComisionesDiferenciadasService {

  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  private url = AppConfig.URL_API_SCTR;

  constructor(private http: HttpClient) {}

  public Habilitar(NPOLIZA:number){
    let params = new HttpParams().set("NPOLIZA",NPOLIZA.toString()).set("NOPCION","1");
    return this.http.get(this.url + "/comisDifMaintenance/Habilitar", {headers:this.headers,params:params});

  }
  public Inhabilitar(NPOLIZA:number){
    let params = new HttpParams().set("NPOLIZA",NPOLIZA.toString()).set("NOPCION","2");
    return this.http.get(this.url + "/comisDifMaintenance/Habilitar", {headers:this.headers,params:params});
  }
  public GetBranchList(): Observable<any> {
    const _params = {};
    return this.http.get(this.url + "/comisDifMaintenance/GetBranchList", 
    {
      params: _params,
    });
  }
  public GetSAList(): Observable<any> {
    const _params = {};
    return this.http.get(this.url + "/comisDifMaintenance/GetSAList", 
    {
      params: _params,
    });
  }

  public GetProductsList(data): Observable<any> {
    console.log(data);
    /*let datajson=JSON.stringify(data) ;
    console.log(datajson);*/
    let params = new HttpParams().set("nBranch",data);
    return this.http.get(this.url + "/comisDifMaintenance/GetProductsList", {headers:this.headers,params:params});
  }

  public GetTypeComiDif(data): Observable<any> {
    console.log(data);
    let params = new HttpParams().set("nFilter",data);
    return this.http.get(this.url + "/comisDifMaintenance/GetTypeComiDif", {headers:this.headers,params:params});
  }

  public GetGroupByTypeComiDif (data): Observable<any> {
    console.log(data);
    let params = new HttpParams().set("nFilter",data);
    return this.http.get(this.url + "/comisDifMaintenance/GetGroupByTypeComiDif", {headers:this.headers,params:params});
  }
  
  public GetGrupoList(data: any): Observable<any> {
    const _params = {};
    return this.http.get(this.url + "/comisDifMaintenance/GetGrupoList",  data);
  }
  public GetCampos(tipo:any,grupo:any): Observable<any> {
    console.log("|tipo:"+tipo+"|grupo"+grupo+"|");
    let params = new HttpParams().set("ntipo",tipo).set("ngrupo",grupo);
    return this.http.get(this.url + "/comisDifMaintenance/GetCampos", {headers:this.headers,params:params});
  }
  public GetComisDifConfigsXPoliza(data: any): Observable<any> {

      return this.http.post(this.url + '/comisDifMaintenance/GetComisDifConfigsA', data,
          {
              headers: this.headers
          });
  }
  public ValidaPoliza(data: any): Observable<any> {

      return this.http.post(this.url + '/comisDifMaintenance/ValidaPoliza', data,
          {
              headers: this.headers
          });
  }
  public EliminaConfig(data: any): Observable<any> {

      return this.http.post(this.url + '/comisDifMaintenance/EliminaConfig', data,
          {
              headers: this.headers
          });
  }
  public getModulos(data: any): Observable<any> {
    let params = new HttpParams()
    .set("poliza",data.poliza)
    .set("ramo",data.ramo)
    .set("producto",data.producto);
      return this.http.get(this.url + '/comisDifMaintenance/GetModulosXPol', {headers:this.headers,params:params});
  }
  public setListaComisiones(data: any): Observable<any> {
    
    let params = new HttpParams()
    .set("data",data.data)
    .set("NUSERCODE",data.NUSERCODE)
    .set("grupo",data.grupo)
    .set("producto",data.producto)
    .set("ramo",data.ramo)
    .set("tipo",data.tipo)
    .set("poliza",data.poliza);
      return this.http.get(this.url + '/comisDifMaintenance/setListaComisiones', {headers:this.headers,params:params});
  }
  public ActualizaComision(data: any): Observable<any> {
    
    let params = new HttpParams()
    .set("data",data.data)
    .set("NUSERCODE",data.NUSERCODE)
    .set("grupo",data.grupo)
    .set("producto",data.producto)
    .set("ramo",data.ramo)
    .set("tipo",data.tipo)
    .set("poliza",data.poliza);
      return this.http.get(this.url + '/comisDifMaintenance/ActualizaComision', {headers:this.headers,params:params});
  }
}