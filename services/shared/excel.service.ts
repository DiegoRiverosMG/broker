import { Injectable } from '@angular/core';
import { Workbook } from 'exceljs';
import { formatDate } from '@angular/common';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
const EXCEL_TYPE =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet application/vnd.ms-excel;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

// Funcion para Convertir a fecha DD/MM/YYY" 
function convertToDate(dateString) {

    if (dateString == null || dateString == '' || dateString == "null" || dateString == "") {

        return '';


    } else {

        let d = dateString.split("/");
        let dat = new Date(d[2] + '/' + d[1] + '/' + d[0]);
        return dat;
    }


}
/*Funcion para GUARDAR EXCEL con Hora-minuto-segundo*/
var DiaExcel = new Date();
const formatDateeExcel = (DiaExcel_datetime) => {

    let formatted_hour = ("0" + DiaExcel_datetime.getHours());
    let formatted_minutes = ("0" + DiaExcel_datetime.getMinutes());
    let formatted_seconds = ("0" + DiaExcel_datetime.getSeconds());

    var hora = formatted_hour.slice(-2);
    var minuto = formatted_minutes.slice(-2);
    var segundo = formatted_seconds.slice(-2);

    let formatted_date = hora + minuto + segundo;
    return formatted_date;
}

@Injectable({
    providedIn: 'root'
})
export class ExcelService {

    constructor() { }

