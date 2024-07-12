import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../../../app.config';

@Injectable({
  providedIn: 'root'
})
export class ParameterSettingsService {
    private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    private Url = AppConfig.URL_API_SCTR;

    constructor(private http: HttpClient) { }

    public getTransactionsByProduct(data: any): Observable<any> {
        const body = JSON.stringify(data)
        return this.http.post(this.Url + '/Maintenance/transactionsByProduct', body, {headers: this.headers})
    }

    public getParametersByTransaction(data: any): Observable<any> {
        const body = JSON.stringify(data)
        return this.http.post(this.Url + '/Maintenance/parametersByTransaction', body, {headers: this.headers})
    }



    public getComboParametersByTransaction(data: any): Observable<any> {
        const body = JSON.stringify(data)
        return this.http.post(this.Url + '/Maintenance/comboParametersByTransaction', body, {headers: this.headers})
    }

    public insertRma(data: any): Observable<any> {
        const body = JSON.stringify(data)
        return this.http.post(this.Url + '/Maintenance/insertRma', body, {headers: this.headers})

    }

    public getRma(data : any): Observable<any> {
        const body = JSON.stringify(data)
        return this.http.post(this.Url + '/Maintenance/getRma', body, {headers: this.headers})
    }

    public getActivityList(data: any): Observable<any> {
        const body = JSON.stringify(data)
        return this.http.post(this.Url + "/Maintenance/getActivityList", body, {headers: this.headers})
    }

    public GetActivityListMovement(data: any): Observable<any> {
        const body = JSON.stringify(data)
        return this.http.post(this.Url + "/Maintenance/GetActivityListMovement", body, {headers: this.headers})
    }
    
    public insertActivities(data: any): Observable<any> {
        const body = JSON.stringify(data)
        return this.http.post(this.Url + "/Maintenance/insertActivities", body, {headers: this.headers})

    }

    public getCombActivities(data: any): Observable<any> {
        const body = JSON.stringify(data)
        return this.http.post(this.Url + "/Maintenance/getCombActivities", body, {headers: this.headers})
    }

    public insertCombActivDet(data: any): Observable<any> {
        const body = JSON.stringify(data)
        return this.http.post(this.Url + "/Maintenance/insertCombActivDet", body, {headers: this.headers})
    }

    public insertRetroactivity(data: any): Observable<any> {
        const body = JSON.stringify(data)
        return this.http.post(this.Url + "/Maintenance/insertRetroactivity", body, {headers: this.headers})

    }

    public getProfiles(data: any): Observable<any> {
        const body = JSON.stringify(data)
        return this.http.post(this.Url + '/Maintenance/getProfiles', body, {headers: this.headers})
    }

    public getProfileProduct(data: any): Observable<any> {
        const body = JSON.stringify(data)
        return this.http.post(this.Url + '/Maintenance/getProfileProduct', body, {headers: this.headers})
    }

    public getConfigDays(): Observable<any> {
        return this.http.post(this.Url + '/Maintenance/getConfigDays', {}, {headers: this.headers})

    }

    public getRetroactivityList(data: any): Observable<any> {
        const body = JSON.stringify(data)
        return this.http.post(this.Url + '/Maintenance/getRetroactivityList', body, {headers: this.headers})

    }

    public calcFinVigencia(data: any): Observable<any> {
        const params = {inicioVigencia: data}
        return this.http.get<any>(this.Url + '/Maintenance/calcFinVigencia', {params: params})
    }
    
    public GetRetroactivityMessage(data: any): Observable<any> {
        const body = JSON.stringify(data)
        return this.http.post(this.Url + '/Maintenance/GetRetroactivityMessage', body, {headers: this.headers})

    }

    public GetUserAccess(data: any): Observable<any> {
        const body = JSON.stringify(data)
        return this.http.post(this.Url + '/Maintenance/GetUserAccess', body, {headers: this.headers})

    }
    
    public getTiposRiesgo(data: any): Observable<any> {
        const body = JSON.stringify(data)
        return this.http.post(this.Url + '/Maintenance/getTiposRiesgo', body, {headers: this.headers})

    }

    public GetRmvPorcentaje(data: any): Observable<any> {
        const body = JSON.stringify(data)
        return this.http.post(this.Url + '/Maintenance/getRmvPorcentaje', body, {headers: this.headers})

    }

    public UpdatePorcentajeRMV(data: any): Observable<any> {
        const body = JSON.stringify(data)
        return this.http.post(this.Url + '/Maintenance/updatePorcentajeRMV', body, {headers: this.headers})
    }

    public GetHistorialPorcentajeRMV(data: any): Observable<any> {
        const body = JSON.stringify(data)
        return this.http.post(this.Url + '/Maintenance/getHistorialPorcentajeRMV', body, {headers: this.headers})
    }
}
