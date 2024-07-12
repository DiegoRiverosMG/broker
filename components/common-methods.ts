// JSON Template
import configTemplate from '../../../../assets/json/config-template.json';
import configVariables from '../../../../assets/json/config-variables.json';
import { environment } from '../../../../environments/environment';

export class CommonMethods {
  /**
 * Convierte una lista en un texto html para ser mostrado en los pop-up de alerta
 * @param list lista ingresada
 * @returns  string en html
 */
  static listToString(list: String[]): string {
    let output = '';
    if (list != null && list.length > 0) {
      list.forEach(function (item) {
        output = output + item + ' <br>';
      });
    }
    return output;
  }

  static validateDecimals(int: any, decimal: any, input: any): string {
    let error = '';
    const strExpresion = '^[0-9]{' + int + '}(\.[0-9]{' + decimal + '})?$';
    const expresion = new RegExp(strExpresion);
    const length = int.toString().length;
    const splitInt = int.split(',');
    const value = this.obtenerNumero(splitInt[1]);
    const splitDecimal = decimal.split(',');
    if (!expresion.test(input) || input >= value) {
      if (!expresion.test(input)) {
        error = 'Máximo ' + splitDecimal[1] + ' decimales';
      } else {
        error = 'El valor debe ser menor a ' + value;
      }
    }

    return error;
  }

  static validateEnteros(int: any, input: any): string {
    let error = '';
    const length = int.toString().length;
    const splitInt = int.split(',');
    const value = this.obtenerNumero(splitInt[1]);
    if (Number(input) >= value) {
      error = 'El valor debe ser menor a ' + value;
    }

    return error;
  }

  static obtenerNumero(int: any): number {
    let valor: number;
    switch (int) {
      case '1': valor = 10; break;
      case '2': valor = 100; break;
      case '3': valor = 1000; break;
      case '4': valor = 10000; break;
      case '5': valor = 100000; break;
      case '6': valor = 1000000; break;
      case '7': valor = 10000000; break;
      case '8': valor = 100000000; break;
      case '9': valor = 1000000000; break;
      case '10': valor = 10000000000; break;
      case '11': valor = 100000000000; break;
      case '12': valor = 1000000000000; break;
      case '13': valor = 10000000000000; break;
      case '14': valor = 100000000000000; break;
      case '15': valor = 1000000000000000; break;
    }

    return valor;
  }

  static isNumber(input: any): boolean {
    if (input == null || input.toString().trim() === '') {
      return false;
    } else {
      return !isNaN(input);
    }
  }
  static ConvertToReadableNumber(input: any) {
    if (this.isNumber(input)) {
      return input;
    } else {
      return 0;
    }
  }

  static selTipoDocumento(tipoDocumento) {
    const response: any = {};
    switch (tipoDocumento) {
      case '':
        response.maxlength = 0;
        response.minlength = 0;
        response.campoValidado = false;
        break;
      case '1':
        response.maxlength = 11;
        response.minlength = 11;
        response.campoValidado = false;
        break;
      case '2':
        response.maxlength = 8;
        response.minlength = 8;
        response.campoValidado = false;
        break;
      case '4':
        response.maxlength = 12;
        response.minlength = 8;
        response.campoValidado = false;
        break;
      case '6':
        response.maxlength = 12;
        response.minlength = 8;
        response.campoValidado = false;
        break;
      default:
        response.maxlength = 15;
        response.minlength = 8;
        response.campoValidado = false;
        break;
    }
    return response;
  }

