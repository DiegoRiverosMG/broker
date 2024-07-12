import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { HttpClient } from '@angular/common/http';
import {
  IlistadoQRRequest,
  IlistadoQRResponse,
  IanularQRResquest,
  IanularQRResponse,
  IhistorialResponse,
  IdescargarReporteReponse,
  QRIndividualRequest,
  QRIndividualResponse,
  IdescargarQRResponse,
  IgenerarQRResponse,
} from '../../models/generacion-qr/generacion-qr.model';
import { Observable } from 'rxjs';
import { AppConfig } from '@root/app.config';
const EXCEL_EXTENSION = '.xlsx';
@Injectable({
  providedIn: 'root',
})
export class GeneracionQrService {
  private api: string;
  constructor(private readonly _http: HttpClient) {
    this.api = AppConfig.PD_API;
  }

  exportarExcel(json: any[], excelFileName: string): void {
    const ws = XLSX.utils.json_to_sheet(
      [
        {
          A: 'ID Proceso',
          B: 'Cantidad de Trabajadores',
          C: 'Fecha de Registro',
          D: 'Usuario',
          E: 'Estado',
        },
      ],
      {
        header: ['A', 'B', 'C', 'D', 'E', 'F'],
        skipHeader: true,
      }
    );

    const listados = [];
    for (let i = 0; i < json.length; i++) {
      const object = {
        A: json[i].idProceso,
        B: json[i].cantidadTrabajadores,
        C: json[i].fechaRegistro,
        D: json[i].usuario,
        E: json[i].estado,
      };
      listados.push(object);
    }
    XLSX.utils.sheet_add_json(ws, listados, { skipHeader: true, origin: 'A2' });
    const workbook: XLSX.WorkBook = {
      Sheets: { data: ws },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      bookSST: false,
      type: 'array',
    });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(
      data,
      fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
    );
  }

  listarQR(request: IlistadoQRRequest): Observable<IlistadoQRResponse> {
    const url = this.api + '/QR/listado';
    const call = this._http.post(url, request);
    return new Observable((obs) => {
      call.subscribe(
        (response: IlistadoQRResponse) => {
          obs.next(response);
          obs.complete();
        },
        (error: any) => {
          obs.error(error);
        }
      );
    });
  }

  anularQR(
    idProceso: string,
    idUsuario: string
  ): Observable<IanularQRResponse> {
    const url = this.api + '/QR/anular/' + idProceso + '/' + idUsuario;
    const call = this._http.delete(url);
    return new Observable((obs) => {
      call.subscribe(
        (response: IanularQRResponse) => {
          obs.next(response);
          obs.complete();
        },
        (error: any) => {
          obs.error(error);
        }
      );
    });
  }

  historialQR(idProceso: number): Observable<IhistorialResponse> {
    const url = this.api + '/QR/historial/' + idProceso;
    const call = this._http.get(url);
    return new Observable((obs) => {
      call.subscribe(
        (response: IhistorialResponse) => {
          obs.next(response);
          obs.complete();
        },
        (error: any) => {
          obs.error(error);
        }
      );
    });
  }

  descargarReporte(idProceso: number): Observable<IdescargarReporteReponse> {
    const url = this.api + '/QR/reporte/' + idProceso;
    const call = this._http.get(url);
    return new Observable((obs) => {
      call.subscribe(
        (response: IdescargarReporteReponse) => {
          obs.next(response);
          obs.complete();
        },
        (error: any) => {
          obs.error(error);
        }
      );
    });
  }

  qrIndividual(request: QRIndividualRequest): Observable<QRIndividualResponse> {
    const url = this.api + '/QR/qrindividual';
    const call = this._http.post(url, request);
    return new Observable((obs) => {
      call.subscribe(
        (response: QRIndividualResponse) => {
          obs.next(response);
          obs.complete();
        },
        (error: any) => {
          obs.error(error);
        }
      );
    });
  }

  descargarQR(idProceso: number): Observable<IdescargarQRResponse> {
    const url = this.api + '/qr/zip/' + idProceso;
    const call = this._http.get(url);
    return new Observable((obs) => {
      call.subscribe(
        (response: IdescargarQRResponse) => {
          obs.next(response);
          obs.complete();
        },
        (error: any) => {
          obs.error(error);
        }
      );
    });
  }

  generacionQR(data: any): Observable<any> {
    const fd: FormData = new FormData();
    fd.set('tipo', data.tipo.toString());
    fd.set('idUsuario', data.idUsuario.toString());
    fd.set('individual', JSON.stringify(data.individual));
    fd.set('file', data.file || null);
    const url = this.api + '/QR/generar';
    const call = this._http.post(url, fd);
    return new Observable((obs) => {
      call.subscribe(
        (response: IgenerarQRResponse) => {
          obs.next(response);
          obs.complete();
        },
        (error: any) => {
          obs.error(error);
        }
      );
    });
  }
}
