import { AppConfig } from "../../../../../app.config";
import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Life_coverRequest } from '../../../models/maintenance/cover/request/life_coverRequest';
import { CoverGen_BM } from '../../../models/maintenance/cover/request/coverGen_bm';
import { CoverRateBM } from '../../../models/maintenance/cover/request/cover-rate-bm';

@Injectable({
    providedIn: 'root'
})

export class CoverService {
    private headers = new HttpHeaders({ "Content-Type": "application/json" });
    private url = AppConfig.URL_API_SCTR;

    constructor(private http: HttpClient){}
 
    public getCoverEspCorrelative(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.url + '/CoverManager/GetCoverEspCorrelative', body , {
            headers: this.headers
        });
    }

    public getCoverGenByCode(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.url + '/CoverManager/GetCoverGenByCode', body , {
            headers: this.headers
        });
    }

    public getCoverRateByCode(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.url + '/CoverManager/GetCoverRateByCode', body , {
            headers: this.headers
        });
    }

    public insertRateDetail(coverRateBM: CoverRateBM): Observable<any> {
        const body = JSON.stringify(coverRateBM);
        return this.http.post(this.url + "/CoverManager/InsertRateDetail", body, {
            headers: this.headers
        });
    }

    public GetCoverRateList(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.url + '/CoverManager/GetCoverRateList', body , {
            headers: this.headers
        });
    }

    public getCoverEspByCoverGen(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.url + '/CoverManager/GetCoverEspByCoverGen', body , {
            headers: this.headers
        });
    }

    public getCoverEspByCover(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.url + '/CoverManager/GetCoverEspByCover', body , {
            headers: this.headers
        });
    }

    public getCoverEspCode(life_cover: Life_coverRequest) : Observable<any> {
        const body = JSON.stringify(life_cover);
        return this.http.post(this.url + "/CoverManager/GetCoverEspCode", body, {
            headers: this.headers
        });
    }

    public updateStateCoverGen(_covergen: CoverGen_BM): Observable<any> {
        const body = JSON.stringify(_covergen);
        return this.http.post(this.url + "/CoverManager/UpdateStateCoverGen", body, {
            headers: this.headers
        });
    }

    public GetCoverGenList(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.url + '/CoverManager/GetCoverGenList', body , {
            headers: this.headers
        });
    }

    public insertCoverGeneric(life_cover: Life_coverRequest): Observable<any> {
        const body = JSON.stringify(life_cover);
        return this.http.post(this.url + "/CoverManager/InsertCoverGeneric", body, {
            headers: this.headers
        });
    }
    
    public insertModuleDetail(life_cover: Life_coverRequest): Observable<any> {
        const body = JSON.stringify(life_cover);
        return this.http.post(this.url + "/CoverManager/InsertModuleDetail", body, {
            headers: this.headers
        });
    }

    public GetCoverList(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.url + '/CoverManager/GetCoverList', body , {
            headers: this.headers
        });
    }
}