import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AppConfig } from 'app/app.config';
import { Parameters } from '@root/layout/broker/components/bandeja-solicitudes/shared/models/request-tray.model';
import { IResponse, Response } from '@shared/interfaces/response.interface';

@Injectable({
  providedIn: 'root'
})
export class BandejaSolicitudesService {
  private readonly apiUrl: string = AppConfig.WSPD_API;

  /**
   * The constructor function for the service.
   * @param http: HttpClient Inject the httpclient service into this class
   * @return An instance of the class
   */
  constructor(private readonly http: HttpClient) {
  }

  /**
   * The getParameters function returns an observable of the parameters for a request.
   * @return An object with the following structure:
   */
  getParameters(): Observable<Response<Parameters>> {
    const url: string = `${this.apiUrl}/solicitud/parametros`;
    return this.http.get(url).pipe(
      map((response: any) => {
        const transformResponse = {
          ...response.data,
          data: new Parameters(response.data)
        };
        delete transformResponse.listadoDocumentos;
        delete transformResponse.listadoEstados;
        delete transformResponse.listadoMotivos;
        return transformResponse;
      })
    );
  }

  /**
   * The getRequests function is used to get a list of requests from the API.
   * @param filters Filter the requests by status, date range and/or user
   * @return An observable of type any[]
   */
  getRequests(filters): Observable<IResponse> {
    const url: string = `${this.apiUrl}/solicitud/listado`;
    return this.http.post(url, filters).pipe(
      map((response: any) => response.data)
    );
  }

  /**
   * The getDetail function is used to get the details of a specific request.
   * @param requestID Get the detail of a specific request
   * @return An object with the following structure:
   */
  getDetail(requestID): Observable<any> {
    const url: string = `${this.apiUrl}/solicitud/ver/${requestID}`;
    return this.http.get(url).pipe(
      map((response: any) => response.data)
    );
  }

  /**
   * The getLogHistory function returns an observable of the log history for a given request.
   * @param requestID Get the history of a specific request
   * @return An array of objects, each one with the following structure:
   */
  getLogHistory(requestID): Observable<any> {
    const url: string = `${this.apiUrl}/solicitud/historial/${requestID}`;
    return this.http.get(url).pipe(
      map((response: any) => response.data)
    );
  }

  /**
   * The saveRequest function sends a POST request to the API with the payload   *
   * @param payload Send the data to the backend,
   * @return An observable of any type
   */
  saveRequest(payload): Observable<any> {
    const fd: FormData = new FormData();
    fd.set('solicitud', payload.request);
    fd.set('archivo', payload.file);

    const url: string = `${this.apiUrl}/solicitud/registrar`;
    return this.http.post(url, fd).pipe(
      map((response: any) => response.data)
    );
  }

  /**
   * The cancelRequest function sends a POST request to the API server,
   * which cancels a request.
   * @param payload Send the data to the backend
   * @return An observable, so you need to subscribe to it
   */
  cancelRequest(payload): Observable<IResponse> {
    const url: string = `${this.apiUrl}/solicitud/anular`;
    return this.http.post(url, payload).pipe(
      map((response: any) => response.data)
    );
  }

  /**
   * The approveRequest function sends a POST request to the API server,
   * which will accept the user's request.
   * @param payload Send the data to the backend
   * @return An observable<any>;
   */
  approveRequest(payload): Observable<any> {
    const url: string = `${this.apiUrl}/solicitud/aprobar`;
    return this.http.post(url, payload).pipe(
      map((response: any) => response.data)
    );
  }

  /**
   * The rejectRequest function sends a POST request to the API with the payload
   * containing the id of the request that is going to be rejected.
   * @param payload Send the data to the backend
   * @return An observable that emits a single value, the http response body transformed into an object
   */
  rejectRequest(payload): Observable<any> {
    const url: string = `${this.apiUrl}/solicitud/rechazar`;
    return this.http.post(url, payload).pipe(
      map((response: any) => response.data)
    );
  }

  /**
   * The sendToTechnique function sends a request to the backend with the id of a given request and
   * the id of a user.
   * The function returns an observable that will be resolved when it receives
   * a response from the backend.
   * @param payload: {
      idSolicitud: string - Send the id of the request to be sent to technical support
   *  idUsuario: string - Identify the user who is sending the request
   * }
   * @return An observable of type IResponse, which is an interface that contains the data property
   */
  sendToTechnique(payload: {
    idSolicitud: string,
    idUsuario: string
  }): Observable<IResponse> {
    const url: string = `${this.apiUrl}/solicitud/enviarTecnica`;
    return this.http.post(url, payload).pipe(
      map((response: any) => response.data)
    );
  }

  /**
   * The getBrands function returns an observable of type IResponse.
   * @return An Observable<IResponse>
   */
  getBrands(): Observable<IResponse> {
    const url: string = `${this.apiUrl}/backoffice/mantenimiento/marcas`;
    return this.http.get(url).pipe(
      map((response: any) => response.data)
    );
  }

  /**
   * The getClasses function is used to get the classes of a vehicle.
   * @param payload: {
   *  idCanal: string
   *  idMarca: string
   *  modelo: string
   * }
   * @return An array of objects, each object has an id and a name
   */
  getClasses(payload: {
    idCanal: string,
    idMarca: string,
    modelo: string
  }): Observable<IResponse> {
    const url: string = `${this.apiUrl}/soat/clases`;
    return this.http.post(url, payload).pipe(
      map((response: any) => response.data)
    );
  }

  /**
   * The getModels function returns an observable of type IResponse.
   * @param brandId: string Get the models of a specific brand
   * @return An observable that contains an array of objects
   */
  getModels(brandId: string): Observable<IResponse> {
    const url: string = `${this.apiUrl}/backoffice/mantenimiento/modelos/${brandId}`;
    return this.http.get(url).pipe(
      map((response: any) => response.data)
    );
  }

  /**
   * The getVersions function returns an observable of type IResponse.
   * @param modelId: string Get the versions of a specific model
   * @return An array of objects with the following structure:
   */
  getVersions(modelId: string): Observable<IResponse> {
    const url: string = `${this.apiUrl}/backoffice/mantenimiento/versiones/${modelId}`;
    return this.http.get(url).pipe(
      map((response: any) => response.data)
    );
  }
}
