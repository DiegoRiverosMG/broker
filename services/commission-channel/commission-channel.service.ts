import { Injectable } from '@angular/core';
import { ConfigService } from '../../../../shared/services/general/config.service';
import {
  ChannelSales,
  PuntoVentas,
  Estados,
  Monedas,
  Ramo,
  Productos,
  EstadoL,
  Listado,
} from '../../models/commission-channel/commission-channel.model';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { HttpClient, HttpHeaders } from '@angular/common/http';
const EXCEL_EXTENSION = '.xlsx';
@Injectable({
  providedIn: 'root',
})
export class CommisionCoService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  _baseUrl = '';

  constructor(private http: HttpClient, private configService: ConfigService) {
    this._baseUrl = configService.getWebApiURL();
  }

  exportarExcel(json: any[], excelFileName: string): void {
    const ws = XLSX.utils.json_to_sheet(
      [
        {
          A: 'Ramo',
          B: 'Producto',
          C: 'Planilla',
          D: 'Póliza',
          E: 'Tipo de intermediario',
          F: 'Canal',
          G: 'Nro. Comprobante',
          H: 'Fecha de inicio de vigencia',
          I: 'Fecha fin de vigencia',
          J: 'Fecha de emisión del comprobante',
          K: 'Fecha de pago',
          L: 'Tipo moneda',
          M: 'Prima total',
          N: 'Prima neta',
          O: 'Porcentaje',
          P: 'Comisión Neta',
          Q: 'Estado',
          R: 'Fecha de disponibilización',
          S: 'Recibo',
          T: 'Lote',
          U: 'Pendiente',
          V: 'Enviado a aprobacion',
          W: 'Devuelto',
          X: 'Aprobado',
          Y: 'Listo para pago',
          Z: 'Liquidado',
          AA: 'Anulado',
        },
      ],
      {
        header: [
          'A',
          'B',
          'C',
          'D',
          'E',
          'F',
          'G',
          'H',
          'I',
          'J',
          'K',
          'L',
          'M',
          'N',
          'O',
          'P',
          'Q',
          'R',
          'S',
          'T',
          'U',
          'V',
          'W',
          'X',
          'Y',
          'Z',
          'AA',
        ],
        skipHeader: true,
      }
    );

    const listados = [];
    for (let i = 0; i < json.length; i++) {
      const object = {
        A: json[i].ramo,
        B: json[i].producto,
        C: json[i].idJob,
        D: json[i].numeroPoliza,
        E: json[i].tipoIntermediario,
        F: json[i].canal,
        G: json[i].comprobante,
        H: json[i].fechaInicio,
        I: json[i].fechaFin,
        J: json[i].fechaFacturacion || '-',
        K: json[i].fechaPago,
        L: json[i].moneda,
        M: parseFloat(json[i].primaTotal),
        N: parseFloat(json[i].primaNeta),
        O: parseFloat(json[i].porcentajeComision),
        P: parseFloat(json[i].montoComision),
        Q: json[i].estadoComision,
        R: json[i].fechaDisponibilizacion || '-',
        S: json[i].numeroRecibo,
        T: json[i].idLote || '-',
        U: json[i].pendiente || '-',
        V: json[i].enviadoAprobacion || '-',
        W: json[i].devuelto || '-',
        X: json[i].aprobado || '-',
        Y: json[i].listoParaPago || '-',
        Z: json[i].liquidado || '-',
        AA: json[i].anulado || '-',
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
  getChannel(channelSales: ChannelSales) {
    const body = {
      data: btoa(JSON.stringify(channelSales)),
    };
    return this.http
      .post(this._baseUrl + '/ChannelSales/', body, { headers: this.headers })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  getPuntoVentas(puntoVentas: PuntoVentas) {
    const body = {
      data: btoa(JSON.stringify(puntoVentas)),
    };
    return this.http
      .post(this._baseUrl + '/ChannelPoint/', body, { headers: this.headers })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  getEstados(estados: Estados) {
    const body = {
      data: btoa(JSON.stringify(estados)),
    };
    return this.http
      .post(this._baseUrl + '/CommissionLot/getcommissionstate/', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  getCurrency(monedas: Monedas) {
    const body = {
      data: btoa(JSON.stringify(monedas)),
    };
    return this.http
      .post(this._baseUrl + '/Currency/getCurrency/', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  getbranch(ramo: Ramo) {
    const body = {
      data: btoa(JSON.stringify(ramo)),
    };
    return this.http
      .post(this._baseUrl + '/Tool/getbranch', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  getproducts(productos: Productos) {
    const body = {
      data: btoa(JSON.stringify(productos)),
    };
    return this.http
      .post(this._baseUrl + '/Tool/getproducts', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  getcommissionlotstate(estadoL: EstadoL) {
    const body = {
      data: btoa(JSON.stringify(estadoL)),
    };
    return this.http
      .post(this._baseUrl + '/CommissionLot/getcommissionlotstate', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  getListado(listado: Listado) {
    const body = {
      data: btoa(JSON.stringify(listado)),
    };
    return this.http
      .post(this._baseUrl + '/Commission/reporte', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }
}
