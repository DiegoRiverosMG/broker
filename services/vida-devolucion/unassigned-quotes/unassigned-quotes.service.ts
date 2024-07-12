import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AppConfig } from '@root/app.config';
import { filter, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UnassignedQuotesService {
  private readonly urlApi: string = AppConfig.WSPD_API;

  constructor(private readonly http: HttpClient) {}

  getUnassignedLeads(request: any): Observable<any> {
    const url = `${this.urlApi}/vdp/prospecto/listado`;
    return this.http.post(url, request).pipe(
      map((response: any) => response.data),
      filter((value: any) => value.estado)
    );
  }
}
