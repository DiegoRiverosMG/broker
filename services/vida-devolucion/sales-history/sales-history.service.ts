import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '@root/app.config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root',
})
export class SalesHistoryService {
  private readonly apiUrl: string = AppConfig.WSPD_API;

  constructor(private http: HttpClient) {}

  getSalesHistory(payload: any): Observable<any> {
    const url = `${this.apiUrl}/vdp/prospecto/ventas/listado`;
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data || []));
  }

  downloadReportHistory(list: any[]): void {
    const ws = XLSX.utils.json_to_sheet(
      [
        {
          A: 'Canal',
          B: 'Cotización',
          C: 'Cliente',
          D: 'Tipo de documento',
          E: 'Número de documento',
          F: 'Póliza',
          G: 'Fecha de emisión',
          H: 'Asesor',
          I: 'Estado cotización',
        },
      ],
      {
        header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
        skipHeader: true,
      }
    );

    const listados = new Array();

    list.forEach((e: any) => {
      const object = {
        A: e.canal.replace('<SUP>', '').replace('</SUP>', ''),
        B: e.cotizacionDefinitiva,
        C: e.cliente,
        D: e.tipoDocumento,
        E: e.numeroDocumento,
        F: e.poliza,
        G: e.fechaEmision,
        H: e.asesor,
        I: e.estadoCotizacion,
      };
      listados.push(object);
    });

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

    this.saveAsExcelFile(excelBuffer, 'reporte');
  }

  getComercialEjecutives(userId: number): Observable<any> {
    const url = `${this.apiUrl}/vdp/prospecto/${userId}/ejecutivos`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(data, fileName + '_' + new Date().getTime() + '.xlsx');
  }
}