    public generateInsuredPolicyExcel(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Producto',
                    B: 'Movimiento',
                    C: 'Inico Vigencia',
                    D: 'Fin Vigencia',
                    E: 'Nro Póliza',
                    F: 'Asegurado',
                    G: 'Contratante',
                    H: 'Sede',
                    I: 'Broker'
                }
            ],
            {
                header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
                skipHeader: true
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].Product,
                B: json[i].Movement,
                C: formatDate(json[i].StartDate, 'dd/MM/yyyy', 'en-US'),
                D: formatDate(json[i].StartDate, 'dd/MM/yyyy', 'en-US'),
                E: json[i].PolicyNumber,
                F: json[i].InsuredData,
                G: json[i].ContractorData,
                H: json[i].ContractorLocation,
                I: json[i].BrokerData
            };

            listados.push(object);
        }
        /* Write data starting at A2 */
        XLSX.utils.sheet_add_json(ws, listados, {
            skipHeader: true,
            origin: 'A2'
        });

        const workbook: XLSX.WorkBook = {
            Sheets: { data: ws },
            SheetNames: ['data']
        };
        const excelBuffer: any = XLSX.write(workbook, {
            bookType: 'xlsx',
            bookSST: false,
            type: 'array'
        });
        this.saveAsExcelFile(excelBuffer, excelFileName);
    }
    public generatePolicyTransactionExcel(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Producto',
                    B: 'Movimiento',
                    C: 'Nro Operación',
                    D: 'Nro Póliza',
                    E: 'Tipo Doc Contratante',
                    F: 'Nro Doc Contratante',
                    G: 'Contratante',
                    H: 'Tipo Doc Broker',
                    I: 'Nro Doc Broker',
                    J: 'Broker',
                    K: 'Nro Proforma',
                    L: 'Monto Prima Neta',
                    M: 'Fecha Transacción',
                }
            ],
            {
                header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'],
                skipHeader: true
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].Product,
                B: json[i].Movement,
                C: json[i].OperationNumber,
                D: json[i].PolicyNumber,
                E: json[i].ContractorDocumentType,
                F: json[i].ContractorDocumentNumber,
                G: json[i].ContractorFullName,
                H: json[i].BrokerDocumentType,
                I: json[i].BrokerDocumentNumber,
                J: json[i].BrokerFullName,
                K: json[i].ProformaNumber,
                L: json[i].NetPremium,
                M: formatDate(json[i].TransactionDate, 'dd/MM/yyyy', 'en-US'),
            };

            listados.push(object);
        }
        XLSX.utils.sheet_add_json(ws, listados, {
            skipHeader: true,
            origin: 'A2'
        });

        const workbook: XLSX.WorkBook = {
            Sheets: { data: ws },
            SheetNames: ['data']
        };
        const excelBuffer: any = XLSX.write(workbook, {
            bookType: 'xlsx',
            bookSST: false,
            type: 'array'
        });
        this.saveAsExcelFile(excelBuffer, excelFileName);
    }

    public generateReportATPExcel(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'POLIZA',
                    B: 'NOMBRES',
                    C: 'TIPO DOCUMENTO',
                    D: 'NRO DOCUMENTO',
                    E: 'NACIMIENTO',
                    F: 'SUMA ASEGURADA FALLECIMIENTO NATURAL',
                    G: 'SUMA ASEGURADA FALLECIMIENTO ACCIDENTAL',
                    H: 'PRIMERA PRIMA',
                    I: 'PRIMA MENSUAL',
                    J: 'PRIMERA PRIMA ANUAL',
                    // I: "PRIMA ANUAL",
                    // J: "PRIMERA PRIMA",
                    K: 'MONTO DE PRIMAS',
                    // K: "ABONO",
                    L: 'EXTORNO ANUAL',
                    M: 'EXTORNO PRIMAS',
                    N: 'ABONO',
                    O: 'FECHA INICIO VIGENCIA',
                    P: 'FECHA EMISION',
                    Q: 'TEMPORALIDAD',
                    R: 'MONEDA',
                    S: 'POR DEVOLUCION',
                    T: 'SEXO',
                    U: 'CUOTAS VENCIDAS',
                    // S: "¿VIGENTE?",
                    V: 'CUOTAS PAGADAS',
                    W: 'ESTADO DE PÓLIZA',
                    X: 'FECHA FIN VIGENCIA',
                    Y: 'FECHA FALLECIMIENTO',
                    Z: 'NRO RECIBO',
                    AA: 'NRO BOLETA',
                    AB: 'ESTADO DE BOLETA SUNAT',
                    AC: 'FECHA DE EMISIÓN DE BOLETA',
                    // AA: "EXTORNO",
                    AD: 'MONEDA DE EXTORNO',
                    // AC: "MONTO DE PRIMAS",
                    AE: 'MONTO DEVOLUCIÓN',
                    AF: 'DOC. ASESOR VENTA',
                    AG: 'ASESOR DE VENTA',
                    AH: 'DOC. ASESOR MANT',
                    AI: 'ASESOR DE MANTENIMIENTO',
                    AJ: 'COMISIÓN',
                    AK: 'FECHA DE ANULACIÓN',
                    AL: 'EXTORNO DE COMISIÓN'
                }
            ],
            {
                header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL'],
                skipHeader: true
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].POLIZA,
                B: json[i].NOMBRES,
                C: json[i].TIPO_DOCUMENTO,
                D: json[i].NRO_DOCUMENTO,
                E: json[i].NACIMIENTO,
                F: json[i].SUMA_ASEGURADA_COVER1,
                G: json[i].SUMA_ASEGURADA_COVER2,
                H: json[i].PRIMERA_PRIMA,
                I: json[i].PRIMA_MENSUAL,
                J: json[i].PRIMA_ANUAL,
                // J: json[i].PRIMERA_PRIMA,
                // K: json[i].ABONO,
                K: json[i].MONTO_PRIMAS,
                L: json[i].EXTORNO_ANUAL,
                M: json[i].EXTORNO,
                N: json[i].ABONO,
                O: json[i].FECHA_INICIO_VIGENCIA,
                P: json[i].FECHA_EMISION,
                Q: json[i].TEMPORALIDAD,
                R: json[i].MONEDA,
                S: json[i].POR_DEVOLUCION,
                T: json[i].COD_SEXO,
                U: json[i].CUOTAS_VENCIDAS,
                // S: json[i].VIGENTE,
                V: json[i].CUOTAS_PAGADAS,
                W: json[i].ESTADO_POLIZA,
                X: json[i].FECHA_FIN_VIGENCIA,
                Y: json[i].FECHA_FALLECIMIENTO,
                Z: json[i].NRO_RECIBO,
                AA: json[i].NRO_BOLETA,
                AB: json[i].ESTADO_BOLETA,
                AC: json[i].FECHA_BOLETA,
                // AA: json[i].EXTORNO,
                AD: json[i].MONEDA_EXTORNO,
                // AC: json[i].MONTO_PRIMAS,
                AE: json[i].MONTO_DEVOLUCION,
                AF: json[i].DOC_ASESOR_VENTA,
                AG: json[i].ASESOR_VENTA,
                AH: json[i].DOC_ASESOR_MANT,
                AI: json[i].ASESOR_MANT,
                AJ: json[i].COMISION,
                AK: json[i].FECHA_ANULACION,
                AL: json[i].EXTORNO_COMISION
            };

            listados.push(object);
        }
        XLSX.utils.sheet_add_json(ws, listados, {
            skipHeader: true,
            origin: 'A2'
        });

        const workbook: XLSX.WorkBook = {
            Sheets: { data: ws },
            SheetNames: ['data']
        };
        const excelBuffer: any = XLSX.write(workbook, {
            bookType: 'xlsx',
            bookSST: false,
            type: 'array'
        });
        this.saveAsExcelFile(excelBuffer, excelFileName);
    }

    public generateReportClaimATPExcel(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'DOC. CONTRATANTE',
                    B: 'CONTRATANTE',
                    C: 'POLIZA',
                    D: 'PRODUCTO',
                    E: 'PERIODICIDAD',
                    F: 'INICIO DE VIGENCIA',
                    G: 'FIN DE VIGENCIA',
                    H: 'SUMA ASEGURADA FALLECIMIENTO NATURAL',
                    I: 'SUMA ASEGURADA FALLECIMIENTO ACCIDENTAL',
                    J: 'MONEDA',
                    K: 'PERÍODO DE GRACIA',
                    L: 'BENEFICIARIOS',
                    M: 'ESTADO DE COBRO',
                    N: 'FECHA ESTADO',
                    O: 'NRO. RECIBO',
                    P: 'NRO. COMPROBANTE',
                    Q: 'PRIMA MENSUAL',
                    R: 'ESTADO POLIZA',
                    S: 'FECHA ESTADO DE POLIZA',
                    T: 'FECHA EMISIÓN CARTA SUSPENSIÓN',
                    U: 'FECHA ENVÍO CARTA SUSPENSIÓN',
                    V: 'ESTADO DE ENVÍO CARTA SUSPENSIÓN',
                    W: 'FECHA SUSPENSIÓN',
                    X: 'FECHA LEVANTAMIENTO DE SUSPENSIÓN',
                    Y: 'CORREO'
                }
            ],
            {
                header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y'],
                skipHeader: true
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].DOC_CONTRATANTE,
                B: json[i].CONTRATANTE,
                C: json[i].POLIZA,
                D: json[i].PRODUCTO,
                E: json[i].PERIODICIDAD,
                F: json[i].INICIO_VIGENCIA,
                G: json[i].FIN_VIGENCIA,
                H: json[i].SUMA_ASEGURADA_COV1,
                I: json[i].SUMA_ASEGURADA_COV2,
                J: json[i].MONEDA,
                K: json[i].PERIODO_GRACIA,
                L: json[i].BENEFICIARIOS,
                M: json[i].ESTADO_COBRO,
                N: json[i].FECHA_ESTADO,
                O: json[i].NRO_RECIBO,
                P: json[i].NRO_COMPROBANTE,
                Q: json[i].PRIMA_MENSUAL,
                R: json[i].ESTADO_POLIZA,
                S: json[i].FECHA_ESTADO_POLIZA,
                T: json[i].FECHA_EMISION_SUSP,
                U: json[i].FECHA_ENVIO_SUSP,
                V: '',
                W: '',
                X: '',
                Y: json[i].CORREO
            };

            listados.push(object);
        }
        XLSX.utils.sheet_add_json(ws, listados, {
            skipHeader: true,
            origin: 'A2'
        });

        const workbook: XLSX.WorkBook = {
            Sheets: { data: ws },
            SheetNames: ['data']
        };
        const excelBuffer: any = XLSX.write(workbook, {
            bookType: 'xlsx',
            bookSST: false,
            type: 'array'
        });
        this.saveAsExcelFile(excelBuffer, excelFileName);
    }
    public generateReportPersistVDPExcel(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'DOC. ASESOR',
                    B: 'ASESOR',
                    C: '% PERSISTENCIA (3 MESES)',
                    D: 'DOC. SUPERVISOR',
                    E: 'SUPERVISOR',
                    F: '% PERSISTENCIA (3 MESES)',
                    G: 'DOC. JEFE',
                    H: 'JEFE',
                    I: '% PERSISTENCIA (3 MESES)',
                }
            ],
            {
                header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
                skipHeader: true
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].DOC_ASESOR,
                B: json[i].ASESOR,
                C: json[i].PERS_ASESOR_3,
                D: json[i].DOC_SUPER,
                E: json[i].SUPER,
                F: json[i].PERS_SUPER_3,
                G: json[i].DOC_JEFE,
                H: json[i].JEFE,
                I: json[i].PERS_JEFE_3
            };

            listados.push(object);
        }
        XLSX.utils.sheet_add_json(ws, listados, {
            skipHeader: true,
            origin: 'A2'
        });

        const workbook: XLSX.WorkBook = {
            Sheets: { data: ws },
            SheetNames: ['data']
        };
        const excelBuffer: any = XLSX.write(workbook, {
            bookType: 'xlsx',
            bookSST: false,
            type: 'array'
        });
        this.saveAsExcelFile(excelBuffer, excelFileName);
    }

    public generateErroresExcel(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Registro',
                    B: 'Descripción del error'
                }
            ],
            {
                header: ['A', 'B'],
                skipHeader: true
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].REGISTRO,
                B: json[i].DESCRIPCION
            };

            listados.push(object);
        }
        XLSX.utils.sheet_add_json(ws, listados, {
            skipHeader: true,
            origin: 'A2'
        });

        const workbook: XLSX.WorkBook = {
            Sheets: { data: ws },
            SheetNames: ['data']
        };
        const excelBuffer: any = XLSX.write(workbook, {
            bookType: 'xlsx',
            bookSST: false,
            type: 'array'
        });
        this.saveAsExcelFile(excelBuffer, excelFileName);
    }
    public generateReportVigExcel(json: any[], excelFileName: string): void {

        //CABECERA
        const header = [
            "POLIZA",
            "CONTRATANTE",
            "TIPO DOCUMENTO",
            "NRO DOCUMENTO",
            "ASEGURADO",  // PASE 11/01/2023
            "TIPO DOCUMENTO", // PASE 11/01/2023
            "NRO DOCUMENTO", // PASE 11/01/2023
            "VINCULO", // PASE 11/01/2023
            "CORREO ELECTRONICO",
            "CELULAR",
            "DIRECCIÓN",
            "DISTRITO",
            "PROVINCIA",
            "DEPARTAMENTO",
            "NACIMIENTO",
            "FECHA FALLECIMIENTO",
            "SUMA ASEGURADA FALLECIMIENTO NATURAL",
            "SUMA ASEGURADA FALLECIMIENTO ACCIDENTAL",
            "FRECUENCIA DE PAGO",
            "PRIMERA PRIMA",
            "PRIMA REGULAR",
            "PRIMA ANUAL", //CAMBIO
            "PRIMERA PRIMA ANUAL SOLES",
            "PRIMERA PRIMA ANUAL DOLARES",
            "PRIMA ANUAL RENOVACIÓN SOLES",
            "PRIMA ANUAL RENOVACIÓN DÓLARES",
            "MONTO DE PRIMAS",
            "ABONO",
            "FECHA INICIO VIGENCIA",
            "FECHA EMISIÓN",
            "TEMPORALIDAD",
            "MONEDA",
            "% POR DEVOLUCIÓN",
            "SEXO",
            "FECHA DE ÚLTIMA SUSPENSIÓN",
            "FECHA DE ÚLTIMA REHABILITACIÓN ",
            "CUOTAS VENCIDAS",
            "CUOTAS PAGADAS",
            "ESTADO DE PÓLIZA",
            "FECHA DE ANULACIÓN",
            "FECHA FIN VIGENCIA",
            "NRO RECIBO",
            "NRO BOLETA",
            "ESTADO DE BOLETA SUNAT",
            "FECHA DE EMISIÓN DE BOLETA",
            "MONTO DEVOLUCIÓN",
            "DOC.JEFE",
            "JEFE",
            "DOC.SUPERVISOR",
            "SUPERVISOR",
            "DOC. ASESOR VENTA",
            "ASESOR DE VENTA",
            "DOC. ASESOR MANT",
            "ASESOR DE MANTENIMIENTO",
            "COMISIÓN",
            "COMISIÓN PAGADA",
            "MONTO FACTURADO",
            "MONTO NO DEVENGADO",
            "ANUALIDAD",
            "NÚMERO DE MESES DEVENGADOS",
            "NÚMERO DE MESES NO DEVENGADOS",
            
        ];

        const listados = [];
        for (let i = 0; i < json.length; i++) {

            const object = {

                x1: json[i].poliza,
                x2: json[i].nombres,
                x3: json[i].tipo_documento,
                x4: json[i].nro_documento,
                x5:  json[i].nombres_ase,
                x6:  json[i].tipo_documento_ase,
                x7:  json[i].nro_documento_ase,
                x8:  json[i].parentesco,
                x9:  json[i].correo_electronico,
                x10: json[i].celular,
                x11: json[i].direccion,
                x12: json[i].distrito,
                x13: json[i].provincia,
                x14: json[i].departamento,
                x15: convertToDate(json[i].nacimiento), //FECHA
                x16: convertToDate(json[i].fecha_fallecimiento),//FECHA
                x17: json[i].suma_asegurada_cover1,//numero
                x18: json[i].suma_asegurada_cover2,//numero
                x19: json[i].frecuencia_pago,
                x20: json[i].primera_prima,//numero
                x21: json[i].prima_mensual,//numero
                x22: json[i].prima_anual,//numero
                x23: json[i].primera_prima_anual_soles,//numero
                x24: json[i].primera_prima_anual_dolares,//numero
                x25: json[i].prima_anual_renovacion_soles,//numero
                x26: json[i].prima_anual_renovacion_dolares,//numero
                x27: json[i].monto_primas,//numero
                x28: convertToDate(json[i].abono), //FECHA
                x29: convertToDate(json[i].fecha_inicio_vigencia),//FECHA
                x30: convertToDate(json[i].fecha_emision),//FECHA
                x31: json[i].temporalidad,
                x32: json[i].moneda,
                x33: json[i].por_devolucion,  
                x34: json[i].cod_sexo,
                x35: convertToDate(json[i].fecha_ultima_suspencion),//FECHA
                x36: convertToDate(json[i].fecha_ultima_rehabilitacion),//FECHA
                x37: json[i].cuotas_vencidas,
                x38: json[i].cuotas_pagadas,
                x39: json[i].estado_poliza,
                x40: convertToDate(json[i].fecha_anulacion),//FECHA
                x41: convertToDate(json[i].fecha_fin_vigencia),//FECHA
                x42: json[i].nro_recibo,
                x43: json[i].nro_boleta,
                x44: json[i].estado_boleta,
                x45: convertToDate(json[i].fecha_boleta),//FECHA
                x46: json[i].monto_devolucion, // numero
                x47: json[i].doc_jefe,
                x48: json[i].jefe,
                x49: json[i].doc_supervisor,
                x50: json[i].supervisor,
                x51: json[i].doc_asesor_venta,
                x52: json[i].asesor_venta,
                x53: json[i].doc_asesor_mant,
                x54: json[i].asesor_mant,
                x55: json[i].comision, // numero
                x56: json[i].comision_pagada, // numero
                x57: json[i].monto_facturado, // numero
                x58: json[i].monto_no_devengado, // numero
                x59: json[i].anualidad,
                x60: json[i].numero_cuotas_devengadas,
                x61: json[i].numero_meses_no_devengadas,
                
            };

            listados.push(object);
            console.log("NORMAL", json[i].fecha_fallecimiento)
            console.log("FUNCTION", convertToDate(json[i].fecha_fallecimiento))
        }

        /* Create workbook and worksheet */
        const workbook = new Workbook();
        workbook.creator = 'Vida Devolución Protecta+';
        workbook.lastModifiedBy = 'Vida Devolución Protecta+';
        workbook.created = new Date();
        workbook.modified = new Date();
        const worksheet = workbook.addWorksheet('Reporte');
        //worksheet.addRow([]);  //AGREGAR FILA
        const headerRow = worksheet.addRow(header);

        headerRow.eachCell((cell, index) => {

            /*   cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFFFFF00' },
                  bgColor: { argb: 'FF0000FF' }
              };
              cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; */
            cell.font = { size: 12, bold: true };
            worksheet.getColumn(index).width = header[index - 1].length < 20 ? 20 : header[index - 1].length;
            //TIPO DE DATO CELDA
            worksheet.getColumn(17).numFmt = '#,##0.00'
            worksheet.getColumn(18).numFmt = '#,##0.00'
            worksheet.getColumn(20).numFmt = '#,##0.00'
            worksheet.getColumn(21).numFmt = '#,##0.00'
            worksheet.getColumn(22).numFmt = '#,##0.00'
            worksheet.getColumn(23).numFmt = '#,##0.00'
            worksheet.getColumn(24).numFmt = '#,##0.00'
            worksheet.getColumn(25).numFmt = '#,##0.00'
            worksheet.getColumn(26).numFmt = '#,##0.00'
            worksheet.getColumn(27).numFmt = '#,##0.00'
            worksheet.getColumn(46).numFmt = '#,##0.00'
            worksheet.getColumn(55).numFmt = '#,##0.00'
            worksheet.getColumn(56).numFmt = '#,##0.00'
            worksheet.getColumn(57).numFmt = '#,##0.00'
            worksheet.getColumn(58).numFmt = '#,##0.00'
        });

        // Get all columns from JSON
        let columnsArray: any[];
        for (const key in listados) {
            if (listados.hasOwnProperty(key)) {
                columnsArray = Object.keys(listados[key]);
            }
        }

        // Add Data and Conditional Formatting
        listados.forEach((element: any) => {

            const eachRow = [];
            columnsArray.forEach((column) => {
                eachRow.push(element[column]);
            });

            if (element.isDeleted === 'Y') {
                const deletedRow = worksheet.addRow(eachRow);
                deletedRow.eachCell((cell) => {
                    cell.font = { name: 'Calibri', family: 4, size: 11, bold: false, strike: true };
                });
            } else {
                worksheet.addRow(eachRow);
            }
        });

        workbook.xlsx.writeBuffer().then((data: ArrayBuffer) => {
            const blob = new Blob([data], { type: EXCEL_TYPE });
            FileSaver.saveAs(blob, excelFileName + formatDateeExcel(DiaExcel) + EXCEL_EXTENSION);
        });
    }
    public generateReportAnulExcel(json: any[], excelFileName: string): void {

        //CABECERA
        const header = [
            "POLIZA",
            "CONTRATANTE",
            "TIPO DOCUMENTO",
            "NRO DOCUMENTO",
            "ASEGURADO",  // PASE 11/01/2023
            "TIPO DOCUMENTO", // PASE 11/01/2023
            "NRO DOCUMENTO", // PASE 11/01/2023
            "RELACIÓN", // PASE 11/01/2023
            "CORREO ELECTRONICO",
            "CELULAR",
            "DIRECCIÓN",
            "DISTRITO",
            "PROVINCIA",
            "DEPARTAMENTO",
            "NACIMIENTO",
            "FECHA FALLECIMIENTO",
            "SUMA ASEGURADA FALLECIMIENTO NATURAL",
            "SUMA ASEGURADA FALLECIMIENTO ACCIDENTAL",
            "FRECUENCIA DE PAGO",
            "PRIMERA PRIMA",
            "PRIMA REGULAR",
            "PRIMA ANUAL",
            "PRIMERA PRIMA ANUAL SOLES",
            "PRIMERA PRIMA ANUAL DOLARES",
            "PRIMA ANUAL RENOVACIÓN SOLES",
            "PRIMA ANUAL RENOVACIÓN DÓLARES",
            "MONTO DE PRIMAS",
            "EXTORNO ANUAL",
            "EXTORNO PRIMAS",
            "ABONO",
            "FECHA INICIO VIGENCIA",
            "FECHA EMISIÓN",
            "TEMPORALIDAD",
            "MONEDA",
            "% POR DEVOLUCIÓN",
            "SEXO",
            "FECHA DE ÚLTIMA SUSPENSIÓN",
            "FECHA DE ÚLTIMA REHABILITACIÓN ",
            "CUOTAS VENCIDAS",
            "CUOTAS PAGADAS",
            "ESTADO DE PÓLIZA",
            "FECHA FIN VIGENCIA",
            "NRO RECIBO",
            "NRO BOLETA",
            "ESTADO DE BOLETA SUNAT",
            "FECHA DE EMISIÓN DE BOLETA",
            "MONEDA DE EXTORNO",
            "MONTO DEVOLUCIÓN",
            "DOC. JEFE",
            "JEFE",
            "DOC. SUPERVISOR",
            "SUPERVISOR",
            "DOC. ASESOR VENTA",
            "ASESOR DE VENTA",
            "DOC. ASESOR MANT",
            "ASESOR DE MANTENIMIENTO",
            "COMISIÓN",
            "FECHA DE ANULACIÓN",
            "EXTORNO DE COMISIÓN",
            "COMISIÓN PAGADA",
            "MONTO FACTURADO",
            "MONTO NO DEVENGADO",
            "ANUALIDAD",
            "NOTA DE CRÉDITO",
            "FECHA DE NOTA DE CRÉDITO",
            "BOLETA ASOCIADA A NOTA DE CRÉDITO",
            "CONVENIO NEGATIVO",
            "ANULACIÓN DE CONVENIO NEGATIVO",
            "PRIMA PENDIENTE DE CASTIGO",
            "COMISIÓN PENDIENTE DE CASTIGO",
            "FECHA PLANIFICADA DE CASTIGO",
        ];

        const listados = [];
        for (let i = 0; i < json.length; i++) {

            const object = {

                x1: json[i].poliza,
                x2: json[i].nombres,
                x3: json[i].tipo_documento,
                x4: json[i].nro_documento,
                x5: json[i].nombres_ase,
                x6: json[i].tipo_documento_ase,
                x7: json[i].nro_documento_ase,
                x8: json[i].parentesco,
                x9: json[i].correo_electronico,
                x10: json[i].celular,
                x11: json[i].direccion,
                x12: json[i].distrito,
                x13: json[i].provincia,
                x14: json[i].departamento,
                x15: convertToDate(json[i].nacimiento),
                x16: convertToDate(json[i].fecha_fallecimiento),
                x17: json[i].suma_asegurada_cover1, // numero
                x18: json[i].suma_asegurada_cover2,// numero
                x19: json[i].frecuencia_pago,
                x20: json[i].primera_prima,// numero
                x21: json[i].prima_mensual,// numero
                x22: json[i].prima_anual,// numero
                x23: json[i].primera_prima_anual_soles,// numero
                x24: json[i].primera_prima_anual_dolares,// numero
                x25: json[i].prima_anual_renovacion_soles,//numero
                x26: json[i].prima_anual_renovacion_dolares,//numero
                x27: json[i].monto_primas,
                x28: json[i].extorno_anual,// numero
                x29: json[i].extorno_primas,// numero
                x30: convertToDate(json[i].abono),
                x31: convertToDate(json[i].fecha_inicio_vigencia),
                x32: convertToDate(json[i].fecha_emision),
                x33: json[i].temporalidad,
                x34: json[i].moneda,
                x35: json[i].por_devolucion,
                x36: json[i].cod_sexo,// numero
                x37: convertToDate(json[i].fecha_ultima_suspencion),
                x38: convertToDate(json[i].fecha_ultima_rehabilitacion),
                x39: json[i].cuotas_vencidas,
                x40: json[i].cuotas_pagadas,
                x41: json[i].estado_poliza,
                x42: convertToDate(json[i].fecha_fin_vigencia),
                x43: json[i].nro_recibo,
                x44: json[i].nro_boleta,
                x45: json[i].estado_boleta,
                x46: convertToDate(json[i].fecha_boleta),
                x47: json[i].moneda_extorno,
                x48: json[i].monto_devolucion,// numero
                x49: json[i].doc_jefe,
                x50: json[i].jefe,
                x51: json[i].doc_supervisor,
                x52: json[i].supervisor,
                x53: json[i].doc_asesor_venta,
                x54: json[i].asesor_venta,
                x55: json[i].doc_asesor_mant,
                x56: json[i].asesor_mant,
                x57: json[i].comision,// numero
                x58: convertToDate(json[i].fecha_anulacion),
                x59: json[i].extorno_comision,// numero
                x60: json[i].comision_pagada,// numero
                x61: json[i].monto_facturado,// numero
                x62: json[i].monto_no_devengado,// numero
                x63: json[i].anualidad,
                x64: json[i].nota_credito,
                x65: convertToDate(json[i].fecha_nota_credito),
                x66: json[i].boleta_asociada_nc,
                x67: json[i].convenio_negativo,// numero
                x68: json[i].anulación_convenio_negativo,// numero
                x69: json[i].prima_pendiente_castigo, // numero
                x70: json[i].comision_pendiente_castigo, // numero
                x71: convertToDate(json[i].fecha_planificada_castigo),
            };

            listados.push(object);
        }

        /* Create workbook and worksheet */
        const workbook = new Workbook();
        workbook.creator = 'Vida Devolución Protecta+';
        workbook.lastModifiedBy = 'Vida Devolución Protecta+';
        workbook.created = new Date();
        workbook.modified = new Date();
        const worksheet = workbook.addWorksheet('Reporte');
        //worksheet.addRow([]);  //AGREGAR FILA
        const headerRow = worksheet.addRow(header);

        headerRow.eachCell((cell, index) => {

            /*   cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFFFFF00' },
                  bgColor: { argb: 'FF0000FF' }
              };
              cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; */
            cell.font = { size: 12, bold: true };
            worksheet.getColumn(index).width = header[index - 1].length < 20 ? 20 : header[index - 1].length;
            //TIPO DE DATO CELDA
            worksheet.getColumn(17).numFmt = '#,##0.00'
            worksheet.getColumn(18).numFmt = '#,##0.00'
            worksheet.getColumn(20).numFmt = '#,##0.00'
            worksheet.getColumn(21).numFmt = '#,##0.00'
            worksheet.getColumn(22).numFmt = '#,##0.00'
            worksheet.getColumn(23).numFmt = '#,##0.00'
            worksheet.getColumn(24).numFmt = '#,##0.00'
            worksheet.getColumn(25).numFmt = '#,##0.00'
            worksheet.getColumn(26).numFmt = '#,##0.00'
            worksheet.getColumn(28).numFmt = '#,##0.00'
            worksheet.getColumn(29).numFmt = '#,##0.00'
            worksheet.getColumn(36).numFmt = '#,##0.00'
            worksheet.getColumn(48).numFmt = '#,##0.00'
            worksheet.getColumn(57).numFmt = '#,##0.00'
            worksheet.getColumn(59).numFmt = '#,##0.00'
            worksheet.getColumn(60).numFmt = '#,##0.00'
            worksheet.getColumn(61).numFmt = '#,##0.00'
            worksheet.getColumn(62).numFmt = '#,##0.00'
            worksheet.getColumn(67).numFmt = '#,##0.00'
            worksheet.getColumn(68).numFmt = '#,##0.00'
            worksheet.getColumn(69).numFmt = '#,##0.00'
            worksheet.getColumn(70).numFmt = '#,##0.00'

        });

        // Get all columns from JSON
        let columnsArray: any[];
        for (const key in listados) {
            if (listados.hasOwnProperty(key)) {
                columnsArray = Object.keys(listados[key]);
            }
        }

        // Add Data and Conditional Formatting
        listados.forEach((element: any) => {

            const eachRow = [];
            columnsArray.forEach((column) => {
                eachRow.push(element[column]);
            });

            if (element.isDeleted === 'Y') {
                const deletedRow = worksheet.addRow(eachRow);
                deletedRow.eachCell((cell) => {
                    cell.font = { name: 'Calibri', family: 4, size: 11, bold: false, strike: true };
                });
            } else {
                worksheet.addRow(eachRow);
            }
        });

        workbook.xlsx.writeBuffer().then((data: ArrayBuffer) => {
            const blob = new Blob([data], { type: EXCEL_TYPE });
            FileSaver.saveAs(blob, excelFileName + formatDateeExcel(DiaExcel) + EXCEL_EXTENSION);
        });
    }
    public generateReportTecExcel(json: any[], excelFileName: string): void {

        //CABECERA
        const header = [
            "POLIZA",
            "NOMBRES CONTRATANTE",
            "TIPO DOCUMENTO",
            "NRO DOCUMENTO",
            "NOMBRES ASEGURADO",  // PASE 11/01/2023
            "TIPO DOCUMENTO", // PASE 11/01/2023
            "NRO DOCUMENTO", // PASE 11/01/2023
            "RELACIÓN", // PASE 11/01/2023
            "NACIMIENTO",
            "SUMA ASEGURADA FALLECIMIENTO NATURAL",
            "SUMA ASEGURADA FALLECIMIENTO ACCIDENTAL",
            "FRECUENCIA DE PAGO",
            "PRIMA REGULAR",
            "PRIMA ANUAL",
            "PRIMERA PRIMA",
            "ABONO",
            "FECHA INICIO VIGENCIA",
            "FECHA EMISION",
            "TEMPORALIDAD",
            "MONEDA",
            "POR DEVOLUCION",
            "COTIZACION",
            "COD_SEXO",
            "CUOTAS VENCIDAS",
            "¿VIGENTE?"
        ];

        const listados = [];
        for (let i = 0; i < json.length; i++) {

            const object = {

                x1:  json[i].poliza,
                x2:  json[i].nombres,
                x3:  json[i].tipo_documento,
                x4:  json[i].nro_documento,
                x5:  json[i].nombres_ase,
                x6:  json[i].tipo_documento_ase,
                x7:  json[i].nro_documento_ase,
                x8:  json[i].parentesco,
                x9:  convertToDate(json[i].nacimiento),
                x10: json[i].suma_asegurada_cover1, //NUMERO
                x11: json[i].suma_asegurada_cover2, //NUMERO
                x12: json[i].frecuencia_pago,
                x13: json[i].prima_mensual, //NUMERO
                x14: json[i].prima_anual, //NUMERO
                x15: json[i].primera_prima, //NUMERO
                x16: convertToDate(json[i].abono),
                x17: convertToDate(json[i].fecha_inicio_vigencia),
                x18: convertToDate(json[i].fecha_emision),
                x19: json[i].temporalidad,
                x20: json[i].moneda,
                x21: json[i].por_devolucion,
                x22: json[i].cotizacion,
                x23: json[i].cod_sexo,
                x24: json[i].cuotas_vencidas,
                x25: json[i].vigente,
            };

            listados.push(object);
        }

        /* Create workbook and worksheet */
        const workbook = new Workbook();
        workbook.creator = 'Vida Devolución Protecta+';
        workbook.lastModifiedBy = 'Vida Devolución Protecta+';
        workbook.created = new Date();
        workbook.modified = new Date();
        const worksheet = workbook.addWorksheet('Reporte');
        //worksheet.addRow([]);  //AGREGAR FILA
        const headerRow = worksheet.addRow(header);

        headerRow.eachCell((cell, index) => {

            /*   cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFFFFF00' },
                  bgColor: { argb: 'FF0000FF' }
              };
              cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; */
            cell.font = { size: 12, bold: true };
            worksheet.getColumn(index).width = header[index - 1].length < 20 ? 20 : header[index - 1].length;
            //TIPO DE DATO CELDA
            worksheet.getColumn(10).numFmt = '#,##0.00'
            worksheet.getColumn(11).numFmt = '#,##0.00'
            worksheet.getColumn(13).numFmt = '#,##0.00'
            worksheet.getColumn(14).numFmt = '#,##0.00'
            worksheet.getColumn(15).numFmt = '#,##0.00'
        });

        // Get all columns from JSON
        let columnsArray: any[];
        for (const key in listados) {
            if (listados.hasOwnProperty(key)) {
                columnsArray = Object.keys(listados[key]);
            }
        }

        // Add Data and Conditional Formatting
        listados.forEach((element: any) => {

            const eachRow = [];
            columnsArray.forEach((column) => {
                eachRow.push(element[column]);
            });

            if (element.isDeleted === 'Y') {
                const deletedRow = worksheet.addRow(eachRow);
                deletedRow.eachCell((cell) => {
                    cell.font = { name: 'Calibri', family: 4, size: 11, bold: false, strike: true };
                });
            } else {
                worksheet.addRow(eachRow);
            }
        });

        workbook.xlsx.writeBuffer().then((data: ArrayBuffer) => {
            const blob = new Blob([data], { type: EXCEL_TYPE });
            FileSaver.saveAs(blob, excelFileName + formatDateeExcel(DiaExcel) + EXCEL_EXTENSION);
        });
    }
    public generateReportControlVDPExcel(json: any[], excelFileName: string): void {

        //CABECERA
        const header = [
            "AÑO DE VENTA",
            "MES DE VENTA",
            "N° PÓLIZA",
            "ESTADO PÓLIZA",
            "ASESOR DE MANTENIMIENTO",
            "DNI JEFE",
            "JEFE",
            "SUPERVISOR",
            "DNI SUPERVISOR",
            "ASESOR DE VENTA",
            "DNI ASESOR DE VENTA",
            "CONTRATANTE",
            "PEP",
            "DNI ",
            "FECHA DE NACIMIENTO",
            "SEXO",
            "ASEGURADO",
            "PEP",
            "DNI",
            "FECHA DE NACIMIENTO",
            "SEXO",
            "EDAD AL AÑO DE FIRMA",
            "MONEDA",
            "FRECUENCIA DE PAGO", //---------------------------
            "CUOTA INICIAL",

            "PRIMERA PRIMA ANUAL SOLES", //-CAMBIO
            "PRIMERA PRIMA ANUAL DÓLARES", //-CAMBIO
            "PRIMERA PRIMA ANUAL EN SOLES", //-CAMBIO

            "CUOTA REGULAR", //-AGREGO
            "CUOTA REGULAR MENSUAL", //-AGREGO
            "CUOTA REGULAR MENSUAL EN SOLES", //-AGREGO

            "MODALIDAD",
            "PORCENTAJE DE DEVOLUCIÓN",
            "INICIO DE VIGENCIA",
            "FECHA DE EMISIÓN",
            "NRO DE CUOTAS DE COMISIÓN",
            "FECHA DE DEPÓSITO 1 CUOTA",
            "FECHA DEPÓSITO 2 CUOTA",
            "FECHA PLANIFICADA DE PAGO DE COMISIÓN 1",
            "FECHA DEPÓSITO 3 CUOTA",
            "FECHA PLANIFICADA DE PAGO DE COMISIÓN 2",
            "FECHA DEPÓSITO 4 CUOTA",
            "FECHA PLANIFICADA DE PAGO DE COMISIÓN 3",
            "CUOTAS PAGADAS",
            "N° TOTAL DE CUOTAS",
            "PERÍODO 1",
            "FECHA DE PAGO 1",
            "PERÍODO 2",
            "FECHA DE PAGO 2",
            "PERÍODO 3",
            "FECHA DE PAGO 3",
            "PERÍODO 4",
            "FECHA DE PAGO 4",
            "MOTIVO DE ANULACIÓN",
            "FECHA DE ANULACIÓN",
        ];

        const listados = [];
        for (let i = 0; i < json.length; i++) {

            const object = {
                x1: json[i].ano_venta,
                x2: json[i].mes_venta,
                x3: json[i].nro_policy,
                x4: json[i].estado_poliza,
                x5: json[i].asesor_mant,
                x6: json[i].dni_jefe,
                x7: json[i].jefe,
                x8: json[i].supervisor,
                x9: json[i].dni_supervisor,
                x10: json[i].asesor_venta,
                x11: json[i].doc_asesor_venta,
                x12: json[i].nom_contratante,
                x13: json[i].pep,
                x14: json[i].dni_contratante,
                x15: convertToDate(json[i].fecha_nacimiento_contratante),
                x16: json[i].sexo_contratante,
                x17: json[i].nom_asegruado,
                x18: json[i].pep2,
                x19: json[i].dni_asegurado,
                x20: convertToDate(json[i].fecha_nacimiento_aseg),
                x21: json[i].sexo_asegu,
                x22: json[i].edad_año_firma, //NUMERO
                x23: json[i].moneda,
                X24: json[i].frecuencia_pago,
                x25: json[i].cuota_inicial, //NUMERO

                x26: json[i].prima_anual_soles, //-CAMBIO  //NUMERO
                x27: json[i].prima_anual_dolares, //-CAMBIO  //NUMERO
                x28: json[i].equivalente_soles, //-CAMBIO  //NUMERO

                x29: json[i].cuota_regular,  //-AGREGO  //NUMERO
                x30: json[i].cuota_regular_mensual, //-AGREGO  //NUMERO
                x31: json[i].cuota_regular_mensuales_soles, //-AGREGO //NUMERO

                x32: json[i].modalidad,
                x33: json[i].porcentaje,
                x34: convertToDate(json[i].inicio_vigencia),
                x35: convertToDate(json[i].fecha_emision),
                x36: json[i].cantidad_cuotas,
                x37: convertToDate(json[i].fecha1depos),
                x38: convertToDate(json[i].fecha2depos),
                x39: convertToDate(json[i].fecha_comision_1),
                x40: convertToDate(json[i].fecha3depos),
                x41: convertToDate(json[i].fecha_comision_2),
                x42: convertToDate(json[i].fecha4depos),
                x43: convertToDate(json[i].fecha_comision_3),
                x44: json[i].cuotas_pagadas,
                x45: json[i].ntotal_cuotas,
                x46: json[i].perido1,
                x47: convertToDate(json[i].fechapago1),
                x48: json[i].perido2,
                x49: convertToDate(json[i].fechapago2),
                x50: json[i].perido3,
                x51: convertToDate(json[i].fechapago3),
                x52: json[i].perido4,
                x53: convertToDate(json[i].fechapago4),
                x54: json[i].motivo_anulacion,
                x55: convertToDate(json[i].fecha_anulacion),
            };

            listados.push(object);
        }

        /* Create workbook and worksheet */
        const workbook = new Workbook();
        workbook.creator = 'Vida Devolución Protecta+';
        workbook.lastModifiedBy = 'Vida Devolución Protecta+';
        workbook.created = new Date();
        workbook.modified = new Date();
        const worksheet = workbook.addWorksheet('Reporte');
        //worksheet.addRow([]);  //AGREGAR FILA
        const headerRow = worksheet.addRow(header);

        headerRow.eachCell((cell, index) => {

            /*   cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFFFFF00' },
                  bgColor: { argb: 'FF0000FF' }
              };
              cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; */
            cell.font = { size: 12, bold: true };
            worksheet.getColumn(index).width = header[index - 1].length < 20 ? 20 : header[index - 1].length;
            //TIPO DE DATO CELDA
            worksheet.getColumn(22).numFmt = '#,##0.00'
            worksheet.getColumn(25).numFmt = '#,##0.00'
            worksheet.getColumn(26).numFmt = '#,##0.00'
            worksheet.getColumn(27).numFmt = '#,##0.00'
            worksheet.getColumn(28).numFmt = '#,##0.00'
            worksheet.getColumn(29).numFmt = '#,##0.00'
            worksheet.getColumn(30).numFmt = '#,##0.00'
            worksheet.getColumn(31).numFmt = '#,##0.00'
        });

        // Get all columns from JSON
        let columnsArray: any[];
        for (const key in listados) {
            if (listados.hasOwnProperty(key)) {
                columnsArray = Object.keys(listados[key]);
            }
        }

        // Add Data and Conditional Formatting
        listados.forEach((element: any) => {

            const eachRow = [];
            columnsArray.forEach((column) => {
                eachRow.push(element[column]);
            });

            if (element.isDeleted === 'Y') {
                const deletedRow = worksheet.addRow(eachRow);
                deletedRow.eachCell((cell) => {
                    cell.font = { name: 'Calibri', family: 4, size: 11, bold: false, strike: true };
                });
            } else {
                worksheet.addRow(eachRow);
            }
        });

        workbook.xlsx.writeBuffer().then((data: ArrayBuffer) => {
            const blob = new Blob([data], { type: EXCEL_TYPE });
            FileSaver.saveAs(blob, excelFileName + formatDateeExcel(DiaExcel) + EXCEL_EXTENSION);
        });
    }
    public generateReportControlDetailVDPExcel(objJ: any, excelFileName: string): void {

        //CABECERA
        const header = [
            "AÑO DE VENTA",
            "MES DE VENTA",
            "N° PÓLIZA",
            "ESTADO PÓLIZA",
            "ASESOR DE MANTENIMIENTO",
            "DNI JEFE",
            "JEFE",
            "SUPERVISOR",
            "DNI SUPERVISOR",
            "NOMBRE DEL ASESOR DE VENTA",
            "DNI ASESOR DE VENTA",
            "CONTRATANTE",
            "PEP",
            "DNI ",
            "FECHA DE NACIMIENTO",
            "SEXO",
            "ASEGURADO",
            "PEP",
            "DNI",
            "FECHA DE NACIMIENTO",
            "SEXO",
            "EDAD AL AÑO DE FIRMA",
            "MONEDA",
            "FRECUENCIA DE PAGO",//---------------------------------------------
            "CUOTA INICIAL",
            "PRIMA REGULAR",
            "PRIMA ANUAL SOLES",
            "PRIMA ANUAL DÓLARES",
            "EQUIVALENTE EN SOLES",
            "MODALIDAD",
            "PORCENTAJE DE DEVOLUCIÓN",
            "INICIO DE VIGENCIA ",
            "FECHA DE EMISIÓN",
        ];

        let i = 0
        const listados = [];
        for (i; i < objJ.reportPoliciesDetail.length; i++) {

            const object = {
                x1: objJ.reportPoliciesDetail[i].ano_venta,
                x2: objJ.reportPoliciesDetail[i].mes_venta,
                x3: objJ.reportPoliciesDetail[i].nro_policy,
                x4: objJ.reportPoliciesDetail[i].estado_poliza,
                x5: objJ.reportPoliciesDetail[i].asesor_mant,
                x6: objJ.reportPoliciesDetail[i].dni_jefe,
                x7: objJ.reportPoliciesDetail[i].jefe,
                x8: objJ.reportPoliciesDetail[i].supervisor,
                x9: objJ.reportPoliciesDetail[i].dni_supervisor,
                x10: objJ.reportPoliciesDetail[i].asesor_venta,
                x11: objJ.reportPoliciesDetail[i].doc_asesor_venta,
                x12: objJ.reportPoliciesDetail[i].nom_contratante,
                x13: objJ.reportPoliciesDetail[i].pep,
                x14: objJ.reportPoliciesDetail[i].dni_contratante,
                x15: convertToDate(objJ.reportPoliciesDetail[i].fecha_nacimiento_contratante),
                x16: objJ.reportPoliciesDetail[i].sexo_contratante,
                x17: objJ.reportPoliciesDetail[i].nom_asegruado,
                x18: objJ.reportPoliciesDetail[i].pep2,
                x19: objJ.reportPoliciesDetail[i].dni_asegurado,
                x20: convertToDate(objJ.reportPoliciesDetail[i].fecha_nacimiento_aseg),
                x21: objJ.reportPoliciesDetail[i].sexo_asegu,
                x22: objJ.reportPoliciesDetail[i].edad_año_firma,
                x23: objJ.reportPoliciesDetail[i].moneda,
                x24: objJ.reportPoliciesDetail[i].frecuencia_pago,//----------------------------
                x25: objJ.reportPoliciesDetail[i].cuota_inicial,
                x26: objJ.reportPoliciesDetail[i].prima_mensual,
                x27: objJ.reportPoliciesDetail[i].prima_anual_soles,
                x28: objJ.reportPoliciesDetail[i].prima_anual_dolares,
                x29: objJ.reportPoliciesDetail[i].equivalente_soles,
                x30: objJ.reportPoliciesDetail[i].modalidad,
                x31: objJ.reportPoliciesDetail[i].porcentaje,
                x32: convertToDate(objJ.reportPoliciesDetail[i].inicio_vigencia),
                x33: convertToDate(objJ.reportPoliciesDetail[i].fecha_emision),
            };

            listados.push(object);
        }

        /* Create workbook and worksheet */
        const workbook = new Workbook();
        workbook.creator = 'Vida Devolución Protecta+';
        workbook.lastModifiedBy = 'Vida Devolución Protecta+';
        workbook.created = new Date();
        workbook.modified = new Date();
        const worksheet = workbook.addWorksheet('Reporte');

        //worksheet.addRow([]);  //AGREGAR FILA
        const headerRow = worksheet.addRow(header);

        headerRow.eachCell((cell, index) => {

            cell.font = { size: 12, bold: true };
            worksheet.getColumn(index).width = header[index - 1].length < 20 ? 20 : header[index - 1].length;
            //TIPO DE FORMATO CELDA
            worksheet.getColumn(22).numFmt = '#,##0.00'
            worksheet.getColumn(25).numFmt = '#,##0.00'
            worksheet.getColumn(26).numFmt = '#,##0.00'
            worksheet.getColumn(27).numFmt = '#,##0.00'
            worksheet.getColumn(28).numFmt = '#,##0.00'
            worksheet.getColumn(29).numFmt = '#,##0.00'
        });

        // Get all columns from JSON
        let columnsArray1: any[];
        for (const key in listados) {
            if (listados.hasOwnProperty(key)) {
                columnsArray1 = Object.keys(listados[key]);

            }
        }

        // Add Data and Conditional Formatting
        listados.forEach((element: any) => {

            const eachRow = [];
            columnsArray1.forEach((column) => {
                eachRow.push(element[column]);
            });

            if (element.isDeleted === 'Y') {
                const deletedRow = worksheet.addRow(eachRow);
                deletedRow.eachCell((cell) => {
                    cell.font = { name: 'Calibri', family: 4, size: 11, bold: false, strike: true };
                });
            } else {
                worksheet.addRow(eachRow);
            }
        });

        //#################################################
        worksheet.addRow([]); //AGREGAR FILA VACIA
        worksheet.addRow([]);
        worksheet.addRow([]);
        worksheet.addRow([]);
        //#################################################
        //CABECERA 2
        const header2 = [

            "N° CUOTA",
            "PERIODO",
            "FECHA DE DEPÓSITO",
        ];

        let x = 0
        const listados2 = [];
        for (x; x < objJ.reportPoliciesDetailTotal.length; x++) {
            const object2 = {
                A: objJ.reportPoliciesDetailTotal[x].nro_cuota,
                B: objJ.reportPoliciesDetailTotal[x].periodo,
                C: convertToDate(objJ.reportPoliciesDetailTotal[x].fecha_deposito),
            };

            listados2.push(object2);
        }

        const headerRow2 = worksheet.addRow(header2);

        headerRow2.eachCell((cell, index) => {

            cell.font = { size: 12, bold: true };
            worksheet.getColumn(index).width = header2[index - 1].length < 20 ? 20 : header2[index - 1].length;
        });

        // Get all columns from JSON
        let columnsArray2: any[];
        for (const key in listados2) {
            if (listados2.hasOwnProperty(key)) {
                columnsArray2 = Object.keys(listados2[key]);

            }
        }

        // Add Data and Conditional Formatting
        listados2.forEach((element: any) => {

            const eachRow = [];
            columnsArray2.forEach((column) => {
                eachRow.push(element[column]);
            });

            if (element.isDeleted === 'Y') {
                const deletedRow = worksheet.addRow(eachRow);
                deletedRow.eachCell((cell) => {
                    cell.font = { name: 'Calibri', family: 4, size: 11, bold: false, strike: true };
                });
            } else {
                worksheet.addRow(eachRow);
            }
        });

        workbook.xlsx.writeBuffer().then((data: ArrayBuffer) => {
            const blob = new Blob([data], { type: EXCEL_TYPE });
            FileSaver.saveAs(blob, excelFileName + formatDateeExcel(DiaExcel) + EXCEL_EXTENSION);
        });
    }
    public generateResumenAnualPolizasVDPExcel(objJ: any, excelFileName: string): void {

        //CABECERA
        const header = [
            "Período",
            "Cantidad de pólizas",
            "Prima Anual Soles",
            "Prima Anual Dólares",
            "Prima Anual Equivalente Soles",
            "Prima Total Anual  Soles",
        ];

        let i = 0
        const listados = [];
        for (i; i < objJ.reportYear.length; i++) {

            const object = {
                A: objJ.reportYear[i].periodo,
                B: objJ.reportYear[i].cantidad_polizas,
                C: objJ.reportYear[i].prima_anual_soles,
                D: objJ.reportYear[i].prima_anual_dolares,
                E: objJ.reportYear[i].prima_anual_equivalente_soles,
                F: objJ.reportYear[i].prima_total_anual_soles,
            };

            listados.push(object);
        }

        /* Create workbook and worksheet */
        const workbook = new Workbook();
        workbook.creator = 'Vida Devolución Protecta+';
        workbook.lastModifiedBy = 'Vida Devolución Protecta+';
        workbook.created = new Date();
        workbook.modified = new Date();
        const worksheet = workbook.addWorksheet('Reporte');

        //worksheet.addRow([]);  //AGREGAR FILA
        const headerRow = worksheet.addRow(header);

        headerRow.eachCell((cell, index) => {

            cell.font = { size: 12, bold: true };
            worksheet.getColumn(index).width = header[index - 1].length < 20 ? 20 : header[index - 1].length;
            //TIPO DE FORMATO CELDA
            worksheet.getColumn(3).numFmt = '#,##0.00'
            worksheet.getColumn(4).numFmt = '#,##0.00'
            worksheet.getColumn(5).numFmt = '#,##0.00'
            worksheet.getColumn(6).numFmt = '#,##0.00'
        });

        // Get all columns from JSON
        let columnsArray1: any[];
        for (const key in listados) {
            if (listados.hasOwnProperty(key)) {
                columnsArray1 = Object.keys(listados[key]);

            }
        }
        // Add Data and Conditional Formatting
        listados.forEach((element: any) => {

            const eachRow = [];
            columnsArray1.forEach((column) => {
                eachRow.push(element[column]);
            });

            if (element.isDeleted === 'Y') {
                const deletedRow = worksheet.addRow(eachRow);
                deletedRow.eachCell((cell) => {
                    cell.font = { name: 'Calibri', family: 4, size: 11, bold: false, strike: true };
                });
            } else {
                worksheet.addRow(eachRow);
            }
        });

        //#################################################
        worksheet.addRow([]); //AGREGAR FILA VACIA
        worksheet.addRow([]);
        worksheet.addRow([]);
        worksheet.addRow([]);
        //#################################################
        //CABECERA 2
        const header2 = [
            '',
            'Cantidad de pólizas',
            'Prima Anual Soles',
            'Prima Anual Dólares',
            'Prima Anual Equivalente Soles',
            'Prima Total Anual  Soles',
        ];

        let x = 0
        const listados2 = [];
        for (x; x < objJ.reportYearTotal.length; x++) {
            const object2 = {
                A: 'Total',
                B: objJ.reportYearTotal[x].cantidad_polizas_total,
                C: objJ.reportYearTotal[x].prima_anual_soles_total,
                D: objJ.reportYearTotal[x].prima_anual_dolares_total,
                E: objJ.reportYearTotal[x].prima_anual_equivalente_soles_total,
                F: objJ.reportYearTotal[x].prima_total_anual_soles_total,
            };

            listados2.push(object2);
        }

        const headerRow2 = worksheet.addRow(header2);

        headerRow2.eachCell((cell, index) => {

            cell.font = { size: 12, bold: true };
            worksheet.getColumn(index).width = header2[index - 1].length < 20 ? 20 : header2[index - 1].length;
        });

        // Get all columns from JSON
        let columnsArray2: any[];
        for (const key in listados2) {
            if (listados2.hasOwnProperty(key)) {
                columnsArray2 = Object.keys(listados2[key]);

            }
        }

        // Add Data and Conditional Formatting
        listados2.forEach((element: any) => {

            const eachRow = [];
            columnsArray2.forEach((column) => {
                eachRow.push(element[column]);
            });

            if (element.isDeleted === 'Y') {
                const deletedRow = worksheet.addRow(eachRow);
                deletedRow.eachCell((cell) => {
                    cell.font = { name: 'Calibri', family: 4, size: 11, bold: false, strike: true };
                });
            } else {
                worksheet.addRow(eachRow);
            }
        });

        workbook.xlsx.writeBuffer().then((data: ArrayBuffer) => {
            const blob = new Blob([data], { type: EXCEL_TYPE });
            FileSaver.saveAs(blob, excelFileName + formatDateeExcel(DiaExcel) + EXCEL_EXTENSION);
        });
    }
    public generateResumenMonthPolizasVDPExcel(objJ: any, excelFileName: string): void {

        //CABECERA
        const header = [
            "Período",
            "Cantidad de pólizas",
            "Prima Anual Soles",
            "Prima Anual Dólares",
            "Prima Anual Equivalente Soles",
            "Prima Total Anual  Soles",
        ];

        let i = 0
        const listados = [];
        for (i; i < objJ.reportMonth.length; i++) {

            const object = {
                A: objJ.reportMonth[i].periodo,
                B: objJ.reportMonth[i].cantidad_polizas,
                C: objJ.reportMonth[i].prima_anual_soles,
                D: objJ.reportMonth[i].prima_anual_dolares,
                E: objJ.reportMonth[i].prima_anual_equivalente_soles,
                F: objJ.reportMonth[i].prima_total_anual_soles,
            };

            listados.push(object);
        }

        /* Create workbook and worksheet */
        const workbook = new Workbook();
        workbook.creator = 'Vida Devolución Protecta+';
        workbook.lastModifiedBy = 'Vida Devolución Protecta+';
        workbook.created = new Date();
        workbook.modified = new Date();
        const worksheet = workbook.addWorksheet('Reporte');

        //worksheet.addRow([]);  //AGREGAR FILA
        const headerRow = worksheet.addRow(header);

        headerRow.eachCell((cell, index) => {

            cell.font = { size: 12, bold: true };
            worksheet.getColumn(index).width = header[index - 1].length < 20 ? 20 : header[index - 1].length;
            //TIPO DE FORMATO CELDA
            worksheet.getColumn(3).numFmt = '#,##0.00'
            worksheet.getColumn(4).numFmt = '#,##0.00'
            worksheet.getColumn(5).numFmt = '#,##0.00'
            worksheet.getColumn(6).numFmt = '#,##0.00'
        });

        // Get all columns from JSON
        let columnsArray1: any[];
        for (const key in listados) {
            if (listados.hasOwnProperty(key)) {
                columnsArray1 = Object.keys(listados[key]);

            }
        }

        // Add Data and Conditional Formatting
        listados.forEach((element: any) => {

            const eachRow = [];
            columnsArray1.forEach((column) => {
                eachRow.push(element[column]);
            });

            if (element.isDeleted === 'Y') {
                const deletedRow = worksheet.addRow(eachRow);
                deletedRow.eachCell((cell) => {
                    cell.font = { name: 'Calibri', family: 4, size: 11, bold: false, strike: true };
                });
            } else {
                worksheet.addRow(eachRow);
            }
        });

        //#################################################
        worksheet.addRow([]); //AGREGAR FILA VACIA
        worksheet.addRow([]);
        worksheet.addRow([]);
        worksheet.addRow([]);
        //#################################################
        //CABECERA 2
        const header2 = [
            '',
            'Cantidad de pólizas',
            'Prima Anual Soles',
            'Prima Anual Dólares',
            'Prima Anual Equivalente Soles',
            'Prima Total Anual  Soles',
        ];

        let x = 0
        const listados2 = [];
        for (x; x < objJ.reportMonthTotal.length; x++) {
            const object2 = {
                A: 'Total',
                B: objJ.reportMonthTotal[x].cantidad_polizas_total,
                C: objJ.reportMonthTotal[x].prima_anual_soles_total,
                D: objJ.reportMonthTotal[x].prima_anual_dolares_total,
                E: objJ.reportMonthTotal[x].prima_anual_equivalente_soles_total,
                F: objJ.reportMonthTotal[x].prima_total_anual_soles_total,
            };

            listados2.push(object2);
        }

        const headerRow2 = worksheet.addRow(header2);

        headerRow2.eachCell((cell, index) => {

            cell.font = { size: 12, bold: true };
            worksheet.getColumn(index).width = header2[index - 1].length < 20 ? 20 : header2[index - 1].length;
        });

        // Get all columns from JSON
        let columnsArray2: any[];
        for (const key in listados2) {
            if (listados2.hasOwnProperty(key)) {
                columnsArray2 = Object.keys(listados2[key]);

            }
        }

        // Add Data and Conditional Formatting
        listados2.forEach((element: any) => {

            const eachRow = [];
            columnsArray2.forEach((column) => {
                eachRow.push(element[column]);
            });

            if (element.isDeleted === 'Y') {
                const deletedRow = worksheet.addRow(eachRow);
                deletedRow.eachCell((cell) => {
                    cell.font = { name: 'Calibri', family: 4, size: 11, bold: false, strike: true };
                });
            } else {
                worksheet.addRow(eachRow);
            }
        });

        workbook.xlsx.writeBuffer().then((data: ArrayBuffer) => {
            const blob = new Blob([data], { type: EXCEL_TYPE });
            FileSaver.saveAs(blob, excelFileName + formatDateeExcel(DiaExcel) + EXCEL_EXTENSION);
        });
    }
    public generateResumenDailyPolizasVDPExcel(objJ: any, excelFileName: string): void {

        //CABECERA
        const header = [
            "Período",
            "Cantidad de pólizas",
            "Prima Anual Soles",
            "Prima Anual Dólares",
            "Prima Anual Equivalente Soles",
            "Prima Total Anual  Soles",
        ];

        let i = 0
        const listados = [];
        for (i; i < objJ.reportDaily.length; i++) {

            const object = {
                A: objJ.reportDaily[i].periodo,
                B: objJ.reportDaily[i].cantidad_polizas,
                C: objJ.reportDaily[i].prima_anual_soles,
                D: objJ.reportDaily[i].prima_anual_dolares,
                E: objJ.reportDaily[i].prima_anual_equivalente_soles,
                F: objJ.reportDaily[i].prima_total_anual_soles,
            };

            listados.push(object);
        }

        /* Create workbook and worksheet */
        const workbook = new Workbook();
        workbook.creator = 'Vida Devolución Protecta+';
        workbook.lastModifiedBy = 'Vida Devolución Protecta+';
        workbook.created = new Date();
        workbook.modified = new Date();
        const worksheet = workbook.addWorksheet('Reporte');

        //worksheet.addRow([]);  //AGREGAR FILA
        const headerRow = worksheet.addRow(header);

        headerRow.eachCell((cell, index) => {

            cell.font = { size: 12, bold: true };
            worksheet.getColumn(index).width = header[index - 1].length < 20 ? 20 : header[index - 1].length;
            //TIPO DE FORMATO CELDA
            worksheet.getColumn(3).numFmt = '#,##0.00'
            worksheet.getColumn(4).numFmt = '#,##0.00'
            worksheet.getColumn(5).numFmt = '#,##0.00'
            worksheet.getColumn(6).numFmt = '#,##0.00'
        });

        // Get all columns from JSON
        let columnsArray1: any[];
        for (const key in listados) {
            if (listados.hasOwnProperty(key)) {
                columnsArray1 = Object.keys(listados[key]);

            }
        }

        // Add Data and Conditional Formatting
        listados.forEach((element: any) => {

            const eachRow = [];
            columnsArray1.forEach((column) => {
                eachRow.push(element[column]);
            });

            if (element.isDeleted === 'Y') {
                const deletedRow = worksheet.addRow(eachRow);
                deletedRow.eachCell((cell) => {
                    cell.font = { name: 'Calibri', family: 4, size: 11, bold: false, strike: true };
                });
            } else {
                worksheet.addRow(eachRow);
            }
        });

        //#################################################
        worksheet.addRow([]); //AGREGAR FILA VACIA
        worksheet.addRow([]);
        worksheet.addRow([]);
        worksheet.addRow([]);
        //#################################################
        //CABECERA 2
        const header2 = [
            '',
            'Cantidad de pólizas',
            'Prima Anual Soles',
            'Prima Anual Dólares',
            'Prima Anual Equivalente Soles',
            'Prima Total Anual  Soles',
        ];

        let x = 0
        const listados2 = [];
        for (x; x < objJ.reportDailyTotal.length; x++) {
            const object2 = {
                A: 'Total',
                B: objJ.reportDailyTotal[x].cantidad_polizas_total,
                C: objJ.reportDailyTotal[x].prima_anual_soles_total,
                D: objJ.reportDailyTotal[x].prima_anual_dolares_total,
                E: objJ.reportDailyTotal[x].prima_anual_equivalente_soles_total,
                F: objJ.reportDailyTotal[x].prima_total_anual_soles_total,
            };

            listados2.push(object2);
        }

        const headerRow2 = worksheet.addRow(header2);

        headerRow2.eachCell((cell, index) => {

            cell.font = { size: 12, bold: true };
            worksheet.getColumn(index).width = header2[index - 1].length < 20 ? 20 : header2[index - 1].length;
        });

        // Get all columns from JSON
        let columnsArray2: any[];
        for (const key in listados2) {
            if (listados2.hasOwnProperty(key)) {
                columnsArray2 = Object.keys(listados2[key]);

            }
        }

        // Add Data and Conditional Formatting
        listados2.forEach((element: any) => {

            const eachRow = [];
            columnsArray2.forEach((column) => {
                eachRow.push(element[column]);
            });

            if (element.isDeleted === 'Y') {
                const deletedRow = worksheet.addRow(eachRow);
                deletedRow.eachCell((cell) => {
                    cell.font = { name: 'Calibri', family: 4, size: 11, bold: false, strike: true };
                });
            } else {
                worksheet.addRow(eachRow);
            }
        });

        workbook.xlsx.writeBuffer().then((data: ArrayBuffer) => {
            const blob = new Blob([data], { type: EXCEL_TYPE });
            FileSaver.saveAs(blob, excelFileName + formatDateeExcel(DiaExcel) + EXCEL_EXTENSION);
        });
    }
    public generateVdpReserveRegistryReport(json: any[], excelFileName: string): void {

        //CABECERA
        const header = [
            "PÓLIZA",
            "NOMBRES ASEGURADO",
            "NOMBRES CONTRATANTE",
            "RELACIÓN",
            "OCUPACIÓN",
            "MONEDA",
            "ABONO",
            "NACIMIENTO",
            "SEXO",
            "TASA",
            "TEMPORALIDAD",
            "POR DEVOLUCIÓN",
            "SUMA ASEGURADA FALLECIMIENTO NATURAL",
            "PRIMA REGULAR",
            "INICIO DE VIGENCIA DEL RECIBO",
            "FIN DE VIGENCIA DEL RECIBO ",
            "INICIO DE VIGENCIA DE LA PÓLIZA",
        ];

        const listados = [];
        for (let i = 0; i < json.length; i++) {

            const object = {

                x1:  json[i].nro_policy,
                x2:  json[i].nom_asegruado,
                x3:  json[i].nombres_con,
                x4:  json[i].parentesco,
                x5:  json[i].ocup_asegruado,
                x6:  json[i].moneda,
                x7:  convertToDate(json[i].abono),
                x8:  convertToDate(json[i].nacimiento),
                x9:  json[i].sexo,
                x10: json[i].tasa,
                x11: json[i].temporalidad,
                x12: json[i].devolucion,
                x13: json[i].suma_asegurada, //NUMERO
                x14: json[i].prima_mensual, //NUMERO
                x15: convertToDate(json[i].ini_vigencia_recibo),
                x16: convertToDate(json[i].fin_vigencia_recibo),
                x17: convertToDate(json[i].ini_vigencia_poliza),
            };

            listados.push(object);
        }

        /* Create workbook and worksheet */
        const workbook = new Workbook();
        workbook.creator = 'Vida Devolución Protecta+';
        workbook.lastModifiedBy = 'Vida Devolución Protecta+';
        workbook.created = new Date();
        workbook.modified = new Date();
        const worksheet = workbook.addWorksheet('Reporte');
        //worksheet.addRow([]);  //AGREGAR FILA
        const headerRow = worksheet.addRow(header);

        headerRow.eachCell((cell, index) => {

            /*   cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFFFFF00' },
                  bgColor: { argb: 'FF0000FF' }
              };
              cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; */
            cell.font = { size: 12, bold: true };
            worksheet.getColumn(index).width = header[index - 1].length < 20 ? 20 : header[index - 1].length;
            //TIPO DE DATO CELDA
            worksheet.getColumn(13).numFmt = '#,##0.00'
            worksheet.getColumn(14).numFmt = '#,##0.00'
        });

        // Get all columns from JSON
        let columnsArray: any[];
        for (const key in listados) {
            if (listados.hasOwnProperty(key)) {
                columnsArray = Object.keys(listados[key]);
            }
        }

        // Add Data and Conditional Formatting
        listados.forEach((element: any) => {

            const eachRow = [];
            columnsArray.forEach((column) => {
                eachRow.push(element[column]);
            });

            if (element.isDeleted === 'Y') {
                const deletedRow = worksheet.addRow(eachRow);
                deletedRow.eachCell((cell) => {
                    cell.font = { name: 'Calibri', family: 4, size: 11, bold: false, strike: true };
                });
            } else {
                worksheet.addRow(eachRow);
            }
        });

        workbook.xlsx.writeBuffer().then((data: ArrayBuffer) => {
            const blob = new Blob([data], { type: EXCEL_TYPE });
            FileSaver.saveAs(blob, excelFileName + formatDateeExcel(DiaExcel) + EXCEL_EXTENSION);
        });
    }
    public generateReportPersist1VDPExcel(json: any[], excelFileName: string): void {

        //CABECERA
        const header = [
            "DOC. ASESOR",
            "ASESOR",

            "SUMA PAGADA ASESOR (3 MESES)",
            "SUMA PROYECTADA ASESOR (3 MESES)",
            "% PERSISTENCIA (3 MESES)",

            "SUMA PAGADA ASESOR (6 MESES)",
            "SUMA PROYECTADA ASESOR (6 MESES)",
            "% PERSISTENCIA (6 MESES)",

            "SUMA PAGADA ASESOR (9 MESES)",
            "SUMA PROYECTADA ASESOR (9 MESES)",
            "% PERSISTENCIA (9 MESES)",

            "SUMA PAGADA ASESOR (12 MESES)",
            "SUMA PROYECTADA ASESOR (12 MESES)",
            "% PERSISTENCIA (12 MESES)",

            "DOC. SUPERVISOR",
            "SUPERVISOR",

            "SUMA PAGADA SUPERVISOR (3 MESES)",
            "SUMA PROYECTADA SUPERVIDOR (3 MESES)",
            "% PERSISTENCIA (3 MESES)",


            "SUMA PAGADA SUPERVISOR (6 MESES)",
            "SUMA PROYECTADA SUPERVIDOR (6 MESES)",
            "% PERSISTENCIA (6 MESES)",

            "SUMA PAGADA SUPERVISOR (9 MESES)",
            "SUMA PROYECTADA SUPERVIDOR (9 MESES)",
            "% PERSISTENCIA (9 MESES)",

            "SUMA PAGADA SUPERVISOR (12 MESES)",
            "SUMA PROYECTADA SUPERVIDOR (12 MESES)", //arreglar letra
            "% PERSISTENCIA (12 MESES)",

            "DOC. JEFE",
            "JEFE",

            "SUMA PAGADA JEFE (3 MESES)",
            "SUMA PROYECTADA JEFE (3 MESES)",
            "% PERSISTENCIA (3 MESES)",

            "SUMA PAGADA JEFE (6 MESES)",
            "SUMA PROYECTADA JEFE (6 MESES)",
            "% PERSISTENCIA (6 MESES)",

            "SUMA PAGADA JEFE (9 MESES)",
            "SUMA PROYECTADA JEFE (9 MESES)",
            "% PERSISTENCIA (9 MESES)",

            "SUMA PAGADA JEFE (12 MESES)",
            "SUMA PROYECTADA JEFE (12 MESES)",
            "% PERSISTENCIA (12 MESES)",

            "SUMA PAGADA PROTECTA SECURITY (3 MESES)",
            "SUMA PROYECTADA PROTECTA SECURITY (3 MESES)",
            "% PERSISTENCIA (3 MESES)",

            "SUMA PAGADA PROTECTA SECURITY (6 MESES)",
            "SUMA PROYECTADA PROTECTA SECURITY (6 MESES)",
            "% PERSISTENCIA (6 MESES)",

            "SUMA PAGADA PROTECTA SECURITY (9 MESES)",
            "SUMA PROYECTADA PROTECTA SECURITY (9 MESES)",
            "% PERSISTENCIA (9 MESES)",

            "SUMA PAGADA PROTECTA SECURITY (12 MESES)",
            "SUMA PROYECTADA PROTECTA SECURITY (12 MESES)",
            "% PERSISTENCIA (12 MESES)",

            "FECHA PROCESO",
        ];

        const listados = [];
        for (let i = 0; i < json.length; i++) {

            const object = {
                A: json[i].doc_asesor,
                B: json[i].asesor,

                C: json[i].npagada_ase3,
                D: json[i].nproyec_ase3,
                E: json[i].per_asesor3,

                F: json[i].npagada_ase6,
                G: json[i].nproyec_ase6,
                H: json[i].per_asesor6,

                I: json[i].npagada_ase9,
                J: json[i].nproyec_ase9,
                K: json[i].per_asesor9,

                L: json[i].npagada_ase12,
                M: json[i].nproyec_ase12,
                N: json[i].per_asesor12,

                O: json[i].doc_super,
                P: json[i].super,

                Q: json[i].npagada_sup3,
                R: json[i].nproyec_sup3,
                S: json[i].per_sup3,

                T: json[i].npagada_sup6,
                U: json[i].nproyec_sup6,
                V: json[i].per_sup6,

                W: json[i].npagada_sup9,
                X: json[i].nproyec_sup9,
                Y: json[i].per_sup9,

                Z: json[i].npagada_sup12,
                AA: json[i].nproyec_sup12,
                AB: json[i].per_sup12,

                AC: json[i].doc_jefe,
                AD: json[i].jefe,

                AE: json[i].npagada_jef3,
                AF: json[i].nproyec_jef3,
                AG: json[i].per_jef3,

                AH: json[i].npagada_jef6,
                AI: json[i].nproyec_jef6,
                AJ: json[i].per_jef6,

                AK: json[i].npagada_jef9,
                AL: json[i].nproyec_jef9,
                AM: json[i].per_jef9,

                AN: json[i].npagada_jef12,
                AO: json[i].nproyec_jef12,
                AP: json[i].per_jef12,

                AQ: json[i].npagada_prs3,
                AR: json[i].nproyec_prs3,
                AS: json[i].per_prs3,

                AT: json[i].npagada_prs6,
                AU: json[i].nproyec_prs6,
                AV: json[i].per_prs6,

                AW: json[i].npagada_prs9,
                AX: json[i].nproyec_prs9,
                AY: json[i].per_prs9,

                AZ: json[i].npagada_prs12,
                BA: json[i].nproyec_prs12,
                BB: json[i].per_prs12,

                BC: json[i].fecha_proceso,
            };

            listados.push(object);
        }

        /* Create workbook and worksheet */
        const workbook = new Workbook();
        workbook.creator = 'Vida Devolución Protecta+';
        workbook.lastModifiedBy = 'Vida Devolución Protecta+';
        workbook.created = new Date();
        workbook.modified = new Date();
        const worksheet = workbook.addWorksheet('Reporte');
        //worksheet.addRow([]);  //AGREGAR FILA
        const headerRow = worksheet.addRow(header);

        headerRow.eachCell((cell, index) => {

            /*   cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFFFFF00' },
                  bgColor: { argb: 'FF0000FF' }
              };
              cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; */
            cell.font = { size: 12, bold: true };
            worksheet.getColumn(index).width = header[index - 1].length < 20 ? 20 : header[index - 1].length;
            //TIPO DE DATO CELDA
            for (var ia = 3; ia < 15; ia++) {
                worksheet.getColumn(ia).numFmt = '#,##0.00'
            }
            for (var ib = 17; ib < 29; ib++) {
                worksheet.getColumn(ib).numFmt = '#,##0.00'
            }
            for (var ic = 31; ic < 54; ic++) {
                worksheet.getColumn(ic).numFmt = '#,##0.00'
            }
        });

        // Get all columns from JSON
        let columnsArray: any[];
        for (const key in listados) {
            if (listados.hasOwnProperty(key)) {
                columnsArray = Object.keys(listados[key]);
            }
        }

        // Add Data and Conditional Formatting
        listados.forEach((element: any) => {

            const eachRow = [];
            columnsArray.forEach((column) => {
                eachRow.push(element[column]);
            });

            if (element.isDeleted === 'Y') {
                const deletedRow = worksheet.addRow(eachRow);
                deletedRow.eachCell((cell) => {
                    cell.font = { name: 'Calibri', family: 4, size: 11, bold: false, strike: true };
                });
            } else {
                worksheet.addRow(eachRow);
            }
        });

        workbook.xlsx.writeBuffer().then((data: ArrayBuffer) => {
            const blob = new Blob([data], { type: EXCEL_TYPE });
            FileSaver.saveAs(blob, excelFileName + formatDateeExcel(DiaExcel) + EXCEL_EXTENSION);
        });
    }
    public generateReportPersist2VDPExcel(json: any[], excelFileName: string): void {

        //CABECERA
        const header = [
            "DOC. ASESOR",
            "ASESOR",

            "SUMA PAGADA ASESOR (3 MESES)",
            "SUMA PROYECTADA ASESOR (3 MESES)",
            "% PERSISTENCIA (3 MESES)",

            "SUMA PAGADA ASESOR (6 MESES)",
            "SUMA PROYECTADA ASESOR (6 MESES)",
            "% PERSISTENCIA (6 MESES)",

            "SUMA PAGADA ASESOR (9 MESES)",
            "SUMA PROYECTADA ASESOR (9 MESES)",
            "% PERSISTENCIA (9 MESES)",

            "SUMA PAGADA ASESOR (12 MESES)",
            "SUMA PROYECTADA ASESOR (12 MESES)",
            "% PERSISTENCIA (12 MESES)",

            "DOC. SUPERVISOR",
            "SUPERVISOR",

            "SUMA PAGADA SUPERVISOR (3 MESES)",
            "SUMA PROYECTADA SUPERVIDOR (3 MESES)",
            "% PERSISTENCIA (3 MESES)",


            "SUMA PAGADA SUPERVISOR (6 MESES)",
            "SUMA PROYECTADA SUPERVIDOR (6 MESES)",
            "% PERSISTENCIA (6 MESES)",

            "SUMA PAGADA SUPERVISOR (9 MESES)",
            "SUMA PROYECTADA SUPERVIDOR (9 MESES)",
            "% PERSISTENCIA (9 MESES)",

            "SUMA PAGADA SUPERVISOR (12 MESES)",
            "SUMA PROYECTADA SUPERVIDOR (12 MESES)", //arreglar letra
            "% PERSISTENCIA (12 MESES)",

            "DOC. JEFE",
            "JEFE",

            "SUMA PAGADA JEFE (3 MESES)",
            "SUMA PROYECTADA JEFE (3 MESES)",
            "% PERSISTENCIA (3 MESES)",

            "SUMA PAGADA JEFE (6 MESES)",
            "SUMA PROYECTADA JEFE (6 MESES)",
            "% PERSISTENCIA (6 MESES)",

            "SUMA PAGADA JEFE (9 MESES)",
            "SUMA PROYECTADA JEFE (9 MESES)",
            "% PERSISTENCIA (9 MESES)",

            "SUMA PAGADA JEFE (12 MESES)",
            "SUMA PROYECTADA JEFE (12 MESES)",
            "% PERSISTENCIA (12 MESES)",

            "SUMA PAGADA PROTECTA SECURITY (3 MESES)",
            "SUMA PROYECTADA PROTECTA SECURITY (3 MESES)",
            "% PERSISTENCIA (3 MESES)",

            "SUMA PAGADA PROTECTA SECURITY (6 MESES)",
            "SUMA PROYECTADA PROTECTA SECURITY (6 MESES)",
            "% PERSISTENCIA (6 MESES)",

            "SUMA PAGADA PROTECTA SECURITY (9 MESES)",
            "SUMA PROYECTADA PROTECTA SECURITY (9 MESES)",
            "% PERSISTENCIA (9 MESES)",

            "SUMA PAGADA PROTECTA SECURITY (12 MESES)",
            "SUMA PROYECTADA PROTECTA SECURITY (12 MESES)",
            "% PERSISTENCIA (12 MESES)",

            "FECHA PROCESO",
        ];

        const listados = [];
        for (let i = 0; i < json.length; i++) {

            const object = {
                A: json[i].doc_asesor,
                B: json[i].asesor,

                C: json[i].npagada_ase3,
                D: json[i].nproyec_ase3,
                E: json[i].per_asesor3,

                F: json[i].npagada_ase6,
                G: json[i].nproyec_ase6,
                H: json[i].per_asesor6,

                I: json[i].npagada_ase9,
                J: json[i].nproyec_ase9,
                K: json[i].per_asesor9,

                L: json[i].npagada_ase12,
                M: json[i].nproyec_ase12,
                N: json[i].per_asesor12,

                O: json[i].doc_super,
                P: json[i].super,

                Q: json[i].npagada_sup3,
                R: json[i].nproyec_sup3,
                S: json[i].per_sup3,

                T: json[i].npagada_sup6,
                U: json[i].nproyec_sup6,
                V: json[i].per_sup6,

                W: json[i].npagada_sup9,
                X: json[i].nproyec_sup9,
                Y: json[i].per_sup9,

                Z: json[i].npagada_sup12,
                AA: json[i].nproyec_sup12,
                AB: json[i].per_sup12,

                AC: json[i].doc_jefe,
                AD: json[i].jefe,

                AE: json[i].npagada_jef3,
                AF: json[i].nproyec_jef3,
                AG: json[i].per_jef3,

                AH: json[i].npagada_jef6,
                AI: json[i].nproyec_jef6,
                AJ: json[i].per_jef6,

                AK: json[i].npagada_jef9,
                AL: json[i].nproyec_jef9,
                AM: json[i].per_jef9,

                AN: json[i].npagada_jef12,
                AO: json[i].nproyec_jef12,
                AP: json[i].per_jef12,

                AQ: json[i].npagada_prs3,
                AR: json[i].nproyec_prs3,
                AS: json[i].per_prs3,

                AT: json[i].npagada_prs6,
                AU: json[i].nproyec_prs6,
                AV: json[i].per_prs6,

                AW: json[i].npagada_prs9,
                AX: json[i].nproyec_prs9,
                AY: json[i].per_prs9,

                AZ: json[i].npagada_prs12,
                BA: json[i].nproyec_prs12,
                BB: json[i].per_prs12,

                BC: json[i].fecha_proceso,
            };

            listados.push(object);
        }

        /* Create workbook and worksheet */
        const workbook = new Workbook();
        workbook.creator = 'Vida Devolución Protecta+';
        workbook.lastModifiedBy = 'Vida Devolución Protecta+';
        workbook.created = new Date();
        workbook.modified = new Date();
        const worksheet = workbook.addWorksheet('Reporte');
        //worksheet.addRow([]);  //AGREGAR FILA
        const headerRow = worksheet.addRow(header);

        headerRow.eachCell((cell, index) => {

            /*   cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFFFFF00' },
                  bgColor: { argb: 'FF0000FF' }
              };
              cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; */
            cell.font = { size: 12, bold: true };
            worksheet.getColumn(index).width = header[index - 1].length < 20 ? 20 : header[index - 1].length;
            //TIPO DE DATO CELDA
            for (var ia = 3; ia < 15; ia++) {
                worksheet.getColumn(ia).numFmt = '#,##0.00'
            }
            for (var ib = 17; ib < 29; ib++) {
                worksheet.getColumn(ib).numFmt = '#,##0.00'
            }
            for (var ic = 31; ic < 54; ic++) {
                worksheet.getColumn(ic).numFmt = '#,##0.00'
            }
        });

        // Get all columns from JSON
        let columnsArray: any[];
        for (const key in listados) {
            if (listados.hasOwnProperty(key)) {
                columnsArray = Object.keys(listados[key]);
            }
        }

        // Add Data and Conditional Formatting
        listados.forEach((element: any) => {

            const eachRow = [];
            columnsArray.forEach((column) => {
                eachRow.push(element[column]);
            });

            if (element.isDeleted === 'Y') {
                const deletedRow = worksheet.addRow(eachRow);
                deletedRow.eachCell((cell) => {
                    cell.font = { name: 'Calibri', family: 4, size: 11, bold: false, strike: true };
                });
            } else {
                worksheet.addRow(eachRow);
            }
        });

        workbook.xlsx.writeBuffer().then((data: ArrayBuffer) => {
            const blob = new Blob([data], { type: EXCEL_TYPE });
            FileSaver.saveAs(blob, excelFileName + formatDateeExcel(DiaExcel) + EXCEL_EXTENSION);
        });
    }
    public generateReportPersistByDateVDPExcel(json: any[], excelFileName: string): void {

        //CABECERA
        const header = [
            "DOC. ASESOR",
            "ASESOR",

            "SUMA PAGADA ASESOR",
            "SUMA PROYECTADA ASESOR",
            "% PERSISTENCIA",

            "DOC. SUPERVISOR",
            "SUPERVISOR",

            "SUMA PAGADA SUPERVISOR",
            "SUMA PROYECTADA SUPERVIDOR",
            "% PERSISTENCIA",

            "DOC. JEFE",
            "JEFE",

            "SUMA PAGADA JEFE",
            "SUMA PROYECTADA JEFE",
            "% PERSISTENCIA",

            "SUMA PAGADA PROTECTA SECURITY",
            "SUMA PROYECTADA PROTECTA SECURITY",
            "% PERSISTENCIA",

            "FECHA PROCESO",
        ];

        const listados = [];
        for (let i = 0; i < json.length; i++) {

            const object = {
                A: json[i].doc_asesor,
                B: json[i].asesor,

                C: json[i].npagada_ase,
                D: json[i].nproyec_ase,
                E: json[i].per_asesor,

                F: json[i].doc_super,
                G: json[i].super,

                H: json[i].npagada_sup,
                I: json[i].nproyec_sup,
                J: json[i].per_sup,

                K: json[i].doc_jefe,
                L: json[i].jefe,

                M: json[i].npagada_jef,
                N: json[i].nproyec_jef,
                O: json[i].per_jef,

                P: json[i].npagada_prs,
                Q: json[i].nproyec_prs,
                R: json[i].per_prs,

                S: json[i].fecha_proceso,
            };

            listados.push(object);
        }

        const workbook = new Workbook();
        workbook.creator = 'Vida Devolución Protecta+';
        workbook.lastModifiedBy = 'Vida Devolución Protecta+';
        workbook.created = new Date();
        workbook.modified = new Date();
        const worksheet = workbook.addWorksheet('Reporte');
        const headerRow = worksheet.addRow(header);

        headerRow.eachCell((cell, index) => {

            cell.font = { size: 12, bold: true };
            worksheet.getColumn(index).width = header[index - 1].length < 20 ? 20 : header[index - 1].length;
            //TIPO DE DATO CELDA
            for (var ia = 3; ia < 15; ia++) {
                worksheet.getColumn(ia).numFmt = '#,##0.00'
            }
            for (var ib = 17; ib < 29; ib++) {
                worksheet.getColumn(ib).numFmt = '#,##0.00'
            }
            for (var ic = 31; ic < 54; ic++) {
                worksheet.getColumn(ic).numFmt = '#,##0.00'
            }
        });

        // Get all columns from JSON
        let columnsArray: any[];
        for (const key in listados) {
            if (listados.hasOwnProperty(key)) {
                columnsArray = Object.keys(listados[key]);
            }
        }

        // Add Data and Conditional Formatting
        listados.forEach((element: any) => {

            const eachRow = [];
            columnsArray.forEach((column) => {
                eachRow.push(element[column]);
            });

            if (element.isDeleted === 'Y') {
                const deletedRow = worksheet.addRow(eachRow);
                deletedRow.eachCell((cell) => {
                    cell.font = { name: 'Calibri', family: 4, size: 11, bold: false, strike: true };
                });
            } else {
                worksheet.addRow(eachRow);
            }
        });

        workbook.xlsx.writeBuffer().then((data: ArrayBuffer) => {
            const blob = new Blob([data], { type: EXCEL_TYPE });
            FileSaver.saveAs(blob, excelFileName + formatDateeExcel(DiaExcel) + EXCEL_EXTENSION);
        });
    }
    public generateReportComisionExcel(json: any[], excelFileName: string): void { // AGREGAR FRECUENCIA DE PAGO

        //CABECERA
        const header = [
            "PÓLIZA",
            'FECHA ABONO INICIAL',
            'TIPO DOCUMENTO',
            'NRO DOCUMENTO',
            'CONTRATANTE',
            "TIPO DOCUMENTO", // PASE 11/01/2023
            "NRO DOCUMENTO", // PASE 11/01/2023
            "ASEGURADO",  // PASE 11/01/2023
            "RELACIÓN", // PASE 11/01/2023
            'MONEDA',
            'FRECUENCIA DE PAGO',
            'PRIMA REGULAR',
            'COMISIÓN PROVISIÓN',
            'DOC. ASESOR VENTA',
            'ASESOR DE VENTA',
            'DOC. SUPERVISOR',
            'SUPERVISOR',
            'DOC. JEFE',
            'JEFE'
        ];

        const listados = [];
        for (let i = 0; i < json.length; i++) {

            const object = {
                x1:  json[i].poliza,
                x2:  convertToDate(json[i].fecha_abono),
                x3:  json[i].documento,
                x4:  json[i].ndocumento,
                x5:  json[i].contratante,
                x6:  json[i].documento_ase,
                x7:  json[i].ndocumento_ase,
                x8:  json[i].contratante_ase,
                x9:  json[i].parentesto_ase,
                x10: json[i].moneda,
                x11: json[i].frecuencia_pago,
                x12: json[i].prima_mensual,//NUMERO
                x13: json[i].comision_provision,//NUMERO
                x14: json[i].doc_asesor_venta,
                x15: json[i].asesor_venta,
                x16: json[i].doc_supervisor,
                x17: json[i].supervisor,
                x18: json[i].doc_jefe,
                x19: json[i].jefe,
            };

            listados.push(object);
        }

        /* Create workbook and worksheet */
        const workbook = new Workbook();
        workbook.creator = 'Vida Devolución Protecta+';
        workbook.lastModifiedBy = 'Vida Devolución Protecta+';
        workbook.created = new Date();
        workbook.modified = new Date();
        const worksheet = workbook.addWorksheet('Reporte');
        //worksheet.addRow([]);  //AGREGAR FILA
        const headerRow = worksheet.addRow(header);

        headerRow.eachCell((cell, index) => {

            /*   cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFFFFF00' },
                  bgColor: { argb: 'FF0000FF' }
              };
              cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; */
            cell.font = { size: 12, bold: true };
            worksheet.getColumn(index).width = header[index - 1].length < 20 ? 20 : header[index - 1].length;
            //TIPO DE DATO CELDA
            worksheet.getColumn(12).numFmt = '#,##0.00'
            worksheet.getColumn(13).numFmt = '#,##0.00'
        });

        // Get all columns from JSON
        let columnsArray: any[];
        for (const key in listados) {
            if (listados.hasOwnProperty(key)) {
                columnsArray = Object.keys(listados[key]);
            }
        }

        // Add Data and Conditional Formatting
        listados.forEach((element: any) => {

            const eachRow = [];
            columnsArray.forEach((column) => {
                eachRow.push(element[column]);
            });

            if (element.isDeleted === 'Y') {
                const deletedRow = worksheet.addRow(eachRow);
                deletedRow.eachCell((cell) => {
                    cell.font = { name: 'Calibri', family: 4, size: 11, bold: false, strike: true };
                });
            } else {
                worksheet.addRow(eachRow);
            }
        });

        workbook.xlsx.writeBuffer().then((data: ArrayBuffer) => {
            const blob = new Blob([data], { type: EXCEL_TYPE });
            FileSaver.saveAs(blob, excelFileName + formatDateeExcel(DiaExcel) + EXCEL_EXTENSION);
        });
    }
    public generateReportRenovationExcel(json: any[], excelFileName: string): void {  //FALTA PASAR A PRODUCCION --

        //CABECERA
        const header = [
            "POLIZA",
            "CONTRATANTE",
            "TIPO DOCUMENTO",
            "NRO DOCUMENTO",
            "CORREO ELECTRONICO",
            "ASEGURADO",  
            "TIPO DOCUMENTO", 
            "NRO DOCUMENTO",
            "RELACIÓN",
            "CELULAR",
            "DIRECCIÓN",
            "DISTRITO",
            "PROVINCIA",
            "DEPARTAMENTO",
            "NACIMIENTO",
            "FECHA FALLECIMIENTO",
            "SUMA ASEGURADA FALLECIMIENTO NATURAL",
            "SUMA ASEGURADA FALLECIMIENTO ACCIDENTAL",
            "FRECUENCIA DE PAGO",
            "PRIMERA PRIMA",
            "PRIMA REGULAR",
            "PRIMA ANUAL",
            "FECHA RENOVACIÓN",
            "PRIMERA PRIMA ANUAL SOLES",
            "PRIMERA PRIMA ANUAL DOLARES",
            "PRIMA ANUAL RENOVACIÓN SOLES",
            "PRIMA ANUAL RENOVACIÓN DÓLARES",
            "MONTO DE PRIMAS",
            "ABONO",
            "FECHA INICIO VIGENCIA",
            "FECHA EMISIÓN",
            "TEMPORALIDAD",
            "MONEDA",
            "% POR DEVOLUCIÓN",
            "SEXO",
            "FECHA DE ÚLTIMA SUSPENSIÓN",
            "FECHA DE ÚLTIMA REHABILITACIÓN ",
            "CUOTAS VENCIDAS",
            "CUOTAS PAGADAS",
            "ESTADO DE PÓLIZA",
            "FECHA FIN VIGENCIA",
            "NRO RECIBO",
            "NRO BOLETA",
            "ESTADO DE BOLETA SUNAT",
            "FECHA DE EMISIÓN DE BOLETA",
            "MONTO DEVOLUCIÓN",
            "DOC.JEFE",
            "JEFE",
            "DOC.SUPERVISOR",
            "SUPERVISOR",
            "DOC. ASESOR VENTA",
            "ASESOR DE VENTA",
            "DOC. ASESOR MANT",
            "ASESOR DE MANTENIMIENTO",
            "COMISIÓN",
            "COMISIÓN PAGADA",
            "MONTO FACTURADO",
            "MONTO NO DEVENGADO",
            "ANUALIDAD",
            "NÚMERO DE MESES DEVENGADOS",
            "NÚMERO DE MESES NO DEVENGADOS"
        ];

        const listados = [];
        for (let i = 0; i < json.length; i++) {

            const object = {
                x1:  json[i].poliza,
                x2:  json[i].nombres,
                x3:  json[i].tipo_documento,
                x4:  json[i].nro_documento,
                x5:  json[i].correo_electronico,
                x6:  json[i].nombres_ase,
                x7:  json[i].tipo_documento_ase,
                x8:  json[i].nro_documento_ase,
                x9:  json[i].parentesco,
                x10: json[i].celular,
                x11: json[i].direccion,
                x12: json[i].distrito,
                x13: json[i].provincia,
                x14: json[i].departamento,
                x15: convertToDate(json[i].nacimiento), //FECHA
                x16: convertToDate(json[i].fecha_fallecimiento),
                x17: json[i].suma_asegurada_cover1,//numero
                x18: json[i].suma_asegurada_cover2,//numero
                x19: json[i].frecuencia_pago,
                x20: json[i].primera_prima,//numero
                x21: json[i].prima_mensual,//numero
                x22: json[i].prima_anual,//numero
                x23: convertToDate(json[i].fecha_renovation),//FECHA
                x24: json[i].primera_prima_anual_soles,//numero
                x25: json[i].primera_prima_anual_dolares,//numero

                x26: json[i].prima_anual_renovacion_soles,//numero
                x27: json[i].prima_anual_renovacion_dolares,//numero
                x28: json[i].monto_primas,//numero
                x29: convertToDate(json[i].abono), //FECHA
                x30: convertToDate(json[i].fecha_inicio_vigencia),//FECHA
                x31: convertToDate(json[i].fecha_emision),//FECHA
                x32: json[i].temporalidad,
                x33: json[i].moneda,
                x34: json[i].por_devolucion,
                x35: json[i].cod_sexo,
                x36: convertToDate(json[i].fecha_ultima_suspencion),//aa
                x37: convertToDate(json[i].fecha_ultima_rehabilitacion),//aa
                x38: json[i].cuotas_vencidas,
                x39: json[i].cuotas_pagadas,
                x40: json[i].estado_poliza,
                x41: convertToDate(json[i].fecha_fin_vigencia),//FECHA
                x42: json[i].nro_recibo,
                x43: json[i].nro_boleta,
                x44: json[i].estado_boleta,
                x45: convertToDate(json[i].fecha_boleta),//FECHA
                x46: json[i].monto_devolucion,//numero
                x47: json[i].doc_jefe,
                x48: json[i].jefe,
                x49: json[i].doc_supervisor,
                x50: json[i].supervisor,
                x51: json[i].doc_asesor_venta,
                x52: json[i].asesor_venta,
                x53: json[i].doc_asesor_mant,
                x54: json[i].asesor_mant,
                x55: json[i].comision,//numero
                x56: json[i].comision_pagada,//numero
                x57: json[i].monto_facturado,//numero
                x58: json[i].monto_no_devengado,//numero
                x59: json[i].anualidad,
                x60: json[i].numero_cuotas_devengadas,
                x61: json[i].numero_meses_no_devengadas,
            };

            listados.push(object);
            console.log("NORMAL", json[i].fecha_fallecimiento)
            console.log("FUNCTION", convertToDate(json[i].fecha_fallecimiento))
        }

        /* Create workbook and worksheet */
        const workbook = new Workbook();
        workbook.creator = 'Vida Devolución Protecta+';
        workbook.lastModifiedBy = 'Vida Devolución Protecta+';
        workbook.created = new Date();
        workbook.modified = new Date();
        const worksheet = workbook.addWorksheet('Reporte');
        //worksheet.addRow([]);  //AGREGAR FILA
        const headerRow = worksheet.addRow(header);

        headerRow.eachCell((cell, index) => {

            /*   cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFFFFF00' },
                  bgColor: { argb: 'FF0000FF' }
              };
              cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; */
            cell.font = { size: 12, bold: true };
            worksheet.getColumn(index).width = header[index - 1].length < 20 ? 20 : header[index - 1].length;
            //TIPO DE DATO CELDA
            worksheet.getColumn(17).numFmt = '#,##0.00'
            worksheet.getColumn(18).numFmt = '#,##0.00'
            worksheet.getColumn(20).numFmt = '#,##0.00'
            worksheet.getColumn(21).numFmt = '#,##0.00'
            worksheet.getColumn(22).numFmt = '#,##0.00'
            worksheet.getColumn(24).numFmt = '#,##0.00'
            worksheet.getColumn(25).numFmt = '#,##0.00'

            worksheet.getColumn(26).numFmt = '#,##0.00'
            worksheet.getColumn(27).numFmt = '#,##0.00'
            worksheet.getColumn(28).numFmt = '#,##0.00'

            worksheet.getColumn(46).numFmt = '#,##0.00'
            worksheet.getColumn(55).numFmt = '#,##0.00'
            worksheet.getColumn(56).numFmt = '#,##0.00'
            worksheet.getColumn(57).numFmt = '#,##0.00'
            worksheet.getColumn(58).numFmt = '#,##0.00'
        });

        // Get all columns from JSON
        let columnsArray: any[];
        for (const key in listados) {
            if (listados.hasOwnProperty(key)) {
                columnsArray = Object.keys(listados[key]);
            }
        }

        // Add Data and Conditional Formatting
        listados.forEach((element: any) => {

            const eachRow = [];
            columnsArray.forEach((column) => {
                eachRow.push(element[column]);
            });

            if (element.isDeleted === 'Y') {
                const deletedRow = worksheet.addRow(eachRow);
                deletedRow.eachCell((cell) => {
                    cell.font = { name: 'Calibri', family: 4, size: 11, bold: false, strike: true };
                });
            } else {
                worksheet.addRow(eachRow);
            }
        });

        workbook.xlsx.writeBuffer().then((data: ArrayBuffer) => {
            const blob = new Blob([data], { type: EXCEL_TYPE });
            FileSaver.saveAs(blob, excelFileName + formatDateeExcel(DiaExcel) + EXCEL_EXTENSION);
        });
    }
    public generateReportContaComisionVDPExcel(json: any[], excelFileName: string): void {  //FALTA PASAR A PRODUCCION --

        //CABECERA
        const header = [
            "PÓLIZA",
            "FECHA EMISIÓN PÓLIZA",
            "TIPO DOCUMENTO",
            "NRO DOCUMENTO",
            "CONTRATANTE",
            "TIPO DOCUMENTO",
            "NRO DOCUMENTO",
            "ASEGURADO",
            "RELACIÓN",
            "MONEDA",
            "FRECUENCIA DE PAGO",
            "PROVISION COMISIÓN",
            "COMISIÓN PAGADA",
            "CUOTA 1",
            "FECHA PAGO CUOTA 1",
            "CUOTA 2",
            "FECHA PAGO CUOTA 2",
            "CUOTA 3",
            "FECHA PAGO CUOTA 3",
            "CUOTA 4",
            "FECHA PAGO CUOTA 4",
            "CUOTA 5",
            "FECHA PAGO CUOTA 5",
            "COMISION PENDIENTE PAGO",
            "N° CUOTAS",
            "DNI JEFE",
            "JEFE",
            "DNI SUPERVISOR",
            "SUPERVISOR",
            "DOC. ASESOR VENTA",
            "ASESOR DE VENTA",
        ];

        const listados = [];
        for (let i = 0; i < json.length; i++) {

            const object = {

                x1:  json[i].poliza,
                x2:  convertToDate(json[i].fecha_emision),//FECHA
                x3:  json[i].tipo_documento,
                x4:  json[i].nro_documento,
                x5:  json[i].contratante,
                x6:  json[i].tipo_documento_ase,
                x7:  json[i].nro_documento_ase,
                x8:  json[i].nombres_ase,
                x9:  json[i].parentesco,
                x10: json[i].moneda,
                x11: json[i].frecuencia_pago,
                x12: json[i].comision_provision,//MONTO
                x13: json[i].comision_pagada,//MONTO
                x14: json[i].ncuota1,//MONTO
                x15: convertToDate(json[i].fecha_pago_1), //FECHA
                x16: json[i].ncuota2,//MONTO
                x17: convertToDate(json[i].fecha_pago_2), //FECHA
                x18: json[i].ncuota3,//MONTO
                x19: convertToDate(json[i].fecha_pago_3), //FECHA
                x20: json[i].ncuota4,//MONTO
                x21: convertToDate(json[i].fecha_pago_4), //FECHA
                x22: json[i].ncuota5,//MONTO
                x23: convertToDate(json[i].fecha_pago_5), //FECHA
                x24: json[i].comision_pendiente,//MONTO
                x25: json[i].nro_cuotas,
                x26: json[i].doc_jefe,
                x27: json[i].jefe,
                x28: json[i].doc_supervisor,
                x29: json[i].supervisor,
                x30: json[i].doc_asesor_venta,
                x31: json[i].asesor_venta
            };

            listados.push(object);
            console.log("NORMAL", json[i].fecha_fallecimiento)
            console.log("FUNCTION", convertToDate(json[i].fecha_fallecimiento))
        }

        /* Create workbook and worksheet */
        const workbook = new Workbook();
        workbook.creator = 'Vida Devolución Protecta+';
        workbook.lastModifiedBy = 'Vida Devolución Protecta+';
        workbook.created = new Date();
        workbook.modified = new Date();
        const worksheet = workbook.addWorksheet('Reporte');
        //worksheet.addRow([]);  //AGREGAR FILA
        const headerRow = worksheet.addRow(header);

        headerRow.eachCell((cell, index) => {

            /*   cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFFFFF00' },
                  bgColor: { argb: 'FF0000FF' }
              };
              cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; */
            cell.font = { size: 12, bold: true };
            worksheet.getColumn(index).width = header[index - 1].length < 20 ? 20 : header[index - 1].length;
            //TIPO DE DATO CELDA
            worksheet.getColumn(12).numFmt = '#,##0.00'
            worksheet.getColumn(13).numFmt = '#,##0.00'
            worksheet.getColumn(14).numFmt = '#,##0.00'
            worksheet.getColumn(16).numFmt = '#,##0.00'
            worksheet.getColumn(18).numFmt = '#,##0.00'
            worksheet.getColumn(20).numFmt = '#,##0.00'
            worksheet.getColumn(22).numFmt = '#,##0.00'
            worksheet.getColumn(24).numFmt = '#,##0.00'
        });

        // Get all columns from JSON
        let columnsArray: any[];
        for (const key in listados) {
            if (listados.hasOwnProperty(key)) {
                columnsArray = Object.keys(listados[key]);
            }
        }

        // Add Data and Conditional Formatting
        listados.forEach((element: any) => {

            const eachRow = [];
            columnsArray.forEach((column) => {
                eachRow.push(element[column]);
            });

            if (element.isDeleted === 'Y') {
                const deletedRow = worksheet.addRow(eachRow);
                deletedRow.eachCell((cell) => {
                    cell.font = { name: 'Calibri', family: 4, size: 11, bold: false, strike: true };
                });
            } else {
                worksheet.addRow(eachRow);
            }
        });

        workbook.xlsx.writeBuffer().then((data: ArrayBuffer) => {
            const blob = new Blob([data], { type: EXCEL_TYPE });
            FileSaver.saveAs(blob, excelFileName + formatDateeExcel(DiaExcel) + EXCEL_EXTENSION);
        });
    }
    public generateReportFacturationExcel(json: any[], excelFileName: string): void {

        //CABECERA
        const header = [
            "LINEA",
            "PRODUCTO",
            "TIPO",
            "MONEDA",
            "CÓDIGO",
            "CONTRATANTE",
            "PÓLIZA",
            "CERTIFICADO",
            "FACTURA",
            "EMISIÓN",
            "INICIOCOMPROB",
            "FINCOMPROB",
            "ESTADO",
            "FECEST",
            "GRACIA",
            "NETO",
            "DEREMI",
            "IGV",
            "TOTAL",
            "RECONOCIMIENTO_DE_INGRESO_EN_MES_ANTERIOR"
        ];

        const listados = [];
        for (let i = 0; i < json.length; i++) {

            const object = {

                x1: json[i].linea,
                x2: json[i].producto,
                x3: json[i].tipo,
                x4: json[i].moneda,
                x5: json[i].codigo,
                x6: json[i].contratante,
                x7: json[i].poliza,
                x8: json[i].certificado,
                x9: json[i].factura,
                x10: convertToDate(json[i].emision), // dia
                x11: convertToDate(json[i].iniciocomprobante), // dia
                x12: convertToDate(json[i].fincomprobante), // dia
                x13: json[i].estado,
                x14: convertToDate(json[i].fecest), // dia
                x15: json[i].gracia,
                x16: json[i].neto, // Decimal
                x17: json[i].deremi,
                x18: json[i].igv, // Decimal
                x19: json[i].total, // Decimal
                x20: json[i].reconocimiento_mes
            };

            listados.push(object);
        }

        /* Create workbook and worksheet */
        const workbook = new Workbook();
        workbook.creator = 'Vida Devolución Protecta+';
        workbook.lastModifiedBy = 'Vida Devolución Protecta+';
        workbook.created = new Date();
        workbook.modified = new Date();
        const worksheet = workbook.addWorksheet('Reporte');
        //worksheet.addRow([]);  //AGREGAR FILA
        const headerRow = worksheet.addRow(header);

        headerRow.eachCell((cell, index) => {

            /*   cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFFFFF00' },
                  bgColor: { argb: 'FF0000FF' }
              };
              cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; */
            cell.font = { size: 12, bold: true };
            worksheet.getColumn(index).width = header[index - 1].length < 20 ? 20 : header[index - 1].length;
            //TIPO DE DATO CELDA
            worksheet.getColumn(16).numFmt = '#,##0.00'
            worksheet.getColumn(18).numFmt = '#,##0.00'
            worksheet.getColumn(19).numFmt = '#,##0.00'
        });

        // Get all columns from JSON
        let columnsArray: any[];
        for (const key in listados) {
            if (listados.hasOwnProperty(key)) {
                columnsArray = Object.keys(listados[key]);
            }
        }

        // Add Data and Conditional Formatting
        listados.forEach((element: any) => {

            const eachRow = [];
            columnsArray.forEach((column) => {
                eachRow.push(element[column]);
            });

            if (element.isDeleted === 'Y') {
                const deletedRow = worksheet.addRow(eachRow);
                deletedRow.eachCell((cell) => {
                    cell.font = { name: 'Calibri', family: 4, size: 11, bold: false, strike: true };
                });
            } else {
                worksheet.addRow(eachRow);
            }
        });

    }
    
    public saveAsExcelFileProviComisiones(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], {
            type: 'application/octet-stream'
        });
        FileSaver.saveAs(
            data,
            fileName + EXCEL_EXTENSION
        );
    }
    public generateReportConvenioExcel(json: any[], excelFileName: string): void {

        //CABECERA
        const header = [
            "LINEA",
            "PRODUCTO",
            "RIESGO",
            "RAMO",
            "EMISIONCONVENIO",
            "INICIOCONVENIO",
            "FINCONVENIO",
            "CERTIFICADO",
            "PÓLIZA",
            "TIPO",
            "COMPROBANTE",
            "EMISIONCOMP",
            "GRACIA",
            "FECVENCIMIENTO",
            "FECPROVISION",
            "COMPASOCIADO",
            "DOCIDENT",
            "CONTRATANTEFACT",
            "MONEDA",
            "NETO",
            "DEREMI",
            "IGV",
            "TOTAL",
            "CONTRATANTEPOLIZA",
            "INTERMEDIARIO1",
            "COMISION1",
            "INTERMEDIARIO1_1",
            "COMISION2",
            "GASTOTECNICO",
            "PAGOASISTENCIAS",
            "TIPOCONVENIO",
            "RECIBO",
            "COMENTARIOS"
        ];

        const listados = [];
        for (let i = 0; i < json.length; i++) {

            const object = {

                x1: json[i].linea,
                x2: json[i].producto,
                x3: json[i].riesgo,
                x4: json[i].ramo,
                x5: convertToDate(json[i].emisionconvenio),
                x6: convertToDate(json[i].inicio_convenio),
                x7: convertToDate(json[i].finconvenio),
                x8: json[i].certificado,
                x9: json[i].poliza,
                x10: json[i].tipo,
                x11: json[i].comprobante,
                x12: convertToDate(json[i].emision_comp),
                x13: json[i].gracia,
                x14: convertToDate(json[i].fecvencimiento),
                x15: convertToDate(json[i].fecprovision),
                x16: json[i].compasociado,
                x17: json[i].docident,
                x18: json[i].contratante_fact,
                x19: json[i].moneda,
                x20: json[i].neto, // decimal
                x21: json[i].deremi,
                x22: json[i].igv, // decimal
                x23: json[i].total, // decimal
                x24: json[i].contratante_poliza,
                x25: json[i].intermediario1,
                x26: json[i].comision1, // decimal
                x27: json[i].intermediario1_1,
                x28: json[i].comision2, // decimal
                x29: json[i].gasto_tecnico, // decimal
                x30: json[i].pago_asistencias, // decimal
                x31: json[i].tipo_convenio,
                x32: json[i].recibo,
                x33: json[i].comentarios,

            };

            listados.push(object);
        }

        /* Create workbook and worksheet */
        const workbook = new Workbook();
        workbook.creator = 'Vida Devolución Protecta+';
        workbook.lastModifiedBy = 'Vida Devolución Protecta+';
        workbook.created = new Date();
        workbook.modified = new Date();
        const worksheet = workbook.addWorksheet('Reporte');
        //worksheet.addRow([]);  //AGREGAR FILA
        const headerRow = worksheet.addRow(header);

        headerRow.eachCell((cell, index) => {

            /*   cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFFFFF00' },
                  bgColor: { argb: 'FF0000FF' }
              };
              cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; */
            cell.font = { size: 12, bold: true };
            worksheet.getColumn(index).width = header[index - 1].length < 20 ? 20 : header[index - 1].length;
            //TIPO DE DATO CELDA
            worksheet.getColumn(20).numFmt = '#,##0.00'
            worksheet.getColumn(22).numFmt = '#,##0.00'
            worksheet.getColumn(23).numFmt = '#,##0.00'
            worksheet.getColumn(26).numFmt = '#,##0.00'
            worksheet.getColumn(28).numFmt = '#,##0.00'
            worksheet.getColumn(29).numFmt = '#,##0.00'
            worksheet.getColumn(30).numFmt = '#,##0.00'
        });

        // Get all columns from JSON
        let columnsArray: any[];
        for (const key in listados) {
            if (listados.hasOwnProperty(key)) {
                columnsArray = Object.keys(listados[key]);
            }
        }

        // Add Data and Conditional Formatting
        listados.forEach((element: any) => {

            const eachRow = [];
            columnsArray.forEach((column) => {
                eachRow.push(element[column]);
            });

            if (element.isDeleted === 'Y') {
                const deletedRow = worksheet.addRow(eachRow);
                deletedRow.eachCell((cell) => {
                    cell.font = { name: 'Calibri', family: 4, size: 11, bold: false, strike: true };
                });
            } else {
                worksheet.addRow(eachRow);
            }
        });

        workbook.xlsx.writeBuffer().then((data: ArrayBuffer) => {
            const blob = new Blob([data], { type: EXCEL_TYPE });
            FileSaver.saveAs(blob, excelFileName + formatDateeExcel(DiaExcel) + EXCEL_EXTENSION);
        });
    }
    public generateReportVigExcelVCF(json: any[], excelFileName: string): void {

        //CABECERA
        const header = [
            "POLIZA",
            "CONTRATANTE",
            "TIPO DOCUMENTO",
            "NRO DOCUMENTO",
            "CORREO ELECTRONICO",
            "CELULAR",
            "DIRECCIÓN",
            "DISTRITO",
            "PROVINCIA",
            "DEPARTAMENTO",
            "NACIMIENTO",
            "FECHA FALLECIMIENTO",
            "SUMA ASEGURADA FALLECIMIENTO NATURAL",
            "SUMA ASEGURADA FALLECIMIENTO ACCIDENTAL",
            "FRECUENCIA DE PAGO",
            "CODIGO PRODUCTO", // IMPLEMENTAR CODIGOOOOOOOOOOOOOOOOOO
            "PRODUCTO", // IMPLEMENTAR PRODUCTOOOOOOOOOOOOOOOOOOO
            "PRIMERA PRIMA",
            "PRIMA REGULAR",
            "PRIMERA PRIMA ANUAL SOLES",
            "PRIMERA PRIMA ANUAL DOLARES",
            "MONTO DE PRIMAS",
            "ABONO",
            "FECHA INICIO VIGENCIA",
            "FECHA EMISIÓN",
            "TEMPORALIDAD",
            "MONEDA",
            "% POR DEVOLUCIÓN",
            "SEXO",
            "FECHA DE ÚLTIMA SUSPENSIÓN",
            "FECHA DE ÚLTIMA REHABILITACIÓN ",
            "CUOTAS VENCIDAS",
            "CUOTAS PAGADAS",
            "ESTADO DE PÓLIZA",
            "FECHA FIN VIGENCIA",
            "NRO RECIBO",
            "NRO BOLETA",
            "ESTADO DE BOLETA SUNAT",
            "FECHA DE EMISIÓN DE BOLETA",
            "MONTO DEVOLUCIÓN",
            "DOC.JEFE",
            "JEFE",
            "DOC.SUPERVISOR",
            "SUPERVISOR",
            "DOC. ASESOR VENTA",
            "ASESOR DE VENTA",
            "DOC. ASESOR MANT",
            "ASESOR DE MANTENIMIENTO",
            "COMISIÓN",
            "COMISIÓN PAGADA",
            "MONTO FACTURADO",
            "MONTO NO DEVENGADO",
            "ANUALIDAD",
            "NÚMERO DE MESES DEVENGADOS",
            "NÚMERO DE MESES NO DEVENGADOS",
            "ESTADO DE ENDOSO",
            "OBSERVACION",
            "FECHA / HORA",
            "USUARIO"
        ];

        const listados = [];
        for (let i = 0; i < json.length; i++) {

            const object = {

                x1: json[i].poliza,
                x2: json[i].nombres,
                x3: json[i].tipo_documento,
                x4: json[i].nro_documento,
                x5:  json[i].correo_electronico,
                x6: json[i].celular,
                x7: json[i].direccion,
                x8: json[i].distrito,
                x9: json[i].provincia,
                x10: json[i].departamento,
                x11: convertToDate(json[i].nacimiento), //FECHA
                x12: convertToDate(json[i].fecha_fallecimiento),//FECHA
                x13: json[i].suma_asegurada_cover1,//numero
                x14: json[i].suma_asegurada_cover2,//numero
                x15: json[i].frecuencia_pago,
                x16:json[i].codigo_producto,
                x17:json[i].producto,
                x18: json[i].primera_prima,//numero
                x19: json[i].prima_mensual,//numero
                x20: json[i].primera_prima_anual_soles,//numero
                x21: json[i].primera_prima_anual_dolares,//numero
                x22: json[i].monto_primas,//numero
                x23: convertToDate(json[i].abono), //FECHA
                x24: convertToDate(json[i].fecha_inicio_vigencia),//FECHA
                x25: convertToDate(json[i].fecha_emision),//FECHA
                x26: json[i].temporalidad,
                x27: json[i].moneda,
                x28: json[i].por_devolucion,  
                x29: json[i].cod_sexo,
                x30: convertToDate(json[i].fecha_ultima_suspencion),//FECHA
                x31: convertToDate(json[i].fecha_ultima_rehabilitacion),//FECHA
                x32: json[i].cuotas_vencidas,
                x33: json[i].cuotas_pagadas,
                x34: json[i].estado_poliza,
                x35: convertToDate(json[i].fecha_fin_vigencia),//FECHA
                x36: json[i].nro_recibo,
                x37: json[i].nro_boleta,
                x38: json[i].estado_boleta,
                x39: convertToDate(json[i].fecha_boleta),//FECHA
                x40: json[i].monto_devolucion, // numero
                x41: json[i].doc_jefe,
                x42: json[i].jefe,
                x43: json[i].doc_supervisor,
                x44: json[i].supervisor,
                x45: json[i].doc_asesor_venta,
                x46: json[i].asesor_venta,
                x47: json[i].doc_asesor_mant,
                x48: json[i].asesor_mant,
                x49: json[i].comision, // numero
                x50: json[i].comision_pagada, // numero
                x51: json[i].monto_facturado, // numero
                x52: json[i].monto_no_devengado, // numero
                x53: json[i].anualidad,
                x54: json[i].numero_cuotas_devengadas,
                x55: json[i].numero_meses_no_devengadas,
                x56: json[i].desc_movement,
                x57: json[i].observaciones,
                x58: json[i].dcreate,
                x59: json[i].desc_user,
            };

            listados.push(object);
            console.log("NORMAL", json[i].fecha_fallecimiento)
            console.log("FUNCTION", convertToDate(json[i].fecha_fallecimiento))
        }

        /* Create workbook and worksheet */
        const workbook = new Workbook();
        workbook.creator = 'Vida Devolución Protecta+';
        workbook.lastModifiedBy = 'Vida Devolución Protecta+';
        workbook.created = new Date();
        workbook.modified = new Date();
        const worksheet = workbook.addWorksheet('Reporte');
        //worksheet.addRow([]);  //AGREGAR FILA
        const headerRow = worksheet.addRow(header);

        headerRow.eachCell((cell, index) => {

            /*   cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFFFFF00' },
                  bgColor: { argb: 'FF0000FF' }
              };
              cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; */
            cell.font = { size: 12, bold: true };
            worksheet.getColumn(index).width = header[index - 1].length < 20 ? 20 : header[index - 1].length;
            //TIPO DE DATO CELDA
            worksheet.getColumn(13).numFmt = '#,##0.00'
            worksheet.getColumn(14).numFmt = '#,##0.00'
            worksheet.getColumn(18).numFmt = '#,##0.00'
            worksheet.getColumn(19).numFmt = '#,##0.00'
            worksheet.getColumn(20).numFmt = '#,##0.00'
            worksheet.getColumn(21).numFmt = '#,##0.00'
            worksheet.getColumn(22).numFmt = '#,##0.00'
            worksheet.getColumn(40).numFmt = '#,##0.00'
            worksheet.getColumn(49).numFmt = '#,##0.00'
            worksheet.getColumn(50).numFmt = '#,##0.00'
            worksheet.getColumn(51).numFmt = '#,##0.00'
            worksheet.getColumn(52).numFmt = '#,##0.00'
        });

        // Get all columns from JSON
        let columnsArray: any[];
        for (const key in listados) {
            if (listados.hasOwnProperty(key)) {
                columnsArray = Object.keys(listados[key]);
            }
        }

        // Add Data and Conditional Formatting
        listados.forEach((element: any) => {

            const eachRow = [];
            columnsArray.forEach((column) => {
                eachRow.push(element[column]);
            });

            if (element.isDeleted === 'Y') {
                const deletedRow = worksheet.addRow(eachRow);
                deletedRow.eachCell((cell) => {
                    cell.font = { name: 'Calibri', family: 4, size: 11, bold: false, strike: true };
                });
            } else {
                worksheet.addRow(eachRow);
            }
        });

        workbook.xlsx.writeBuffer().then((data: ArrayBuffer) => {
            const blob = new Blob([data], { type: EXCEL_TYPE });
            FileSaver.saveAs(blob, excelFileName + formatDateeExcel(DiaExcel) + EXCEL_EXTENSION);
        });
    }
    public generateReportAnulExcelVCF(json: any[], excelFileName: string): void {

        //CABECERA
        const header = [
            "POLIZA",
            "CONTRATANTE",
            "TIPO DOCUMENTO",
            "NRO DOCUMENTO",
            "CORREO ELECTRONICO",
            "CELULAR",
            "DIRECCIÓN",
            "DISTRITO",
            "PROVINCIA",
            "DEPARTAMENTO",
            "NACIMIENTO",
            "FECHA FALLECIMIENTO",
            "SUMA ASEGURADA FALLECIMIENTO NATURAL",
            "SUMA ASEGURADA FALLECIMIENTO ACCIDENTAL",
            "FRECUENCIA DE PAGO",
            "CODIGO PRODUCTO",
            "PRODUCTO",
            "PRIMERA PRIMA",
            "PRIMA REGULAR",
            "PRIMA ANUAL",
            "PRIMERA PRIMA ANUAL SOLES",
            "PRIMERA PRIMA ANUAL DOLARES",
            "MONTO DE PRIMAS",
            "EXTORNO ANUAL",
            "EXTORNO PRIMAS",
            "ABONO",
            "FECHA INICIO VIGENCIA",
            "FECHA EMISIÓN",
            "TEMPORALIDAD",
            "MONEDA",
            "% POR DEVOLUCIÓN",
            "SEXO",
            "FECHA DE ÚLTIMA SUSPENSIÓN",
            "FECHA DE ÚLTIMA REHABILITACIÓN ",
            "CUOTAS VENCIDAS",
            "CUOTAS PAGADAS",
            "ESTADO DE PÓLIZA",
            "FECHA FIN VIGENCIA",
            "NRO RECIBO",
            "NRO BOLETA",
            "ESTADO DE BOLETA SUNAT",
            "FECHA DE EMISIÓN DE BOLETA",
            "MONEDA DE EXTORNO",
            "MONTO DEVOLUCIÓN",
            "DOC. JEFE",
            "JEFE",
            "DOC. SUPERVISOR",
            "SUPERVISOR",
            "DOC. ASESOR VENTA",
            "ASESOR DE VENTA",
            "DOC. ASESOR MANT",
            "ASESOR DE MANTENIMIENTO",
            "COMISIÓN",
            "FECHA DE ANULACIÓN",
            "EXTORNO DE COMISIÓN",
            "COMISIÓN PAGADA",
            "MONTO FACTURADO",
            "MONTO NO DEVENGADO",
            "ANUALIDAD",
            "NOTA DE CRÉDITO",
            "FECHA DE NOTA DE CRÉDITO",
            "BOLETA ASOCIADA A NOTA DE CRÉDITO",
            "CONVENIO NEGATIVO",
            "ANULACIÓN DE CONVENIO NEGATIVO",
            "ESTADO DE ENDOSO",
            "OBSERVACION",
            "FECHA / HORA",
            "USUARIO"
        ];

        const listados = [];
        for (let i = 0; i < json.length; i++) {

            const object = {

                x1: json[i].poliza,
                x2: json[i].nombres,
                x3: json[i].tipo_documento,
                x4: json[i].nro_documento,
                x5:  json[i].correo_electronico,
                x6: json[i].celular,
                x7: json[i].direccion,
                x8: json[i].distrito,
                x9: json[i].provincia,
                x10: json[i].departamento,
                x11: convertToDate(json[i].nacimiento),
                x12: convertToDate(json[i].fecha_fallecimiento),
                x13: json[i].suma_asegurada_cover1, // numero
                x14: json[i].suma_asegurada_cover2,// numero
                x15: json[i].frecuencia_pago,
                x16: json[i].codigo_producto,
                x17: json[i].producto,
                x18: json[i].primera_prima,// numero
                x19: json[i].prima_mensual,// numero
                x20: json[i].prima_anual,// numero
                x21: json[i].primera_prima_anual_soles,// numero
                x22: json[i].primera_prima_anual_dolares,// numero
                x23: json[i].monto_primas,
                x24: json[i].extorno_anual,// numero
                x25: json[i].extorno_primas,// numero
                x26: convertToDate(json[i].abono),
                x27: convertToDate(json[i].fecha_inicio_vigencia),
                x28: convertToDate(json[i].fecha_emision),
                x29: json[i].temporalidad,
                x30: json[i].moneda,
                x31: json[i].por_devolucion,
                x32: json[i].cod_sexo,// numero
                x33: convertToDate(json[i].fecha_ultima_suspencion),
                x34: convertToDate(json[i].fecha_ultima_rehabilitacion),
                x35: json[i].cuotas_vencidas,
                x36: json[i].cuotas_pagadas,
                x37: json[i].estado_poliza,
                x38: convertToDate(json[i].fecha_fin_vigencia),
                x39: json[i].nro_recibo,
                x40: json[i].nro_boleta,
                x41: json[i].estado_boleta,
                x42: convertToDate(json[i].fecha_boleta),
                x43: json[i].moneda_extorno,
                x44: json[i].monto_devolucion,// numero
                x45: json[i].doc_jefe,
                x46: json[i].jefe,
                x47: json[i].doc_supervisor,
                x48: json[i].supervisor,
                x49: json[i].doc_asesor_venta,
                x50: json[i].asesor_venta,
                x51: json[i].doc_asesor_mant,
                x52: json[i].asesor_mant,
                x53: json[i].comision,// numero
                x54: convertToDate(json[i].fecha_anulacion),
                x55: json[i].extorno_comision,// numero
                x56: json[i].comision_pagada,// numero
                x57: json[i].monto_facturado,// numero
                x58: json[i].monto_no_devengado,// numero
                x59: json[i].anualidad,
                x60: json[i].nota_credito,
                x61: convertToDate(json[i].fecha_nota_credito),
                x62: json[i].boleta_asociada_nc,
                x63: json[i].convenio_negativo,// numero
                x64: json[i].anulación_convenio_negativo,// numero
                x65: json[i].desc_movement,
                x66: json[i].observaciones,
                x67: json[i].dcreate,
                x68: json[i].desc_user,
            };

            listados.push(object);
        }

        /* Create workbook and worksheet */
        const workbook = new Workbook();
        workbook.creator = 'Vida Devolución Protecta+';
        workbook.lastModifiedBy = 'Vida Devolución Protecta+';
        workbook.created = new Date();
        workbook.modified = new Date();
        const worksheet = workbook.addWorksheet('Reporte');
        //worksheet.addRow([]);  //AGREGAR FILA
        const headerRow = worksheet.addRow(header);

        headerRow.eachCell((cell, index) => {

            /*   cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFFFFF00' },
                  bgColor: { argb: 'FF0000FF' }
              };
              cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; */
            cell.font = { size: 12, bold: true };
            worksheet.getColumn(index).width = header[index - 1].length < 20 ? 20 : header[index - 1].length;
            //TIPO DE DATO CELDA
            worksheet.getColumn(13).numFmt = '#,##0.00'
            worksheet.getColumn(14).numFmt = '#,##0.00'
            worksheet.getColumn(18).numFmt = '#,##0.00'
            worksheet.getColumn(19).numFmt = '#,##0.00'
            worksheet.getColumn(20).numFmt = '#,##0.00'
            worksheet.getColumn(21).numFmt = '#,##0.00'
            worksheet.getColumn(22).numFmt = '#,##0.00'
            worksheet.getColumn(24).numFmt = '#,##0.00'
            worksheet.getColumn(25).numFmt = '#,##0.00'
            worksheet.getColumn(32).numFmt = '#,##0.00'
            worksheet.getColumn(44).numFmt = '#,##0.00'
            worksheet.getColumn(53).numFmt = '#,##0.00'
            worksheet.getColumn(55).numFmt = '#,##0.00'
            worksheet.getColumn(56).numFmt = '#,##0.00'
            worksheet.getColumn(57).numFmt = '#,##0.00'
            worksheet.getColumn(58).numFmt = '#,##0.00'
            worksheet.getColumn(63).numFmt = '#,##0.00'
            worksheet.getColumn(64).numFmt = '#,##0.00'

        });

        // Get all columns from JSON
        let columnsArray: any[];
        for (const key in listados) {
            if (listados.hasOwnProperty(key)) {
                columnsArray = Object.keys(listados[key]);
            }
        }

        // Add Data and Conditional Formatting
        listados.forEach((element: any) => {

            const eachRow = [];
            columnsArray.forEach((column) => {
                eachRow.push(element[column]);
            });

            if (element.isDeleted === 'Y') {
                const deletedRow = worksheet.addRow(eachRow);
                deletedRow.eachCell((cell) => {
                    cell.font = { name: 'Calibri', family: 4, size: 11, bold: false, strike: true };
                });
            } else {
                worksheet.addRow(eachRow);
            }
        });

        workbook.xlsx.writeBuffer().then((data: ArrayBuffer) => {
            const blob = new Blob([data], { type: EXCEL_TYPE });
            FileSaver.saveAs(blob, excelFileName + formatDateeExcel(DiaExcel) + EXCEL_EXTENSION);
        });
    }
    public generateChangesExcel(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Tipo de documento',
                    B: 'N° de Documento',
                    C: 'Apellido Paterno',
                    D: 'Apellido Materno',
                    E: 'Nombres',
                    F: 'Sexo',
                    G: 'Correo elctronico',
                    H: 'Celular',
                    I: 'Sueldo bruto',
                    J: 'Fecha de Nacimiento',
                    K: 'Apellido Paterno(N)',
                    L: 'Apellido Materno(N)',
                    M: 'Nombres(N)',
                    N: 'Sexo(N)',
                    O: 'Correo elctronico(N)',
                    P: 'Celular(N)',
                    Q: 'Sueldo bruto(N)',
                    R: 'Fecha de Nacimiento(N)'
                }
            ],
            {
                header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'],
                skipHeader: true
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].NIDDOC_TYPE,
                B: json[i].SIDDOC,
                C: json[i].SLASTNAME,
                D: json[i].SLASTNAME2,
                E: json[i].SFIRSTNAME,
                F: json[i].SSEXCLIEN,
                G: json[i].SE_MAIL,
                H: json[i].SPHONE,
                I: json[i].NREMUNERACION,
                J: json[i].DBIRTHDAT,
                K: json[i].SLASTNAME_NEW,
                L: json[i].SLASTNAME2_NEW,
                M: json[i].SFIRSTNAME_NEW,
                N: json[i].SSEXCLIEN_NEW,
                O: json[i].SE_MAIL_NEW,
                P: json[i].SPHONE_NEW,
                Q: json[i].NREMUNERACION_NEW,
                R: json[i].DBIRTHDAT_NEW
            };

            listados.push(object);
        }
        XLSX.utils.sheet_add_json(ws, listados, {
            skipHeader: true,
            origin: 'A2'
        });

        const workbook: XLSX.WorkBook = {
            Sheets: { data: ws },
            SheetNames: ['data']
        };
        const excelBuffer: any = XLSX.write(workbook, {
            bookType: 'xlsx',
            bookSST: false,
            type: 'array'
        });
        this.saveAsExcelFile(excelBuffer, excelFileName);
    }
    public generateReportErroresComisionVDP(json: any[], excelFileName: string): void {

        //CABECERA
        const header = [
            "REGISTRO",
            "PÓLIZA",
            "DESCRIPCIÓN DEL ERROR",
        ];

        const listados = [];
        for (let i = 0; i < json.length; i++) {

            const object = {

                x1: json[i].linea,
                x2: json[i].poliza,
                x3: json[i].descripcion,
            };

            listados.push(object);
        }

        /* Create workbook and worksheet */
        const workbook = new Workbook();
        workbook.creator = 'Vida Devolución Protecta+';
        workbook.lastModifiedBy = 'Vida Devolución Protecta+';
        workbook.created = new Date();
        workbook.modified = new Date();
        const worksheet = workbook.addWorksheet('Reporte');
        //worksheet.addRow([]);  //AGREGAR FILA
        const headerRow = worksheet.addRow(header);

        headerRow.eachCell((cell, index) => {

            /*   cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFFFFF00' },
                  bgColor: { argb: 'FF0000FF' }
              };
              cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; */
            cell.font = { size: 12, bold: true };
            worksheet.getColumn(index).width = header[index - 1].length < 20 ? 20 : header[index - 1].length;
        });

        // Get all columns from JSON
        let columnsArray: any[];
        for (const key in listados) {
            if (listados.hasOwnProperty(key)) {
                columnsArray = Object.keys(listados[key]);
            }
        }

        // Add Data and Conditional Formatting
        listados.forEach((element: any) => {

            const eachRow = [];
            columnsArray.forEach((column) => {
                eachRow.push(element[column]);
            });

            if (element.isDeleted === 'Y') {
                const deletedRow = worksheet.addRow(eachRow);
                deletedRow.eachCell((cell) => {
                    cell.font = { name: 'Calibri', family: 4, size: 11, bold: false, strike: true };
                });
            } else {
                worksheet.addRow(eachRow);
            }
        });

        workbook.xlsx.writeBuffer().then((data: ArrayBuffer) => {
            const blob = new Blob([data], { type: EXCEL_TYPE });
            FileSaver.saveAs(blob, excelFileName + formatDateeExcel(DiaExcel) + EXCEL_EXTENSION);
        });
    }
    public generateReportContabilidadVDP(json: any[], excelFileName: string): void {  //FALTA PASAR A PRODUCCION --

        //CABECERA
        const header = [
            "PÓLIZA",
            "FECHA EMISIÓN PÓLIZA",
            "TIPO DOCUMENTO",
            "NRO DOCUMENTO",
            "CONTRATANTE",
            "TIPO DOCUMENTO",
            "NRO DOCUMENTO",
            "ASEGURADO",
            "RELACIÓN",
            "MONEDA",
            "FRECUENCIA DE PAGO",
            "PROVISION COMISIÓN",
            "COMISIÓN PAGADA",
            "CUOTA 1",
            "FECHA PAGO CUOTA 1",
            "CUOTA 2",
            "FECHA PAGO CUOTA 2",
            "CUOTA 3",
            "FECHA PAGO CUOTA 3",
            "CUOTA 4",
            "FECHA PAGO CUOTA 4",
            "CUOTA 5",
            "FECHA PAGO CUOTA 5",
            "COMISION PENDIENTE PAGO",
            "N° CUOTAS",
            "DNI JEFE",
            "JEFE",
            "DNI SUPERVISOR",
            "SUPERVISOR",
            "DOC. ASESOR VENTA",
            "ASESOR DE VENTA",
        ];

        const listados = [];
        for (let i = 0; i < json.length; i++) {

            const object = {

                x1: json[i].poliza,
                x2: convertToDate(json[i].fecha_emision),//FECHA
                x3: json[i].tipo_documento_contratante,
                x4: json[i].nro_documento_contratante,
                x5: json[i].contratante,
                x6: json[i].tipo_documento_asegurado,
                x7: json[i].nro_documento_asegurado,
                x8: json[i].asegurado,
                x9: json[i].relacion,
                x10: json[i].moneda,
                x11: json[i].frecuencia_pago,
                x12: json[i].provision_comision,//MONTO
                x13: json[i].comision_pagada,//MONTO
                x14: json[i].cuota_1,//MONTO
                x15: convertToDate(json[i].fecha_pago_cuota_1), //FECHA
                x16: json[i].cuota_2,//MONTO
                x17: convertToDate(json[i].fecha_pago_cuota_2), //FECHA
                x18: json[i].cuota_3,//MONTO
                x19: convertToDate(json[i].fecha_pago_cuota_3), //FECHA
                x20: json[i].cuota_4,//MONTO
                x21: convertToDate(json[i].fecha_pago_cuota_4), //FECHA
                x22: json[i].cuota_5,//MONTO
                x23: convertToDate(json[i].fecha_pago_cuota_5), //FECHA
                x24: json[i].comision_pendiente_pago,//MONTO
                x25: json[i].nro_cuotas,
                x26: json[i].dni_jefe,
                x27: json[i].jefe,
                x28: json[i].dni_supervisor,
                x29: json[i].supervisor,
                x30: json[i].doc_asesor_venta,
                x31: json[i].asesor_venta
            };

            listados.push(object);

        }

            /* Create workbook and worksheet */
            const workbook = new Workbook();
            workbook.creator = 'Vida Devolución Protecta+';
            workbook.lastModifiedBy = 'Vida Devolución Protecta+';
            workbook.created = new Date();
            workbook.modified = new Date();
            const worksheet = workbook.addWorksheet('Reporte');
            //worksheet.addRow([]);  //AGREGAR FILA
            const headerRow = worksheet.addRow(header);

            headerRow.eachCell((cell, index) => {

                /*   cell.fill = {
                      type: 'pattern',
                      pattern: 'solid',
                      fgColor: { argb: 'FFFFFF00' },
                      bgColor: { argb: 'FF0000FF' }
                  };
                  cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; */
                cell.font = { size: 12, bold: true };
                worksheet.getColumn(index).width = header[index - 1].length < 20 ? 20 : header[index - 1].length;
                //TIPO DE DATO CELDA
                worksheet.getColumn(12).numFmt = '#,##0.00'
                worksheet.getColumn(13).numFmt = '#,##0.00'
                worksheet.getColumn(14).numFmt = '#,##0.00'
                worksheet.getColumn(16).numFmt = '#,##0.00'
                worksheet.getColumn(18).numFmt = '#,##0.00'
                worksheet.getColumn(20).numFmt = '#,##0.00'
                worksheet.getColumn(22).numFmt = '#,##0.00'
                worksheet.getColumn(24).numFmt = '#,##0.00'
            });

            // Get all columns from JSON
            let columnsArray: any[];
            for (const key in listados) {
                if (listados.hasOwnProperty(key)) {
                    columnsArray = Object.keys(listados[key]);
                }
            }

            // Add Data and Conditional Formatting
            listados.forEach((element: any) => {

                const eachRow = [];
                columnsArray.forEach((column) => {
                    eachRow.push(element[column]);
                });

                if (element.isDeleted === 'Y') {
                    const deletedRow = worksheet.addRow(eachRow);
                    deletedRow.eachCell((cell) => {
                        cell.font = { name: 'Calibri', family: 4, size: 11, bold: false, strike: true };
                    });
                } else {
                    worksheet.addRow(eachRow);
                }
            });

            workbook.xlsx.writeBuffer().then((data: ArrayBuffer) => {
                const blob = new Blob([data], { type: EXCEL_TYPE });
                //FileSaver.saveAs(blob, excelFileName + formatDateeExcel(DiaExcel) + EXCEL_EXTENSION);
                FileSaver.saveAs(blob, excelFileName + EXCEL_EXTENSION);
            });
    }
    public generateReportProvisionVDP(json: any[], excelFileName: string): void {  //FALTA PASAR A PRODUCCION --

        //CABECERA
        const header = [
            "MES",
            "FECHA DE ABONO",
            "PÓLIZA",
            "CONTRATANTE",
            "PRIMA",
            "FRECUENCIA DE PAGO",
            "PRIMA MENSUAL TOTAL",
            "PRIMA ANUAL TOTAL",
            "TIPO DE CAMBIO",
            "PRIMA MENSUAL EN SOLES",
            "PRIMA ANUAL EN SOLES",
            "TEMPORALIDAD",
            "MONEDA",
            "NRO DOCUMENTO ASESOR",
            "ASESOR",
            "%COM. ASESOR",
            "COMISIÓN ORIGINAL",
            "COMISIÓN SOLES",
            "NRO DOCUMENTO SUPERVISOR",
            "SUPERVISOR",
            "NRO DOCUMENTO JEFE",
            "JEFE",
            "SE ENVIÓ A LA INTERFAZ",
            "MONTO DE PROVISIÓN DE COMISIÓN ENVIADO A LA INTERFAZ",
        ];

        const listados = [];
        for (let i = 0; i < json.length; i++) {

            const object = {

                x1:  convertToDate(json[i].mes),//FECHA
                x2:  convertToDate(json[i].fecha_abono),//FECHA
                x3:  json[i].poliza,
                x4:  json[i].contratante,
                x5:  json[i].prima,//MONTO
                x6:  json[i].frecuencia_pago,
                x7:  json[i].prima_mensual_total,//MONTO
                x8:  json[i].prima_anual_total,//MONTO
                x9:  json[i].tipo_cambio,
                x10: json[i].prima_mensual_soles,//MONTO
                x11: json[i].prima_anual_soles,//MONTO
                x12: json[i].temporalidad,
                x13: json[i].moneda,
                x14: json[i].nro_documento_asesor,
                x15: json[i].asesor, 
                x16: json[i].porcentaje_com_asesor,
                x17: json[i].comision_original,//MONTO
                x18: json[i].comision_soles,//MONTO
                x19: json[i].nro_documento_supervisor, 
                x20: json[i].supervisor,
                x21: json[i].nro_documento_jefe,
                x22: json[i].jefe,
                x23: json[i].envio_interfaz, 
                x24: json[i].monto_provision_enviado_interfaz,//MONTO
            };

            listados.push(object);
        }
            /* Create workbook and worksheet */
            const workbook = new Workbook();
            workbook.creator = 'Vida Devolución Protecta+';
            workbook.lastModifiedBy = 'Vida Devolución Protecta+';
            workbook.created = new Date();
            workbook.modified = new Date();
            const worksheet = workbook.addWorksheet('Reporte');
            //worksheet.addRow([]);  //AGREGAR FILA
            const headerRow = worksheet.addRow(header);

            headerRow.eachCell((cell, index) => {

                /*   cell.fill = {
                      type: 'pattern',
                      pattern: 'solid',
                      fgColor: { argb: 'FFFFFF00' },
                      bgColor: { argb: 'FF0000FF' }
                  };
                  cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; */
                cell.font = { size: 12, bold: true };
                worksheet.getColumn(index).width = header[index - 1].length < 20 ? 20 : header[index - 1].length;
                //TIPO DE DATO CELDA
                worksheet.getColumn(5).numFmt = '#,##0.00'
                worksheet.getColumn(7).numFmt = '#,##0.00'
                worksheet.getColumn(8).numFmt = '#,##0.00'
                worksheet.getColumn(10).numFmt = '#,##0.00'
                worksheet.getColumn(11).numFmt = '#,##0.00'
                worksheet.getColumn(17).numFmt = '#,##0.00'
                worksheet.getColumn(18).numFmt = '#,##0.00'
                worksheet.getColumn(24).numFmt = '#,##0.00'
            });

            // Get all columns from JSON
            let columnsArray: any[];
            for (const key in listados) {
                if (listados.hasOwnProperty(key)) {
                    columnsArray = Object.keys(listados[key]);
                }
            }

            // Add Data and Conditional Formatting
            listados.forEach((element: any) => {

                const eachRow = [];
                columnsArray.forEach((column) => {
                    eachRow.push(element[column]);
                });

                if (element.isDeleted === 'Y') {
                    const deletedRow = worksheet.addRow(eachRow);
                    deletedRow.eachCell((cell) => {
                        cell.font = { name: 'Calibri', family: 4, size: 11, bold: false, strike: true };
                    });
                } else {
                    worksheet.addRow(eachRow);
                }
            });

            workbook.xlsx.writeBuffer().then((data: ArrayBuffer) => {
                const blob = new Blob([data], { type: EXCEL_TYPE });
                //FileSaver.saveAs(blob, excelFileName + formatDateeExcel(DiaExcel) + EXCEL_EXTENSION);
                FileSaver.saveAs(blob, excelFileName + EXCEL_EXTENSION);
            });
    }
    public generatePlanillaPagosDetalleVDP(json: any[], excelFileName: string): void { 

        
        //CABECERA
        const header = [
            "N° DE COMISIÓN",
            "NRO CONTRATANTE",
            "CONTRATANTE",
            "PRIMA",
            "FECHA PAGO PRIMERA PRIMA",
            "FECHA PAGO PRIMA",
            "PRIMA SOLES",
            "MONEDA",
            "PRIMA MENSUAL",
            "NRO ASESOR",
            "ASESOR",
            "PÓLIZA",
            "%COMISIÓN",
            "NRO SUPERVISOR",
            "SUPERVISOR",
            "NRO JEFE",
            "JEFE",
            "FRECUENCIA",
            "PAGO DEL ASESOR EN SOLES",
            "%COMISIÓN SUPERVISOR",
            "%COMISIÓN JEFE",
            "TEMPORALIDAD",
            "TIPO DE CAMBIO",
            "AUDITORÍA Y CONTROL",
            "VISTO BUENO DEL SUPERVISOR",
            "VISTO BUENO DEL JEFE",
            "ESTADO DE COMISIÓN",
            "FECHA DE PAGO DE PLANILLA",
        ];

        const listados = [];
        for (let i = 0; i < json.length; i++) {

            const object = {

                x1: json[i].d_nro_comision,
                x2: json[i].d_doc_contratante,
                x3: json[i].d_contratante,
                x4: json[i].d_prima, // MONTO
                x5: convertToDate(json[i].d_f_pago_primera_prima), // FECHA
                x6: convertToDate(json[i].d_f_pago_prima), // FECHA
                x7: json[i].d_prima_soles, // MONTO
                x8: json[i].d_moneda,
                x9: json[i].d_prima_mensual, // MONTO
                x10: json[i].d_doc_asesor_venta,
                x11: json[i].d_asesor_venta,
                x12: json[i].d_poliza,
                x13: json[i].d_porcentaje_comision,
                x14: json[i].d_doc_supervisor,
                x15: json[i].d_supervisor,
                x16: json[i].d_doc_jefe,
                x17: json[i].d_jefe,
                x18: json[i].d_frecuencia_pago,
                x19: json[i].d_pago_asesor_soles, // MONTO
                x20: json[i].d_comision_supervisor, // MONTO
                x21: json[i].d_comision_jefe, // MONTO
                x22: json[i].d_temporalidad,
                x23: json[i].d_tipo_cambio, // MONTO
                x24: json[i].d_auditoria_control,
                x25: json[i].d_v_b_jefe,
                x26: json[i].d_v_b_surpervisor,
                x27: json[i].d_estado_comision,
                x28: convertToDate(json[i].d_fecha_pago_planilla), // FECHA

            };

            listados.push(object);

        }

            /* Create workbook and worksheet */
            const workbook = new Workbook();
            workbook.creator = 'Vida Devolución Protecta+';
            workbook.lastModifiedBy = 'Vida Devolución Protecta+';
            workbook.created = new Date();
            workbook.modified = new Date();
            const worksheet = workbook.addWorksheet('Reporte');
            //worksheet.addRow([]);  //AGREGAR FILA
            const headerRow = worksheet.addRow(header);

            headerRow.eachCell((cell, index) => {

                /*   cell.fill = {
                      type: 'pattern',
                      pattern: 'solid',
                      fgColor: { argb: 'FFFFFF00' },
                      bgColor: { argb: 'FF0000FF' }
                  };
                  cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; */
                cell.font = { size: 12, bold: true };
                worksheet.getColumn(index).width = header[index - 1].length < 20 ? 20 : header[index - 1].length;
                //TIPO DE DATO CELDA
                worksheet.getColumn(4).numFmt = '#,##0.00'
                worksheet.getColumn(7).numFmt = '#,##0.00'
                worksheet.getColumn(9).numFmt = '#,##0.00'
                worksheet.getColumn(19).numFmt = '#,##0.00'
                worksheet.getColumn(20).numFmt = '#,##0.00'
                worksheet.getColumn(21).numFmt = '#,##0.00'
                worksheet.getColumn(23).numFmt = '#,##0.00'
            });

            // Get all columns from JSON
            let columnsArray: any[];
            for (const key in listados) {
                if (listados.hasOwnProperty(key)) {
                    columnsArray = Object.keys(listados[key]);
                }
            }

            // Add Data and Conditional Formatting
            listados.forEach((element: any) => {

                const eachRow = [];
                columnsArray.forEach((column) => {
                    eachRow.push(element[column]);
                });

                if (element.isDeleted === 'Y') {
                    const deletedRow = worksheet.addRow(eachRow);
                    deletedRow.eachCell((cell) => {
                        cell.font = { name: 'Calibri', family: 4, size: 11, bold: false, strike: true };
                    });
                } else {
                    worksheet.addRow(eachRow);
                }
            });

            workbook.xlsx.writeBuffer().then((data: ArrayBuffer) => {
                const blob = new Blob([data], { type: EXCEL_TYPE });
                //FileSaver.saveAs(blob, excelFileName + formatDateeExcel(DiaExcel) + EXCEL_EXTENSION);
                FileSaver.saveAs(blob, excelFileName + EXCEL_EXTENSION);
            });
    }
    public generateReportAsesoresVentasVigentesVDP(json: any[], excelFileName: string): void { 

        
        //CABECERA
        const header = [
            "ASESOR",
            "DNI_ASESOR",
            "USER_PD",
            "ESTADO USER PD",
            "JEFE_SUPERVISOR",
            "DNI_SUSPER",
            "USER PD",
            "ESTADO USER PD",
            "JEFE",
            "DNI_JEFE",
            "USER PD",
            "ESTADO USER PD",
        ];

        const listados = [];
        for (let i = 0; i < json.length; i++) {

            const object = {

                x1: json[i].asesor,
                x2: json[i].dni_asesor,
                x3: json[i].user_pd_asesor,
                x4: json[i].estado_user_pd_asesor,
                x5: json[i].supervisor,
                x6: json[i].dni_supervisor,
                x7: json[i].user_pd_supervisor,
                x8: json[i].estado_user_pd_supervisor,
                x9: json[i].jefe,
                x10: json[i].dni_jefe,
                x11: json[i].user_pd_jefe,
                x12: json[i].estado_user_pd_jefe
            };

            listados.push(object);

        }

            /* Create workbook and worksheet */
            const workbook = new Workbook();
            workbook.creator = 'Vida Devolución Protecta+';
            workbook.lastModifiedBy = 'Vida Devolución Protecta+';
            workbook.created = new Date();
            workbook.modified = new Date();
            const worksheet = workbook.addWorksheet('Reporte');
            //worksheet.addRow([]);  //AGREGAR FILA
            const headerRow = worksheet.addRow(header);

            headerRow.eachCell((cell, index) => {

                /*   cell.fill = {
                      type: 'pattern',
                      pattern: 'solid',
                      fgColor: { argb: 'FFFFFF00' },
                      bgColor: { argb: 'FF0000FF' }
                  };
                  cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; */
                cell.font = { size: 12, bold: true };
                worksheet.getColumn(index).width = header[index - 1].length < 20 ? 20 : header[index - 1].length;
                //TIPO DE DATO CELDA
            });

            // Get all columns from JSON
            let columnsArray: any[];
            for (const key in listados) {
                if (listados.hasOwnProperty(key)) {
                    columnsArray = Object.keys(listados[key]);
                }
            }

            // Add Data and Conditional Formatting
            listados.forEach((element: any) => {

                const eachRow = [];
                columnsArray.forEach((column) => {
                    eachRow.push(element[column]);
                });

                if (element.isDeleted === 'Y') {
                    const deletedRow = worksheet.addRow(eachRow);
                    deletedRow.eachCell((cell) => {
                        cell.font = { name: 'Calibri', family: 4, size: 11, bold: false, strike: true };
                    });
                } else {
                    worksheet.addRow(eachRow);
                }
            });

            workbook.xlsx.writeBuffer().then((data: ArrayBuffer) => {
                const blob = new Blob([data], { type: EXCEL_TYPE });
                //FileSaver.saveAs(blob, excelFileName + formatDateeExcel(DiaExcel) + EXCEL_EXTENSION);
                FileSaver.saveAs(blob,formatDateeExcel(DiaExcel) + excelFileName + EXCEL_EXTENSION);
            });
    }
    public generateReporteComsionesventasvigentesVDP(json: any[], excelFileName: string): void { 

        
        //CABECERA
        const header = [
            "Póliza",
            "Contratante",
            "Documento del contratante",
            "Tipo documento del contratante",
            "Asesor",
            "Documento del asesor",
            "Tipo documento del asesor",
            "Jefe",
            "Documento del jefe",
            "Tipo documento del jefe",
            "Supervisor",
            "Documento del supervisor",
            "Tipo documento del supervisor",
            "Asegurado",
            "Documento del asegurado",
            "TEMPORALIDAD",
            "MONEDA",
            "FRECUENCIA DE PAGO",
            "NRO COMISIONES TOTALES",
            "PRIMA REGULAR",
            "PRIMA MENSUAL REGULAR",
            "PRIMA REGULAR SEGÚN FRECUENCIA DE PAGO (S/)",
            "PRIMA REGULAR SEGÚN FRECUENCIA DE PAGO ($)",
            "MONTO TOTAL DE COMISIÓN (S/)",
            "NRO. COMISIÓN A PAGAR",
            "MES PAGO COMISIÓN",
            "COMISIÓN A PAGAR (S/)",
            "TOTAL DE COMISIONES PAGADAS",
            "MONTO DE COMISIONES PAGADO",
            "ESTADO DE LA PÓLIZA",
            "TC DEL MES DE PAGO",
        ];

        const listados = [];
        for (let i = 0; i < json.length; i++) {

            const object = {

                x1: json[i].npolicy,
                x3: json[i].nom_contratante,
                x2: json[i].dni_contratante,
                x4: json[i].tipo_documento_contratante,
                x6: json[i].asesor_venta,
                x5: json[i].dni_asesor,
                x7: json[i].tipo_documento_asesor,

                x8:json[i].jefe,
                x9: json[i].dni_jefe,
                x10: json[i].tipo_documento_jefe,

                x11: json[i].supervisor,
                x12: json[i].dni_supervisor,
                x13:json[i].tipo_documento_supervisor,

                x15: json[i].nom_asegruado,
                x14: json[i].dni_asegurado,
                x16: json[i].temporalidad, 
                x17: json[i].moneda,
                x18: json[i].frecuencia_pago,
                x19: json[i].total_nro_comisiones, 
                x20: json[i].prima_regular, //MONTO
                x21: json[i].prima_regular_mensual,//MONTO
                x22: json[i].prima_mensual_frecu_soles, //MONTO
                x23: json[i].prima_mensual_frecu_dolares, //MONTO
                x24: json[i].monto_total_comision_soles, //MONTO
                x25: json[i].nro_comision, 
                x26: json[i].mes_pago_comision,
                x27: json[i].comision_pagar_soles,// MONTO
                x28: json[i].nros_pendiente_comisiones,
                x29: json[i].monto_comisiones_pagado, // MONTO
                x30: json[i].estado_poliza, 
                x31: json[i].tc_mes_pago, // MONTO
            };

            listados.push(object);

        }

            /* Create workbook and worksheet */
            const workbook = new Workbook();
            workbook.creator = 'Vida Devolución Protecta+';
            workbook.lastModifiedBy = 'Vida Devolución Protecta+';
            workbook.created = new Date();
            workbook.modified = new Date();
            const worksheet = workbook.addWorksheet('Reporte');
            //worksheet.addRow([]);  //AGREGAR FILA
            const headerRow = worksheet.addRow(header);

            headerRow.eachCell((cell, index) => {

                /*   cell.fill = {
                      type: 'pattern',
                      pattern: 'solid',
                      fgColor: { argb: 'FFFFFF00' },
                      bgColor: { argb: 'FF0000FF' }
                  };
                  cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; */
                cell.font = { size: 12, bold: true };
                worksheet.getColumn(index).width = header[index - 1].length < 20 ? 20 : header[index - 1].length;
                //TIPO DE DATO CELDA
                worksheet.getColumn(10).numFmt = '#,##0.00'
                worksheet.getColumn(11).numFmt = '#,##0.00'
                worksheet.getColumn(12).numFmt = '#,##0.00'
                worksheet.getColumn(13).numFmt = '#,##0.00'
                worksheet.getColumn(14).numFmt = '#,##0.00'
                worksheet.getColumn(17).numFmt = '#,##0.00'
                worksheet.getColumn(19).numFmt = '#,##0.00'
                worksheet.getColumn(21).numFmt = '#,##0.00'
            });

            // Get all columns from JSON
            let columnsArray: any[];
            for (const key in listados) {
                if (listados.hasOwnProperty(key)) {
                    columnsArray = Object.keys(listados[key]);
                }
            }

            // Add Data and Conditional Formatting
            listados.forEach((element: any) => {

                const eachRow = [];
                columnsArray.forEach((column) => {
                    eachRow.push(element[column]);
                });

                if (element.isDeleted === 'Y') {
                    const deletedRow = worksheet.addRow(eachRow);
                    deletedRow.eachCell((cell) => {
                        cell.font = { name: 'Calibri', family: 4, size: 11, bold: false, strike: true };
                    });
                } else {
                    worksheet.addRow(eachRow);
                }
            });

            workbook.xlsx.writeBuffer().then((data: ArrayBuffer) => {
                const blob = new Blob([data], { type: EXCEL_TYPE });
                //FileSaver.saveAs(blob, excelFileName + formatDateeExcel(DiaExcel) + EXCEL_EXTENSION);
                FileSaver.saveAs(blob, excelFileName + EXCEL_EXTENSION);
            });
    }
    private saveAsExcelFile(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], {
            type: 'application/octet-stream'
        });
        FileSaver.saveAs(
            data,
            fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
        );
    }

    //Reporte Tecnico de Desgravamen con Devolución
    public generateReportTecnicExcel(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'POLIZA',
                    B: 'CERTIFICADO',
                    C: 'CONTRATANTE',
                    D: 'TIPO DOCUMENTO_CON',
                    E: 'NRO DOCUMENTO_CON',
                    F: 'ASEGURADO',
                    G: 'TIPO DOCUMENTO_ASE',
                    H: 'NRO DOCUMENTO_ASE',
                    I: 'NACIMIENTO',
                    J: 'SUMA ASEGURADA FALLECIMIENTO NATURAL',
                    K: 'SUMA ASEGURADA FALLECIMIENTO ACCIDENTAL',
                    L: 'PRIMA MENSUAL',
                    M: 'PRIMA ANUAL',
                    N: 'PRIMERA PRIMA',
                    O: 'ABONO',
                    P: 'FECHA INICIO VIGENCIA',
                    Q: 'FECHA EMISION',
                    R: 'TEMPORALIDAD',
                    S: 'MONEDA',
                    T: 'POR DEVOLUCION',
                    U: 'COTIZACION',
                    V: 'COD_SEXO',
                    W: 'CUOTAS VENCIDAS',
                    X: '¿VIGENTE?'
                }
            ],
            {
                header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X'],
                skipHeader: true
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].POLIZA,
                B: json[i].CERTIFICADO,
                C: json[i].NOMBRES,
                D: json[i].TIPO_DOC,
                E: json[i].NRO_DOC,
                F: json[i].ASEGURADO,
                G: json[i].TIPO_DOCUMENTO,
                H: json[i].NRO_DOCUMENTO,
                I: json[i].NACIMIENTO,
                J: json[i].SUMA_ASEGURADA_COVER1,
                K: json[i].SUMA_ASEGURADA_COVER2,
                L: json[i].PRIMA_MENSUAL,
                M: json[i].PRIMA_ANUAL,
                N: json[i].PRIMERA_PRIMA,
                O: json[i].ABONO,
                P: json[i].FECHA_INICIO_VIGENCIA,
                Q: json[i].FECHA_EMISION,
                R: json[i].TEMPORALIDAD,
                S: json[i].MONEDA,
                T: json[i].POR_DEVOLUCION,
                U: json[i].COTIZACION,
                V: json[i].COD_SEXO,
                W: json[i].CUOTAS_VENCIDAS,
                X: json[i].VIGENTE
            };

            listados.push(object);
        }
        XLSX.utils.sheet_add_json(ws, listados, {
            skipHeader: true,
            origin: 'A2'
        });

        const workbook: XLSX.WorkBook = {
            Sheets: { data: ws },
            SheetNames: ['data']
        };
        const excelBuffer: any = XLSX.write(workbook, {
            bookType: 'xlsx',
            bookSST: false,
            type: 'array'
        });

        this.saveAsExcelFile(excelBuffer, excelFileName);

    }

    //Reporte Operaciones de Desgravamen con Devolución
    public generateReportOperacVigExcel(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: "POLIZA",
                    B: "CERTIFICADO",
                    C: "CONTRATANTE",
                    D: "TIPO DOCUMENTO_CON",
                    E: "NRO DOCUMENTO_CON",
                    F: "ASEGURADO",
                    G: "TIPO DOCUMENTO_ASE",
                    H: "NRO DOCUMENTO_ASE",
                    I: "CORREO ELECTRONICO",
                    J: "CELULAR",
                    K: "DIRECCIÓN",
                    L: "DISTRITO",
                    M: "PROVINCIA",
                    N: "DEPARTAMENTO",
                    O: "NACIMIENTO",
                    P: "FECHA FALLECIMIENTO",
                    Q: "SUMA ASEGURADA FALLECIMIENTO NATURAL",
                    R: "SUMA ASEGURADA FALLECIMIENTO ACCIDENTAL",
                    S: "PRIMERA PRIMA",
                    T: "PRIMA MENSUAL",
                    U: "PRIMERA PRIMA ANUAL",
                    V: "MONTO DE PRIMAS",
                    W: "ABONO",
                    X: "FECHA INICIO VIGENCIA",
                    Y: "FECHA EMISIÓN",
                    Z: "TEMPORALIDAD",
                    AA: "MONEDA",
                    AB: "% POR DEVOLUCIÓN",
                    AC: "SEXO",
                    AD: "CUOTAS VENCIDAS",
                    AE: "CUOTAS PAGADAS",
                    AF: "ESTADO DE PÓLIZA",
                    AG: "FECHA FIN VIGENCIA",
                    AH: "NRO RECIBO",
                    AI: "NRO BOLETA",
                    AJ: "ESTADO DE BOLETA SUNAT",
                    AK: "FECHA DE EMISIÓN DE BOLETA",
                    AL: "MONTO DEVOLUCIÓN",
                    AM: "JEFE",
                    AN: "SUPERVISOR",
                    AO: "DOC. ASESOR VENTA",
                    AP: "ASESOR DE VENTA",
                    AQ: "DOC. ASESOR MANT",
                    AR: "ASESOR DE MANTENIMIENTO",
                    AS: "COMISIÓN",
                    AT: "COMISIÓN PAGADA",
                    AU: "MONTO FACTURADO",
                    AV: "MONTO NO DEVENGADO",
                    AW: "ANUALIDAD",
                    AX: "NÚMERO DE MESES DEVENGADOS",
                    AY: "NÚMERO DE MESES NO DEVENGADOS"
                }
            ],
            {
                header: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "AA", "AB", "AC", "AD", "AE", "AF", "AG", "AH", "AI", "AJ", "AK", "AL", "AM", "AN", "AO", "AP", "AQ", "AR", "AS", "AT", "AU", "AV", "AW", "AX", "AY"],
                skipHeader: true
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].POLIZA,
                B: json[i].CERTIFICADO,
                C: json[i].NOMBRES,
                D: json[i].TIPO_DOC,
                E: json[i].NRO_DOC,
                F: json[i].ASEGURADO,
                G: json[i].TIPO_DOCUMENTO,
                H: json[i].NRO_DOCUMENTO,
                I: json[i].CORREO_ELECTRONICO,
                J: json[i].CELULAR,
                K: json[i].DIRECCION,
                L: json[i].DISTRITO,
                M: json[i].PROVINCIA,
                N: json[i].DEPARTAMENTO,
                O: json[i].NACIMIENTO,
                P: json[i].FECHA_FALLECIMIENTO,
                Q: json[i].SUMA_ASEGURADA_COVER1,
                R: json[i].SUMA_ASEGURADA_COVER2,
                S: json[i].PRIMERA_PRIMA,
                T: json[i].PRIMA_MENSUAL,
                U: json[i].PRIMERA_PRIMA_ANUAL,
                V: json[i].MONTO_PRIMAS,
                W: json[i].ABONO,
                X: json[i].FECHA_INICIO_VIGENCIA,
                Y: json[i].FECHA_EMISION,
                Z: json[i].TEMPORALIDAD,
                AA: json[i].MONEDA,
                AB: json[i].POR_DEVOLUCION,
                AC: json[i].COD_SEXO,
                AD: json[i].CUOTAS_VENCIDAS,
                AE: json[i].CUOTAS_PAGADAS,
                AF: json[i].ESTADO_POLIZA,
                AG: json[i].FECHA_FIN_VIGENCIA,
                AH: json[i].NRO_RECIBO,
                AI: json[i].NRO_BOLETA,
                AJ: json[i].ESTADO_BOLETA,
                AK: json[i].FECHA_BOLETA,
                AL: json[i].MONTO_DEVOLUCION,
                AM: json[i].JEFE,
                AN: json[i].SUPERVISOR,
                AO: json[i].DOC_ASESOR_VENTA,
                AP: json[i].ASESOR_VENTA,
                AQ: json[i].DOC_ASESOR_MANT,
                AR: json[i].ASESOR_MANT,
                AS: json[i].COMISION,
                AT: json[i].COMISION_PAGADA,
                AU: json[i].MONTO_FACTURADO,
                AV: json[i].MONTO_NO_DEVENGADO,
                AW: json[i].ANUALIDAD,
                AX: json[i].NUMERO_CUOTAS_DEVENGADAS,
                AY: json[i].NUMERO_MESES_NO_DEVENGADAS,
            };

            listados.push(object);
        }
        XLSX.utils.sheet_add_json(ws, listados, {
            skipHeader: true,
            origin: 'A2'
        });

        const workbook: XLSX.WorkBook = {
            Sheets: { data: ws },
            SheetNames: ['data']
        };
        const excelBuffer: any = XLSX.write(workbook, {
            bookType: 'xlsx',
            bookSST: false,
            type: 'array'
        });

        this.saveAsExcelFile(excelBuffer, excelFileName);

    }


    public generateReportOperacAnulExcel(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: "POLIZA",
                    B: "CERTIFICADO",
                    C: "CONTRATANTE",
                    D: "TIPO DOCUMENTO_CON",
                    E: "NRO DOCUMENTO_CON",
                    F: "ASEGURADO",
                    G: "TIPO DOCUMENTO_ASE",
                    H: "NRO DOCUMENTO_ASE",
                    I: "CORREO ELECTRONICO",
                    J: "CELULAR",
                    K: "DIRECCIÓN",
                    L: "DISTRITO",
                    M: "PROVINCIA",
                    N: "DEPARTAMENTO",
                    O: "NACIMIENTO",
                    P: "FECHA FALLECIMIENTO",
                    Q: "SUMA ASEGURADA FALLECIMIENTO NATURAL",
                    R: "SUMA ASEGURADA FALLECIMIENTO ACCIDENTAL",
                    S: "PRIMERA PRIMA",
                    T: "PRIMA MENSUAL",
                    U: "PRIMERA PRIMA ANUAL",
                    V: "MONTO DE PRIMAS",
                    W: "EXTORNO ANUAL",
                    X: "EXTORNO PRIMAS",
                    Y: "ABONO",
                    Z: "FECHA INICIO VIGENCIA",
                    AA: "FECHA EMISIÓN",
                    AB: "TEMPORALIDAD",
                    AC: "MONEDA",
                    AD: "% POR DEVOLUCIÓN",
                    AE: "SEXO",
                    AF: "CUOTAS VENCIDAS",
                    AG: "CUOTAS PAGADAS",
                    AH: "ESTADO DE PÓLIZA",
                    AI: "FECHA FIN VIGENCIA",
                    AJ: "NRO RECIBO",
                    AK: "NRO BOLETA",
                    AL: "ESTADO DE BOLETA SUNAT",
                    AM: "FECHA DE EMISIÓN DE BOLETA",
                    AN: "MONEDA DE EXTORNO",
                    AO: "MONTO DEVOLUCIÓN",
                    AP: "JEFE",
                    AQ: "SUPERVISOR",
                    AR: "DOC. ASESOR VENTA",
                    AS: "ASESOR DE VENTA",
                    AT: "DOC. ASESOR MANT",
                    AU: "ASESOR DE MANTENIMIENTO",
                    AV: "COMISIÓN",
                    AW: "FECHA DE ANULACIÓN",
                    AX: "EXTORNO DE COMISIÓN",
                    AY: "COMISIÓN PAGADA",
                    AZ: "MONTO FACTURADO",
                    BA: "MONTO NO DEVENGADO",
                    BB: "ANUALIDAD",
                    BC: "NOTA DE CRÉDITO",
                    BD: "FECHA DE NOTA DE CRÉDITO",
                    BE: "BOLETA ASOCIADA A NOTA DE CRÉDITO",
                    BF: "CONVENIO NEGATIVO",
                    BG: "ANULACIÓN DE CONVENIO NEGATIVO",

                }
            ],
            {
                header: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "AA", "AB", "AC", "AD", "AE", "AF", "AG", "AH", "AI", "AJ", "AK", "AL", "AM", "AN", "AO", "AP", "AQ", "AR", "AS", "AT", "AU", "AV", "AW", "AX", "AY", "AZ", "BA", "BB", "BC", "BD", "BE", "BF", "BG"],
                skipHeader: true
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].POLIZA,
                B: json[i].CERTIFICADO,
                C: json[i].NOMBRES,
                D: json[i].TIPO_DOC,
                E: json[i].NRO_DOC,
                F: json[i].ASEGURADO,
                G: json[i].TIPO_DOCUMENTO,
                H: json[i].NRO_DOCUMENTO,
                I: json[i].CORREO_ELECTRONICO,
                J: json[i].CELULAR,
                K: json[i].DIRECCION,
                L: json[i].DISTRITO,
                M: json[i].PROVINCIA,
                N: json[i].DEPARTAMENTO,
                O: json[i].NACIMIENTO,
                P: json[i].FECHA_FALLECIMIENTO,
                Q: json[i].SUMA_ASEGURADA_COVER1,
                R: json[i].SUMA_ASEGURADA_COVER2,
                S: json[i].PRIMERA_PRIMA,
                T: json[i].PRIMA_MENSUAL,
                U: json[i].PRIMERA_PRIMA_ANUAL,
                V: json[i].MONTO_PRIMAS,
                W: json[i].EXTORNO_ANUAL,
                X: json[i].EXTORNO_PRIMAS,
                Y: json[i].ABONO,
                Z: json[i].FECHA_INICIO_VIGENCIA,
                AA: json[i].FECHA_EMISION,
                AB: json[i].TEMPORALIDAD,
                AC: json[i].MONEDA,
                AD: json[i].POR_DEVOLUCION,
                AE: json[i].COD_SEXO,
                AF: json[i].CUOTAS_VENCIDAS,
                AG: json[i].CUOTAS_PAGADAS,
                AH: json[i].ESTADO_POLIZA,
                AI: json[i].FECHA_FIN_VIGENCIA,
                AJ: json[i].NRO_RECIBO,
                AK: json[i].NRO_BOLETA,
                AL: json[i].ESTADO_BOLETA,
                AM: json[i].FECHA_BOLETA,
                AN: json[i].MONEDA_EXTORNO,
                AO: json[i].MONTO_DEVOLUCION,
                AP: json[i].JEFE,
                AQ: json[i].SUPERVISOR,
                AR: json[i].DOC_ASESOR_VENTA,
                AS: json[i].ASESOR_VENTA,
                AT: json[i].DOC_ASESOR_MANT,
                AU: json[i].ASESOR_MANT,
                AV: json[i].COMISION,
                AW: json[i].FECHA_ANULACION,
                AX: json[i].EXTORNO_COMISION,
                AY: json[i].COMISION_PAGADA,
                AZ: json[i].MONTO_FACTURADO,
                BA: json[i].MONTO_NO_DEVENGADO,
                BB: json[i].ANUALIDAD,
                BC: json[i].NOTA_CREDITO,
                BD: json[i].FECHA_NOTA_CREDITO,
                BE: json[i].BOLETA_ASOCIADA_NC,
                BF: json[i].CONVENIO_NEGATIVO,
                BG: json[i].ANULACIÓN_CONVENIO_NEGATIVO,


            };

            listados.push(object);
        }
        XLSX.utils.sheet_add_json(ws, listados, {
            skipHeader: true,
            origin: 'A2'
        });

        const workbook: XLSX.WorkBook = {
            Sheets: { data: ws },
            SheetNames: ['data']
        };
        const excelBuffer: any = XLSX.write(workbook, {
            bookType: 'xlsx',
            bookSST: false,
            type: 'array'
        });

        this.saveAsExcelFile(excelBuffer, excelFileName);

        // 
    }

    //Reporte Facturacion de Desgravamen con Devolución
    public generateReportFacturacionExcel(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'PRODUCTO',
                    B: 'TIPO',
                    C: 'MONEDA',
                    D: 'CODIGO',
                    E: 'CONTRATANTE',
                    F: 'POLIZA',
                    G: 'CERTIFICADO',
                    H: 'FACTURA',
                    I: 'EMISION',
                    J: 'INICIOCOMPROB',
                    K: 'FINCOMPROB',
                    L: 'ESTADO',
                    M: 'FECEST',
                    N: 'GRACIA',
                    O: 'NETO',
                    P: 'DEREMI',
                    Q: 'IGV',
                    R: 'TOTAL',
                    S: 'RECONOCIMIENTO_DE_INGRESO_EN_MES_ANTERIOR',
                }
            ],
            {
                header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'],
                skipHeader: true
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].PRODUCTO,
                B: json[i].TIPO,
                C: json[i].MONEDA,
                D: json[i].CODIGO,
                E: json[i].CONTRATANTE,
                F: json[i].POLIZA,
                G: json[i].CERTIFICADO,
                H: json[i].FACTURA,
                I: json[i].EMISION,
                J: json[i].INICIOCOMPROB,
                K: json[i].FINCOMPROB,
                L: json[i].ESTADO,
                M: json[i].FECEST,
                N: json[i].GRACIA,
                O: json[i].NETO,
                P: json[i].DEREMI,
                Q: json[i].IGV,
                R: json[i].TOTAL,
                S: json[i].RECONOCIMIENTO_DE_INGRESO_EN_MES_ANTERIOR
            };

            listados.push(object);
        }
        XLSX.utils.sheet_add_json(ws, listados, {
            skipHeader: true,
            origin: 'A2'
        });

        const workbook: XLSX.WorkBook = {
            Sheets: { data: ws },
            SheetNames: ['data']
        };
        const excelBuffer: any = XLSX.write(workbook, {
            bookType: 'xlsx',
            bookSST: false,
            type: 'array'
        });

        this.saveAsExcelFile(excelBuffer, excelFileName);

    }

    //Reporte Convenios de Desgravamen con Devolución
    public generateReportConveniosExcel(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'PRODUCTO',
                    B: 'RIESGO',
                    C: 'RAMO',
                    D: 'EMISIONCONVENIO',
                    E: 'INICIOCONVENIO',
                    F: 'FINCONVENIO',
                    G: 'CERTIFICADO',
                    H: 'POLIZA',
                    I: 'TIPO',
                    J: 'COMPROBANTE',
                    K: 'EMISIONCOMP',
                    L: 'GRACIA',
                    M: 'FECVENCIMIENTO',
                    N: 'FECPROVISION',
                    O: 'COMPASOCIADO',
                    P: 'DOCIDENT',
                    Q: 'CONTRATANTEFACT',
                    R: 'MONEDA',
                    S: 'NETO',
                    T: 'DEREMI',
                    U: 'IGV',
                    V: 'TOTAL',
                    W: 'CONTRATANTEPOLIZA',
                    X: 'INTERMEDIARIO1',
                    Y: 'COMISION1',
                    Z: 'INTERMEDIARIO1_1',
                    AA: 'COMISION2',
                    AB: 'GASTOTECNICO',
                    AC: 'PAGOASISTENCIAS',
                    AD: 'TIPOCONVENIO',
                    AE: 'RECIBO',
                    AF: 'COMENTARIOS',
                }
            ],
            {
                header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF'],
                skipHeader: true
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].PRODUCTO,
                B: json[i].RIESGO,
                C: json[i].RAMO,
                D: json[i].EMISIONCONVENIO,
                E: json[i].INICIOCONVENIO,
                F: json[i].FINCONVENIO,
                G: json[i].CERTIFICADO,
                H: json[i].POLIZA,
                I: json[i].TIPO,
                J: json[i].COMPROBANTE,
                K: json[i].EMISIONCOMP,
                L: json[i].GRACIA,
                M: json[i].FECVENCIMIENTO,
                N: json[i].FECPROVISION,
                O: json[i].COMPASOCIADO,
                P: json[i].DOCIDENT,
                Q: json[i].CONTRATANTEFACT,
                R: json[i].MONEDA,
                S: json[i].NETO,
                T: json[i].DEREMI,
                U: json[i].IGV,
                V: json[i].TOTAL,
                W: json[i].CONTRATANTEPOLIZA,
                X: json[i].INTERMEDIARIO1,
                Y: json[i].COMISION1,
                Z: json[i].INTERMEDIARIO1_1,
                AA: json[i].COMISION2,
                AB: json[i].GASTOTECNICO,
                AC: json[i].PAGOASISTENCIAS,
                AD: json[i].TIPOCONVENIO,
                AE: json[i].RECIBO,
                AF: json[i].COMENTARIOS
            };

            listados.push(object);
        }
        XLSX.utils.sheet_add_json(ws, listados, {
            skipHeader: true,
            origin: 'A2'
        });

        const workbook: XLSX.WorkBook = {
            Sheets: { data: ws },
            SheetNames: ['data']
        };
        const excelBuffer: any = XLSX.write(workbook, {
            bookType: 'xlsx',
            bookSST: false,
            type: 'array'
        });

        this.saveAsExcelFile(excelBuffer, excelFileName);

    }


    //Reporte Comisiones de Desgravamen con Devolución
    public generateReportComisionesExcel(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'TIPO',
                    B: 'CONTRATANTE',
                    C: 'INTERMEDIARIO_CANAL',
                    D: 'POLIZA',
                    E: 'CODIGO_SBS',
                    F: 'PRODUCTO_ASOCIADO',
                    G: 'RAMO',
                    H: 'MONEDA',
                    I: 'IMPORTE_COMISION',
                    J: 'IMPORTE_COMISION_EXTORNADO_NC',
                }
            ],
            {
                header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
                skipHeader: true
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].TIPO,
                B: json[i].CONTRATANTE,
                C: json[i].INTERMEDIARIO_CANAL,
                D: json[i].POLIZA,
                E: json[i].CODIGO_SBS,
                F: json[i].PRODUCTO_ASOCIADO,
                G: json[i].RAMO,
                H: json[i].MONEDA,
                I: json[i].IMPORTE_COMISION,
                J: json[i].IMPORTE_COMISION_EXTORNADO_NC
            };

            listados.push(object);
        }
        XLSX.utils.sheet_add_json(ws, listados, {
            skipHeader: true,
            origin: 'A2'
        });

        const workbook: XLSX.WorkBook = {
            Sheets: { data: ws },
            SheetNames: ['data']
        };
        const excelBuffer: any = XLSX.write(workbook, {
            bookType: 'xlsx',
            bookSST: false,
            type: 'array'
        });

        this.saveAsExcelFile(excelBuffer, excelFileName);

    }


    //Reporte Comisiones de Desgravamen con Devolución
    public generateReportProviComisionesExcel(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'Reporte',
                    B: 'Código Ramo',
                    C: 'Ramo',
                    D: 'Código Producto:',
                    E: 'Producto',
                    F: 'Póliza',
                    G: 'Recibo',
                    H: 'Estado del Recibo',
                    I: 'Tipo del comprobante',
                    J: 'Número del Comprobante',
                    K: 'Comprobante',
                    L: 'Estado Comprobante',
                    M: 'Moneda',
                    N: 'Contratante',
                    O: 'Fecha de Provisión',
                    P: 'Inicio de Periodo que Pasó Interfaz',
                    Q: 'Fin de Periodo que Pasó Interfaz',
                    R: 'Provisión Intermediario',
                    S: 'Monto que se Pagó – Intermediario',
                    T: 'Provisión Comercializador',
                    U: 'Monto que se Pagó - Comercializador',
                    V: 'Provisión Banca seguros',
                    W: 'Monto que se Pagó – Banca seguros',
                    X: 'Estado de la Comisión',
                    Y: 'Fecha en que se Autorizó',
                    Z: 'Usuario que lo Autorizó',
                }
            ],
            {
                header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
                skipHeader: true
            }
        );
