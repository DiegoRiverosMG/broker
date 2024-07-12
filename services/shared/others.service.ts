import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AppConfig } from "../../../../app.config";
import { Observable } from 'rxjs';
import { EconomicActivity } from
    '../../models/shared/client-information/economic-activity';
import { GenericResponse } from '../../models/shared/generic-response'
@Injectable({
    providedIn: 'root'
})
export class OthersService {
    private Url = AppConfig.URL_API_SCTR;

    constructor(private http: HttpClient) { }
    public getEconomicActivityList(technicalActivityId: string): Observable<EconomicActivity[]> {
        let params = { technicalActivityId: technicalActivityId }
        return this.http.get<EconomicActivity[]>(this.Url + "/SharedManager/GetEconomicActivityList", { params: params });
    }
    public getTechnicalActivityList(): Observable<any> {
        return this.http.get<any>(this.Url + "/SharedManager/GetTechnicalActivityList");
    }

    public uploadFile(_fileName: string, _rootName: string, _formData: FormData): Observable<GenericResponse> {
        let data = { fileName: _fileName, rootName: _rootName };
        return this.http.post<GenericResponse>(this.Url + "/SharedManager/UploadFile", _formData, { params: data });
    }

    public downloadFile(_filePath: string): Observable<any> {
        let data = { filePath: _filePath };
        return this.http.get(this.Url + "/SharedManager/DownloadFile", { params: data, responseType: 'blob' });
    }
}
