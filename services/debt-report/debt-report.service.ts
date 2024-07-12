import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { DebtReportModel } from '../../models/debt-report/debt-report.model';
import { AppConfig } from '@root/app.config';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IDebtReport } from '../../interfaces/debt-report.interface';

@Injectable({
  providedIn: 'root',
})
export class DebtReportService {
  constructor(private readonly _http: HttpClient) {}

  getData(channel: string): Observable<Array<IDebtReport>> {
    const url = `${AppConfig.PD_API}/emission/bloqueoventasdetalle/${channel}`;
    const call: Observable<any> = this._http.get(url);
    const data: Observable<Array<IDebtReport>> = new Observable((obs) => {
      call.subscribe(
        (res: Array<IDebtReport>) => {
          obs.next(res);
          obs.complete();
        },
        (err: any) => {
          obs.error(err);
        }
      );
    });
    return data;
  }
  exportToExcel(list: DebtReportModel): void {
    if (!list?.data?.length) {
      return;
    }
    const ws = XLSX.utils.json_to_sheet(
      [
        {
          A: 'Nombre de Canal',
          B: 'Certificado',
          C: 'Contratante',
          D: 'Placa',
          E: 'Fecha de Emisión',
          F: 'Fecha Inicio de Vigencia',
          G: 'Fecha Fin de Vigencia',
          H: 'Prima Total',
          I: 'Número de Planilla',
          J: 'Estado de Planilla',
          K: 'Comprobante',
        },
      ],
      {
        header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
        skipHeader: true,
      }
    );
    console.log(list);
    const listados: Array<any> = new Array();
    list?.data
      ?.filter((x) => x.aplicaDeuda?.toLowerCase() === 'si')
      .forEach((e) => {
        const object = {
          A: e.nombreCanal,
          B: e.certificado,
          C: e.contratante,
          D: e.placa,
          E: e.fechaEmision,
          F: e.fechaInicioVigencia,
          G: e.fechaFinVigencia,
          H: e.primaTotal * 1,
          I: e.numeroPlanilla,
          J: e.estadoPlanilla,
          K: e.comprobante,
        };

        listados.push(object);
      });

    XLSX.utils.sheet_add_json(ws, listados, {
      skipHeader: true,
      origin: 'A2',
    });

    const workbook: XLSX.WorkBook = {
      Sheets: { data: ws },
      SheetNames: ['data'],
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      bookSST: false,
      type: 'array',
    });

    this.saveAsExcelFile(excelBuffer);
  }
  private saveAsExcelFile(buffer: any): void {
    const data: Blob = new Blob([buffer], {
      type: 'application/octet-stream',
    });
    const date = new Date();
    FileSaver.saveAs(
      data,
      'reporte_' +
        `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}` +
        '.xlsx'
    );
  }
}
