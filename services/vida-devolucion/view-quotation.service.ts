import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AppConfig } from '@root/app.config';

@Injectable({
  providedIn: 'root',
})
export class ViewQuotationService {
  plataformaDigitalApi: string = AppConfig.WSPD_API;

  constructor(private readonly http: HttpClient) {}
}