  static validarNroDocumento(event: any, tipoDocumento) {
    let pattern;
    switch (tipoDocumento) {
      case '0': { // sin codigo
        pattern = /[0-9]/;
        break;
      }
      case '1': { // ruc
        pattern = /[0-9]/;
        break;
      }
      case '2': { // dni
        pattern = /[0-9]/;
        break;
      }
      case '4': { // ce
        pattern = /[0-9A-Za-z]/;
        break;
      }
      default: {
        pattern = /[0-9A-Za-z]/;
        break;
      }
    }

    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  static textValidate(event: any, textType) {
    let pattern;
    switch (textType) {
      case 1: { // Numericos
        pattern = /[0-9]/;
        break;
      }
      case 2: { // Alfanumericos sin espacios
        pattern = /[0-9A-Za-zñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü]/;
        break;
      }
      case 3: { // Alfanumericos con espacios
        pattern = /[0-9A-Za-zñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü ]/;
        break;
      }
      case 4: { // LegalName
        pattern = /[a-zA-ZñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü0-9-,:()&$#'. ]/;
        break;
      }
      case 5: { // Solo texto
        pattern = /[A-Za-zñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü ]/;
        break;
      }
      case 6: { // Email
        pattern = /[0-9A-Za-z._@-]/;
        break;
      }
      case 7: { // Comprobante rebill
        pattern = /[0-9bfBF-]/;
        break;
      }
    }

    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  static configuracionTemplate(productoId, epsId) {
    let response = {};
    configTemplate.forEach(item => {
      if (item.codProducto === productoId + epsId) {
        response = item;
      }
    });
    return response;
  }

  static configuracionVariables(productoId, epsId) {
    let response = {};
    configVariables.forEach(item => {
      if (item.codProducto === productoId + epsId) {
        response = item;
      }
    });
    return response;
  }

  static tituloProducto(nomProducto, nomCompania) {
    const lblTitulo = 'Producto: ' + nomProducto + ' - ' + nomCompania;
    return lblTitulo;
  }

  static tituloPantalla() {
    const fechaActual = new Date();
    const lblTitulo = 'Fecha actual: ' + this.formatDate(fechaActual);
    return lblTitulo;
  }

  static generarCampos(nroCampos, key): any {
    const response: any = [];

    for (let i = 0; i < nroCampos; i++) {
      if (key === 0) {
        response[i] = false;
      }
      if (key === 1) {
        const item: any = {};
        item.id = i.toString();
        item.value = false;
        response.push(item);
      }
    }

    return response;
  }

  static formatDate(fecha): any {
    if (fecha) {
      return fecha.getDate().toString().padStart(2, '0') + '/' +
        (fecha.getMonth() + 1).toString().padStart(2, '0') + '/' +
        fecha.getFullYear();
    }
  }

    static formatDateFirst(fecha): any {
        if (fecha) {
            return '01' + '/' +
                (fecha.getMonth() + 1).toString().padStart(2, '0') + '/' +
                fecha.getFullYear();
        }
    }

  static formatDateCalculate(fecha): any {
    return fecha.getFullYear() + '-' +
      (fecha.getMonth() + 1).toString().padStart(2, '0') + '-' +
      fecha.getDate().toString().padStart(2, '0');
  }

  static validateRuc(numRuc) {
    const rucLength = numRuc.trim().length;

    if (rucLength !== 11) {
        return false;
    }

    return numRuc.substr(0, 2) !== '10' && numRuc.substr(0, 2) !== '15' && numRuc.substr(0, 2) !== '17' && numRuc.substr(0, 2) !== '20';
  }


  static validateRucDesDev(numRuc) {
        return numRuc.substr(0, 2) !== '20' || numRuc.trim().length < 11;
  }

  static validateRucEndo(numRuc) {
    return numRuc.substr(0, 2) !== '10' && numRuc.substr(0, 2) !== '15' && numRuc.substr(0, 2) !== '17' && numRuc.trim().length < 11;
  }

  static validateRucAP(numRuc) {
    return numRuc.trim().length < 11;
  }

  static validateDNI(value) {
    return value.trim().length < 8
  }
  static validateCE(value) {
    return value.trim().length  < 8
  }
  static validatePass(value) {
    return value.trim().length  < 8
  }

  static clearValidate(list, numInput) {
    return list[numInput] = false;
  }

    static formatValor(valor, decimal, flagMatriz = 0): any { //tramite estado
    // return !isNaN(Number(valor)) ? Number(valor).toFixed(decimal) : valor
    valor = !isNaN(Number(valor)) ? Number(valor) : 0;

    if (Math.round(valor) !== valor) {
      if (Math.pow(0.1, decimal) > valor) {
        return 0;
      }
      const sign = Math.sign(valor);
      const arr = ('' + Math.abs(valor)).split('.');
      if (arr.length > 1) {
        if (arr[1].length > decimal) {
          const integ = +arr[0] * Math.pow(10, decimal);
          let dec = integ + (+arr[1].slice(0, decimal) + Math.pow(10, decimal));
          let proc = +arr[1].slice(decimal, decimal + 1);
          const proc2 = +arr[1].slice(decimal + 1, decimal + 2);
          if (proc2 >= 5) {
            proc = proc + 1;
          }
          if (proc >= 5) {
            dec = dec + 1;
          }
          dec = sign * (dec - Math.pow(10, decimal)) / Math.pow(10, decimal);
                    const arr_dec = ('' + Math.abs(dec)).split('.');
                    let ajusteDec = "";
                    if (flagMatriz) {
                        switch (decimal - arr_dec[1].length) {
                        case 1:
                        ajusteDec = "0";
                        break;

                        case 2:
                        ajusteDec = "00";
                        break;

                        case 3:
                        ajusteDec = "000";
                        break;
                        case 4:
                        ajusteDec = "0000";
                        break;

                        case 5:
                        ajusteDec = "00000";
                        break;


                      }
                      return  parseFloat(dec.toString() + ajusteDec).toFixed(decimal);
                    }


          return dec;
        }
                else if (flagMatriz && arr[1].length < decimal) {  // para mostrar los ceros a la derecha
                    let ajusteDec = "";
                     const arr_dec = ('' + Math.abs(valor)).split('.');
                    //console.log(arr_dec[1].length);
                    //console.log(Math.pow(10, decimal - arr_dec[1].length));
                    switch (decimal - arr_dec[1].length) { // decimales faltantes
                      case 1:
                      ajusteDec = "0";
                      break;

                      case 2:
                      ajusteDec = "00";
                      break;

                      case 3:
                      ajusteDec = "000";
                      break;
                      case 4:
                      ajusteDec = "0000";
                      break;

                      case 5:
                      ajusteDec = "00000";
                      break;


                    }
                    return parseFloat(valor.toString() + ajusteDec).toFixed(decimal);
                }
      }
    }

    return Number(valor).toFixed(decimal);
  }

  static formatValorNormal(valor, decimal): any {
    return !isNaN(Number(valor)) ? Number(valor).toFixed(decimal) : valor;
  }


  static alertaGratificacion(fechaIni: Date, fechaFin: Date, meses: any[], msjAlert): string {
    let txtalert = '';
    if (fechaIni !== undefined && fechaFin !== undefined) {
      for (const item of meses) {
        const fechaValida = new Date(Number(item) + '/' + 1 + '/' + fechaIni.getFullYear());
        if (fechaValida.getTime() >= fechaIni.getTime() && fechaValida.getTime() <= fechaFin.getTime()) {
          txtalert = msjAlert;
          break;
        } else {
          if (Number(item) === Number((fechaIni.getMonth() + 1)) || Number(item) === Number((fechaFin.getMonth() + 1))) {
            txtalert = msjAlert;
            break;
          }
        }
      }
    }
    return txtalert;
  }
  static clearBack() {
    console.clear();
  }

  static detectedProduct(codProductFake, validar, pensionList = null, saludList = null): number {
    let codProductReal = 0;

    switch (codProductFake) {
      case '2': { // sctr
        codProductReal = 120;
        break;
      }
      case '3': { // vida ley
        codProductReal = 117;
        break;
      }
      case '10': { // accidentes personal
        codProductReal = 10;
        break;
      }
      case '4': { // desgravament
        codProductReal = 4;
        break;
      }
      case '11': { // desgravament
        codProductReal = 11;
        break;
      }
    }

    if (validar) {
      if (pensionList != null && pensionList.length > 0) {
        codProductReal = 120;
      }

      if (saludList != null && saludList.length > 0) {
        codProductReal = 130;
      }

      if ((pensionList != null && pensionList.length > 0) && (saludList != null && saludList.length > 0)) {
        codProductReal = 120;
      }

    }

    return codProductReal;
  }

  static conceptProduct(codProductFake): string {
    let concepto = '';
    switch (codProductFake) {
      case '2': { // sctr
        concepto = 'SEGURO SCTR';
        break;
      }
      case '3': { // vida ley
        concepto = 'SEGURO VIDA LEY';
        break;
      }
      case '6': { // accidentes personal
        concepto = 'SEGURO ACCIDENTES PERSONALES';
        break;
      }
      case '7': { // accidentes personal
        concepto = 'COVID';
        break;
      }
      case '8': { // accidentes personal
        concepto = 'SEGURO VIDA GRUPO';
        break;
      }
      case '4': { // desgravament
        concepto = 'DESGRAVAMEN';
        break;
      }
      case '11': { // desgravament
        concepto = 'VIDA INDIVIDUAL DE LARGO PLAZO';
        break;
      }
    }

    return concepto;
  }

  static visaFlow(codProducto): string {
    let flow = '';

    switch (codProducto) {
      case '2': { // sctr
        flow = 'sctr';
        break;
      }
      case '3': { // vida ley
        flow = 'vidaley';
        break;
      }
      case '6': { // accidentes personales
        flow = 'accidentes';
        break;
      }
      case '7': { // covid
        flow = 'covid';
        break;
      }
      case '8': { // vida grupo
        flow = 'vidagrupo';
        break;
      }
      case '4': {
        flow = 'desgravament';
        break;
      }
      case '11': {
        flow = 'desgravament';
        break;
      }
    }

    return flow;
  }

  static commercialCode(codProducto): number {
    let commercialCode = Number(environment.codigocomercioSctr);

    switch (codProducto) {
      case '2': { // sctr
        commercialCode = Number(environment.codigocomercioSctr);
        break;
      }
      case '3': { // vida ley
        commercialCode = Number(environment.codigocomercioVidaLey);
        break;
      }
      case '7': { // covid
        commercialCode = Number(environment.codigocomercioVidaLey);
        break;
      }
    }

    return commercialCode;
  }

  static desTransaction(transaction): any {
    const transactionItem: any = {};

    switch (Number(transaction)) {
      case 1: { // emisión
        transactionItem.desTransaction = 'y la Emisión de su póliza';
        transactionItem.transac = 'Emisión';
        break;
      }
      case 2: { // inclusión
        transactionItem.desTransaction = 'e Inclusión en su póliza';
        transactionItem.transac = 'Inclusión';
        break;
      }
      case 4: { // Renovación
        transactionItem.desTransaction = 'y la Renovación de su póliza';
        transactionItem.transac = 'Renovación';
        break;
      }
      case 8: { // Endoso
        transactionItem.desTransaction = 'y el Endoso de su póliza';
        transactionItem.transac = 'Endoso';
        break;
      }
    }

    return transactionItem;
  }

    static desMoneda(monedaId): any {
        const monedaItem: any = {};

        switch (Number(monedaId)) {
            case 1: { // emisión
                monedaItem.desMoneda = 'Soles';
                monedaItem.simbolo = 'S/';
                break;
            }
            case 2: { // inclusión
                monedaItem.desMoneda = 'Dólares Americanos';
                monedaItem.simbolo = '$';
                break;
            }
        }

        return monedaItem;
    }

  static urlTimeout(productCod, typeTransaction): string {
    let url = '';

    switch (Number(productCod)) {
      case 2: { // sctr
        if (Number(typeTransaction) === 1) {
          url = 'broker/request-status';
        } else {
          url = 'broker/policy-transactions';
        }
        break;
      }
      case 3: { // vida ley
        if (Number(typeTransaction) === 1) {
          url = 'broker/request-status';
        } else {
          url = 'broker/request-status';
        }
        break;
      }
      case 7: { // covid
        if (Number(typeTransaction) === 1) {
          url = 'broker/request-status';
        } else {
          url = 'broker/request-status';
        }
        break;
      }
    }
    return url;
  }

  static dayMonth(): number {
    const fecha = new Date();
    return new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate();
  }

  static validateTextNull(data): string {
    if (data == null || data === 'null' || data === undefined) {
      data = '';
    }

    return data;
  }


  listToString(list: String[]): string {
    let output = '';
    if (list != null) {
      list.forEach(function (item) {
        output = output + item + ' <br>';
      });
    }
    return output;
  }

  static productoDescripcion(codProducto): string {
    let concepto = '';
    switch (codProducto) {
      case '120': { // sctr
        concepto = 'SEGURO SCTR';
        break;
      }
      case '117': { // vida ley
        concepto = 'SEGURO VIDA LEY';
        break;
      }
      case '10': { // accidentes personal
        concepto = 'SEGURO ACCIDENTES PERSONALES';
        break;
      }
      case '7': { // accidentes personal
        concepto = 'COVID';
        break;
      }
      case '42': { // accidentes personal
        concepto = 'VIDA GRUPO';
        break;
      }
      case '4': { // Desgravament
        concepto = 'DESGRAVAMEN';
        break;
      }
      case '11': { // Desgravament
        concepto = 'VIDA INDIVIDUAL DE LARGO PLAZO';
        break;
      }
    }

    return concepto;
  }

  static branchXproduct(product): string {
    let nbranch = '1';

    if (product == '1') {
      nbranch = '66';
    }

    if (product == '2') {
      nbranch = JSON.parse(localStorage.getItem('pensionID'))['nbranch'];
    }

    if (product == '3') {
      nbranch = JSON.parse(localStorage.getItem('vidaleyID'))['nbranch'];
    }

    if (product == '6') {
      nbranch = JSON.parse(localStorage.getItem('accPerID'))['nbranch'];
    }

    if (product == '7') {
      nbranch = JSON.parse(localStorage.getItem('covidID'))['nbranch'];
    }
    if (product == '8') {
      nbranch = JSON.parse(localStorage.getItem('vidaGrupoID'))['nbranch'];
    }
    if (product == '4') {
      nbranch = JSON.parse(localStorage.getItem('desgravamenID'))['nbranch'];
    }
    if (product == '12') {
      nbranch = JSON.parse(localStorage.getItem('vilpID'))['nbranch'];
    }
        if (product == '11') {
            nbranch = JSON.parse(localStorage.getItem('vilpID'))['nbranch'];
        }

    return nbranch;
  }

    static formatDateToISO(fecha: Date): string { //AVS - INTERCONEXION SABSA 06/11/2023
        if (fecha) {
          const year = fecha.getFullYear().toString();
          const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
          const day = fecha.getDate().toString().padStart(2, '0');

          return `${year}-${month}-${day}`;
        }
        return '';
    }

    static formatNUMBER(amount: number) {
        return amount.toLocaleString('en-US');
   }

   static formatDateToDDMMYYYY(dateString: string): string {
     // Asumimos que el formato de entrada es MM/DD/YYYY
     let [month, day, year] = dateString.split('/');
     return `${day}/${month}/${year}`;
   }

    static textFormat(text: string) {
        let processText = text != undefined ? text : '';
        let clearText = processText.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return clearText;
    }

    static TIPO_TRANSACCION: any = {
        COTIZAR: 'Cotizacion',
        EMITIR: 'Emitir',
        EMISION: 'Emision',
        EMISION_CERT: 'Emision de certificados', // 'Emisión de certificados'
        EMISION_MATRIZ: 'Emision Poliza Matriz',
        DECLARACION: 'Declaracion',
        RENOVACION: 'Renovacion',
        RENOVAR: 'Renovar',
        INCLUSION: 'Inclusion',
        INCLUIR: 'Incluir',
        EXCLUSION: 'Exclusion',
        EXCLUIR: 'Excluir',
        ENDOSO: 'Endoso',
        BROKER: 'Broker'
    };

    static TIPO_VISTAS: any = {
        COTIZACION: 'Cotizacion',
        RECOTIZAR: 'Recotizar',
        EMITIR: 'Emitir',
        EMITIRR: 'EmitirR',
        EMITIRC: 'EmitirC',
        INCLUIR: 'Incluir',
        ENDOSAR: 'Endosar',
        DECLARAR: 'Declarar',
        RENOVAR: 'Renovar',
        EXCLUIR: 'Excluir',
        EXCLUSION: 'Exclusion',
        RENEW_QUOTATION: 'RenewFromQuotation',

        ENVIAR: 'Enviar',
        EVALUAR: 'Evaluar',
        INICIADO: 'Iniciado',
        VISUALIZAR: 'Visualizar',
        AUTORIZAR: 'Autorizar',
        ASIGNAR: 'Asignar',
        EVALUAR_TRAMITE: 'Evaluar Tramite',
        CONTINUAR: 'Continuar',

        INCLUDE: 'include',
        EXCLUDE: 'exclude',
        RENEW: 'renew',
        ENDOSO: 'endosar',

    };
}