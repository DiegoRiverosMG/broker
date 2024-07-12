import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig } from '../../../../app.config';

export class InmobiliaryInterfaceMonitoringService {

    private headers = new HttpHeaders({ "Content-Type": "application/json" });
    private Url = AppConfig.URL_API_SCTR;

    constructor(private http: HttpClient) { }

    // ORIGEN
    public listarOrigen(): Observable<any> { 
        return this.http.get<any[]>(this.Url + '/Interfaz/ListarOrigen', { headers: this.headers });
    }

    // INTERFAZ
    public listarInterfaces(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/Interfaz/ListarInterfaz', data, { headers: this.headers });
    }

    // RAMOS
    public listarRamos(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/ClosingDateConfig/ListarRamos', data, { headers: this.headers });
    }

    // ESTADOS DE PROCESO
    public listarEstados(): Observable<any> {
        return this.http.get<any[]>(this.Url + '/InmoInterfaceMonitoring/ListarEstados', { headers: this.headers });
    }

    // CABECERA INTERFACES
    public listarCabeceraInterfaces(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoring/ListarCabeceraInterfaces', data, { headers: this.headers });
    }
    public listarCabeceraInterfacesRecibo(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoring/ListarCabeceraInterfacesRecibo', data, { headers: this.headers });
    }
    public listarCabeceraInterfacesSiniestro(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoring/ListarCabeceraInterfacesSiniestros', data, { headers: this.headers });
    }

    // DETALLE INTERFACES
    public listarDetalleInterfaces(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoring/ListarDetalleInterfaces', data, { headers: this.headers });
    }
    public listarDetalleInterfacesXLSX(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoring/ListarDetalleInterfacesXLSX', data, { headers: this.headers });
    }
    public listarDetalleInterfacesXLSX_CB(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoring/ListarDetalleInterfacesXLSX_CB', data, { headers: this.headers });
    }
    public listarErroresDetalle(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoring/ListarErroresDetalle', data, { headers: this.headers });
    }

    // DETALLE INTERFACES ASIENTOS CONTABLES
    public listarDetalleInterfacesAsientosContables(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoring/ListarDetalleInterfacesAsientosContables', data, { headers: this.headers });
    }
    public listarDetalleInterfacesAsientosContablesAsiento(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoring/ListarDetalleInterfacesAsientosContablesAsiento', data, { headers: this.headers });
    }
    public listarDetalleInterfacesAsientosContablesError(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoring/ListarDetalleInterfacesAsientosContablesError', data, { headers: this.headers });
    }

    // DETALLE INTERFACES EXACTUS
    public listarDetalleInterfacesExactus(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoring/ListarDetalleInterfacesExactus', data, { headers: this.headers });
    }
    public listarDetalleInterfacesExactusAsiento(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoring/ListarDetalleInterfacesExactusAsiento', data, { headers: this.headers });
    }
    public listarDetalleInterfacesExactusError(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoring/ListarDetalleInterfacesExactusError', data, { headers: this.headers });
    }

    // INSERTAR REPROCESO
    public insertarReproceso(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/Reprocess/InsertarReproceso', data, { headers: this.headers });
    }
    public insertarReprocesoAsi(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/Reprocess/InsertarReprocesoAsi', data, { headers: this.headers });
    }
    public insertarReprocesoPlanilla(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/Reprocess/InsertarReprocesoPlanilla', data, { headers: this.headers });
    }

    // TIPO BÚSQUEDA
    public listarTipoBusqueda(): Observable<any> {
        return this.http.get<any[]>(this.Url + '/InmoInterfaceMonitoring/ListarTipoBusqueda', { headers: this.headers });
    }
    public listarTipoBusquedaSI(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoring/ListarTipoBusquedaSI', data, { headers: this.headers });
    }

    // DETALLE INTERFACES PLANILLA
    public listarDetalleErroresPlanillaMasivos(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoring/ListarDetalleErroresPlanillaMasivos', data, { headers: this.headers });
    }

    // DETALLE OPERACIÓN
    public listarDetalleOperacion(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoring/listarDetalleOperacion', data, { headers: this.headers });
    }

    // DETALLE INTERFACES ASIENTOS CONTABLES ÓRDENES DE PAGO
    public listarDetalleInterfacesAsientosContablesOrdenesPago(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoringCBCO/ListarDetalleInterfacesAsientosContablesOP', data, { headers: this.headers });
    }
    public listarDetalleInterfacesAsientosContablesAsientoOrdenesPago(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoringCBCO/ListarDetalleInterfacesAsientosContablesAsientoOP', data, { headers: this.headers });
    }
    public listarDetalleInterfacesAsientosContablesErrorOrdenesPago(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoringCBCO/ListarDetalleInterfacesAsientosContablesError', data, { headers: this.headers });
    }

    // DETALLE INTERFACES EXACTUS ÓRDENES DE PAGO
    public listarDetalleInterfacesExactusOrdenesPago(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoringCBCO/ListarDetalleInterfacesExactusOP', data, { headers: this.headers });
    }
    public listarDetalleInterfacesExactusAsientoOrdenesPago(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoringCBCO/ListarDetalleInterfacesExactusAsientoOP', data, { headers: this.headers });
    }
    public listarDetalleInterfacesExactusErrorOrdenesPago(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(this.Url + '/InmoInterfaceMonitoringCBCO/ListarDetalleInterfacesExactusError', data, { headers: this.headers });
    }
}