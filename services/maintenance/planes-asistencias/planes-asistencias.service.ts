import { Injectable } from '@angular/core'
import { HttpClient,  HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfig } from '../../../../../app.config';

@Injectable({
  providedIn: 'root'
})
export class PlanesAsistenciasService {

  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  private url = AppConfig.URL_API_SCTR;

  constructor(private http: HttpClient) {}

  public Habilitar(NPOLIZA:number,NORDEN:number){
    let params = new HttpParams().set("NPOLIZA",NPOLIZA.toString()).set("NORDEN",NORDEN.toString()).set("NOPCION","1");
    return this.http.get(this.url + "/PlanesAsistMaintenance/Habilitar", {headers:this.headers,params:params});

  }
  public Inhabilitar(NPOLIZA:number,NORDEN:number){
    let params = new HttpParams().set("NPOLIZA",NPOLIZA.toString()).set("NORDEN",NORDEN.toString()).set("NOPCION","2");
    return this.http.get(this.url + "/PlanesAsistMaintenance/Habilitar", {headers:this.headers,params:params});
  }
  public GetBranchList(): Observable<any> {
    const _params = {};
    return this.http.get(this.url + "/PlanesAsistMaintenance/GetBranchList", 
    {
      params: _params,
    });
  }
  public GetServicesList(): Observable<any> {
    const _params = {};
    return this.http.get(this.url + "/PlanesAsistMaintenance/GetServices", 
    {
      params: _params,
    });
  }
  public GetRolesList(): Observable<any> {
    let params = new HttpParams()
    return this.http.get(this.url + "/PlanesAsistMaintenance/GetRoles", 
    { headers:this.headers,params: params});
  }
  
  public GetProductsList(data): Observable<any> {
    console.log('data: '+data);
    /*let datajson=JSON.stringify(data) ;
    console.log(datajson);*/
    let params = new HttpParams().set("nBranch",data);
    return this.http.get(this.url + "/PlanesAsistMaintenance/GetProductsList", {headers:this.headers,params:params});
  }

  public GetTypeComiDif(data): Observable<any> {
    console.log(data);
    let params = new HttpParams().set("nFilter",data);
    return this.http.get(this.url + "/PlanesAsistMaintenance/GetTypeComiDif", {headers:this.headers,params:params});
  }

  public GetGroupByTypeComiDif (data): Observable<any> {
    console.log(data);
    let params = new HttpParams().set("nFilter",data);
    return this.http.get(this.url + "/PlanesAsistMaintenance/GetGroupByTypeComiDif", {headers:this.headers,params:params});
  }
  
  public GetGrupoList(data: any): Observable<any> {
    const _params = {};
    return this.http.get(this.url + "/PlanesAsistMaintenance/GetGrupoList",  data);
  }
  public GetCampos(tipo:any,grupo:any): Observable<any> {
    console.log("|tipo:"+tipo+"|grupo"+grupo+"|");
    let params = new HttpParams().set("ntipo",tipo).set("ngrupo",grupo);
    return this.http.get(this.url + "/PlanesAsistMaintenance/GetCampos", {headers:this.headers,params:params});
  }
  public GetServicioXPlan(data: any): Observable<any> {

      return this.http.post(this.url + '/PlanesAsistMaintenance/GetServicioXPlan', data,
          {
              headers: this.headers
          });
  }
  public GetPlanesAsistenciasXPoliza(data: any): Observable<any> {

      return this.http.post(this.url + '/PlanesAsistMaintenance/GetPlanesAsistenciasA', data,
          {
              headers: this.headers
          });
  }
  public GetPlanList(poliza:number,ramo:number,producto:number): Observable<any> {
    let params = new HttpParams()
      .set("poliza",poliza.toString())
      .set("ramo",ramo.toString())
      .set("producto",producto.toString());
    return this.http.get(this.url + "/PlanesAsistMaintenance/GetPlan", 
    {headers:this.headers,params:params});
  }
  public GetCoverAdicional(ramo: any,producto: any): Observable<any> {
    let params = new HttpParams()
    .set("ramo",ramo)
    .set("producto",producto);
      return this.http.get(this.url + '/PlanesAsistMaintenance/GetCoverAdicional', {headers:this.headers,params:params});
  }
  public setListaPlanes(data: any): Observable<any> {
    
    let params = new HttpParams()
    .set("data",data.data)
    .set("NUSERCODE",data.NUSERCODE)
    .set("producto",data.producto)
    .set("ramo",data.ramo)
    .set("poliza",data.poliza);
      return this.http.get(this.url + '/PlanesAsistMaintenance/setListaPlanes', {headers:this.headers,params:params});
  }
  public ActualizaPlan(data: any): Observable<any> {
    
    let params = new HttpParams()
    .set("data",data.data)
    .set("NUSERCODE",data.NUSERCODE)
    .set("producto",data.producto)
    .set("ramo",data.ramo)
    .set("poliza",data.poliza);
      return this.http.get(this.url + '/PlanesAsistMaintenance/ActualizaPlan', {headers:this.headers,params:params});
  }
  public ValidaPoliza(data: any): Observable<any> {

      return this.http.post(this.url + '/PlanesAsistMaintenance/ValidaPoliza', data,
          {
              headers: this.headers
          });
  }

//INI <RQ2024-57 - 03/04/2024>
    public GetTipBusquedaList(): Observable<any> {
        const _params = {};
        return this.http.get(this.url + "/PlanesAsistMaintenance/GetTipBusquedaList", 
        {
        params: _params,
        });
    }

    public GetDivisorList(): Observable<any> {
        let params = new HttpParams()
        return this.http.get(this.url + "/PlanesAsistMaintenance/GetDivisorList", 
        { headers:this.headers,params: params});
    }

   /* public setListaTasa(data: any): Observable<any> {
        
        let params = new HttpParams()
        .set("NBRANCH",data.NBRANCH)
        .set("NPRODUCT",data.NPRODUCT)
        .set("NPOLICY",data.NPOLICY)
        .set("NMODULO",data.NMODULO)
        .set("NROL",data.NROL)
        .set("DINIVIG",data.DINIVIG)
        .set("DFINVIG",data.DFINVIG)
        .set("NMINCREDITO",data.NMINCREDITO)
        .set("NMAXCREDITO",data.NMAXCREDITO)
        .set("NTASACLIENTE",data.NTASACLIENTE)
        .set("NTASACOMPANIA",data.NTASACOMPANIA)
        .set("NDIVISOR",data.NDIVISOR)
        .set("NUSERCODE",data.NUSERCODE);

        console.log('envio de data params: '+params)
        return this.http.get(this.url + '/PlanesAsistMaintenance/setListaTasa', {headers:this.headers,params:params});
    }*/

    public setListaTasa(idata: any): Observable<any> {
        return this.http.post(
          this.url + '/PlanesAsistMaintenance/setListaTasa',
          idata,
          { headers: this.headers }
        );
    }

    public getEdiTasaPol(data: any): Observable<any> {
        
        let params = new HttpParams()
        .set("nBranch",data.ramo)
        .set("nProduct",data.producto)
        .set("nPolicy",data.poliza);
        return this.http.post(this.url + "/PlanesAsistMaintenance/getEdiTasaPol",data, {headers:this.headers});
    }
//FIN <RQ2024-57 - 03/04/2024>

}