//nbranch,sbranch,nproduct,sproduct,npolicy,nreceipt,
//sstatus_rec,stype_comp,nbillnum,COMPROBANTE,sstatus_comp
//moneda,contratante,dprov_interfaz,ini_per,fin_per,
//dauto_comm,sstate_com,ncomm_pago_inter,ncomm_pago_comer
//ncomm_pago_bys,nprov_comm_int,nprov_comm_com,nprov_com_bys suser_auto

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].TIPO,
                B: json[i].nbranch,
                C: json[i].sbranch,
                D: json[i].nproduct,
                E: json[i].sproduct,
                F: json[i].npolicy,
                G: json[i].nreceipt,
                H: json[i].sstatus_rec,
                I: json[i].stype_comp,
                J: json[i].nbillnum,
                K: json[i].COMPROBANTE,
                L: json[i].sstatus_comp,
                M: json[i].moneda,
                N: json[i].contratante,
                O: json[i].dprov_interfaz,
                P: json[i].ini_per,
                Q: json[i].fin_per,
                R: json[i].nprov_comm_int,
                S: json[i].ncomm_pago_inter,
                T: json[i].nprov_comm_com,
                U: json[i].ncomm_pago_comer,
                V: json[i].nprov_com_bys,
                W: json[i].ncomm_pago_bys,
                X: json[i].sstate_com,
                Y: json[i].dauto_comm,
                Z: json[i].suser_auto
            };

            listados.push(object);
        }
        XLSX.utils.sheet_add_json(ws, listados, {
            skipHeader: true,
            origin: 'A2'
        });

        const workbook: XLSX.WorkBook = {
            Sheets: { data: ws },
            SheetNames: ['data']
        };
        const excelBuffer: any = XLSX.write(workbook, {
            bookType: 'xlsx',
            bookSST: false,
            type: 'array'
        });
        console.log('Generar Excel ProviComisiones');
        console.log(excelBuffer);
        console.log(excelFileName);
        this.saveAsExcelFileProviComisiones(excelBuffer, excelFileName);

    }


    //Reporte Cuentasxcobrar de Desgravamen con Devolución
    public generateReportCuentasxcobrarExcel(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: 'PRODUCTO',
                    B: 'TIPODOC',
                    C: 'MONEDA',
                    D: 'DOCUMENTO_IDENTIDAD',
                    E: 'CONTRATANTE',
                    F: 'NRO_POLIZA',
                    G: 'CERTIFICADO',
                    H: 'FECHA_INICIO_POLIZA',
                    I: 'FECHA_FIN_POLIZA',
                    J: 'FECHA_INICIO_COMPROBANTE',
                    K: 'FECHA_FIN_COMPROBANTE',
                    L: 'COMPROBANTE',
                    M: 'FECHA_COMPROBANTE',
                    N: 'FECHA_VENCIMIENTO',
                    O: 'DIAS',
                    P: 'ESTADO',
                    Q: 'FECEST',
                    R: 'NETO',
                    S: 'D_E',
                    T: 'IGV',
                    U: 'TOTAL',
                }
            ],
            {
                header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U'],
                skipHeader: true
            }
        );

        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].PRODUCTO,
                B: json[i].TIPODOC,
                C: json[i].MONEDA,
                D: json[i].DOCUMENTO_IDENTIDAD,
                E: json[i].CONTRATANTE,
                F: json[i].NRO_POLIZA,
                G: json[i].CERTIFICADO,
                H: json[i].FECHA_INICIO_POLIZA,
                I: json[i].FECHA_FIN_POLIZA,
                J: json[i].FECHA_INICIO_COMPROBANTE,
                K: json[i].FECHA_FIN_COMPROBANTE,
                L: json[i].COMPROBANTE,
                M: json[i].FECHA_COMPROBANTE,
                N: json[i].FECHA_VENCIMIENTO,
                O: json[i].DIAS,
                P: json[i].ESTADO,
                Q: json[i].FECEST,
                R: json[i].NETO,
                S: json[i].D_E,
                T: json[i].IGV,
                U: json[i].TOTAL
            };

            listados.push(object);
        }
        XLSX.utils.sheet_add_json(ws, listados, {
            skipHeader: true,
            origin: 'A2'
        });

        const workbook: XLSX.WorkBook = {
            Sheets: { data: ws },
            SheetNames: ['data']
        };
        const excelBuffer: any = XLSX.write(workbook, {
            bookType: 'xlsx',
            bookSST: false,
            type: 'array'
        });

        this.saveAsExcelFile(excelBuffer, excelFileName);

    }


    private saveAsExcelFilesucave(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], {
            type: 'application/octet-stream'
        });
        FileSaver.saveAs(
            data,
            fileName + EXCEL_EXTENSION
        );
    }


    public exportAsExcelFilesucave(json: any[], excelFileName: string): void {
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFilesucave(excelBuffer, excelFileName);
    }

    public generateRecordCommissionVDP(json: any[], excelFileName: string): void {

        console.log(json);

        //CABECERA
        const header = [
            "Mes de inicio de comisión",
            "Cantidad de meses de comisión",
            "Fecha de inicio de comisión",

            "Estado",
            "Usuario de registro",
            "Fecha de registro",

            "Usuario de aprobación/rechazo",
            "Fecha de aprobación/rechazo",
            "Se puede editar la configuración?"
        ];

        const listados = [];
        for (let i = 0; i < json.length; i++) {

            const object = {
                A: json[i].ninI_MONTH,
                B: json[i].ncantmonths,
                C: json[i].deffecdate,

                D: json[i].desC_STATE,
                E: json[i].desC_USU_REGISTER,
                F: json[i].dinidate,

                G: json[i].desC_USU_APROB,
                H: json[i].deffecdatE_ACTION,
                I: json[i].confiG_EDITABLE, 
            };

            listados.push(object);
        }

        /* Create workbook and worksheet */
        const workbook = new Workbook();
        workbook.creator = 'Vida Devolución Protecta+';
        workbook.lastModifiedBy = 'Vida Devolución Protecta+';
        workbook.created = new Date();
        workbook.modified = new Date();
        const worksheet = workbook.addWorksheet('Reporte');
        const headerRow = worksheet.addRow(header);

        headerRow.eachCell((cell, index) => {

            /*   cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFFFFF00' },
                  bgColor: { argb: 'FF0000FF' }
              };
              cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; */
            cell.font = { size: 12, bold: true };
            worksheet.getColumn(index).width = header[index - 1].length < 20 ? 20 : header[index - 1].length;
            //TIPO DE DATO CELDA
        });

        // Get all columns from JSON
        let columnsArray: any[];
        for (const key in listados) {
            if (listados.hasOwnProperty(key)) {
                columnsArray = Object.keys(listados[key]);
            }
        }

        // Add Data and Conditional Formatting
        listados.forEach((element: any) => {

            const eachRow = [];
            columnsArray.forEach((column) => {
                eachRow.push(element[column]);
            });

            if (element.isDeleted === 'Y') {
                const deletedRow = worksheet.addRow(eachRow);
                deletedRow.eachCell((cell) => {
                    cell.font = { name: 'Calibri', family: 4, size: 11, bold: false, strike: true };
                });
            } else {
                worksheet.addRow(eachRow);
            }
        });

        workbook.xlsx.writeBuffer().then((data: ArrayBuffer) => {
            const blob = new Blob([data], { type: EXCEL_TYPE });
            FileSaver.saveAs(blob, excelFileName + formatDateeExcel(DiaExcel) + EXCEL_EXTENSION);
        });
    }

}
