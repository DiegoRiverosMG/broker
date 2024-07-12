import { Router } from '@angular/router';
import { SessionStorageService } from './../../../shared/services/storage/storage-service';
import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { AuthenticationService } from '../services/authentication.service';
import { throwError, Observable } from 'rxjs';
import { finalize, tap, catchError } from 'rxjs/operators';

import { UtilityService } from '@shared/services/general/utility.service';
import { AppConfig } from '@root/app.config';

@Injectable()
export class BrokerHttpInterceptor implements HttpInterceptor {
  constructor(
    private authenticationService: AuthenticationService,
    private utilityService: UtilityService,
    private sessionStorageService: SessionStorageService,
    private router: Router
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let newBody: any = req.body || {};

    const apiKey =
      sessionStorage.getItem(AppConfig.CLOUD_API_KEY_STORAGE) ?? '';

    req.headers.set('x-api-key', apiKey);

    if (
      !newBody.noBase64 &&
      req.method.toLowerCase() === 'post' &&
      !(newBody instanceof FormData)
    ) {
      if (req.url.indexOf('efacturacion') === -1) {
        newBody = { data: this.utilityService.encodeObjectToBase64(newBody) };
      }
    }

    let token = '';
    token = `Bearer ${this.authenticationService.getToken()}`;

    let authReq = req.clone({
      headers: req.headers.set('Authorization', token),
      body: newBody,
    });

    if (req.url.includes('amazonaws')) {
      authReq = req.clone({
        body: newBody,
      });
    }

    return next.handle(authReq).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
        }
      }),
      catchError((err) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            this.sessionStorageService.clearStorage();
            this.router.navigate(['/extranet/login']);
          }
          return throwError(err);
        }
        return throwError(err);
      }),
      finalize(() => {})
    );
  }
}
