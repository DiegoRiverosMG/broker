import { Injectable } from '@angular/core';

@Injectable()
export class AccPersonalesConstants {


    public static REGEX: any = {
        PORCENTAJE: /^((100(\.0{1,2})?)|(\d{1,2}([\\.]{0,1})+(\.\d{1,6})?))$/,
        NUMBER: /^[0-9]+$/,
        DECIMAL: /^\d*\.?\d{0,2}$/,
        '1': /^[0-9]{1,11}$/, // RUC
        '2': /^[0-9]{1,8}$/, // DNI
        '4': /^[0-9A-Za-z]{1,12}$/, // CARNET DE EXTRANJERIA
        '6': /^[0-9A-Za-z]{1,12}$/, // PASAPORTE
        DOCUMENTO_DEFAULT: /^[0-9A-Za-z]{1,15}$/, // PASAPORTE
        ALFANUMERICO: /^[A-Za-z0-9\s]+$/g,
        LEGALNAME: /^[a-zA-ZñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü0-9-,:()&$#'. ]+$/,
    };

    public static MAXLENGTH: any = {
        '1': 11, // RUC
        '2': 8, // DNI
        '4': 12, // CARNET DE EXTRANJERIA
        '6': 12, // PASAPORTE

    };

    public static MINLENGTH: any = {
        '1': 11, // RUC
        '2': 8, // DNI
        '4': 8, // CARNET DE EXTRANJERIA
        '6': 8, // PASAPORTE
    };

    public static TIPO_RESPUESTA: any = {
        EXITOSO: '0',
        ERROR: '1',
        SUNAT_ERROR: '3'
    };

    public static TIPO_DOCUMENTO: any = {
        RUC: 1,
        DNI: 2
    };

    public static RAMO: any = 0;

    public static BKDIRECTO: any = "2015000002";

    public static COD_PRODUCTO: any = 0;

    public static CERTYPE: any = 3;

    public static PERFIL: any = {
        ADMIN: "5",
        TECNICA: "137",
        COMERCIAl: "7",
        OPERACIONES: "136",
        EXTERNO: "134",
    };

    public static ESTADO: any = {
        APROBADO: '2',
        APROBADO_TECNICA: '13',
        RECHAZADO: '3',
        NO_PROCEDE: '11',
    };

    public static TRANSACTION_CODE: any = {
        COTIZACION: 0,
        EMISION: 1,
        INCLUSION: 2,
        EXCLUSION: 3,
        RENOVACION: 4,
        ANULACION: 7,
        ENDOSAR: 8
    };

    public static USUARIO_OK: any = 0;
    public static USUARIO_BLOQUEADO: any = 1;
    public static USUARIO_PRIVILEGIOS: any = 2;

    public static TIPO_BUSQUEDA: any = {
        DOCUMENTO: 'POR_DOC',
        NOMBRE: 'POR_NOM'
    };

    public static TIPOS_BUSQUEDA: any = [
        { codigo: AccPersonalesConstants.TIPO_BUSQUEDA.DOCUMENTO, valor: 'POR NRO. DOCUMENTO' },
        { codigo: AccPersonalesConstants.TIPO_BUSQUEDA.NOMBRE, valor: 'POR NOMBRES' },
    ];

    public static TIPO_PERSONA: any = {
        NATURAL: 'PN',
        JURIDICA: 'PJ'
    };

    public static TIPOS_PERSONA: any = [
        { codigo: AccPersonalesConstants.TIPO_PERSONA.NATURAL, valor: 'Persona natural' },
        { codigo: AccPersonalesConstants.TIPO_PERSONA.JURIDICA, valor: 'Persona jurídica' },
    ];

    public static TIPO_CUENTA: any = {
        '1': 'Gobierno', GOBIERNO: '1',
        '2': 'Privado', PRIVADO: '2'
    };

    public static TIPO_POLIZA: any = {
        '1': 'Individual', INDIVIDUAL: '1',
        '2': 'Grupal', GRUPAL: '2'
    };

    public static TIPO_MONEDA: any = {
        SOLES: 1,
    };

    public static TIPO_RENOVACION: any = {
        ESPECIAL: 6,
    };

    public static MODO_VISTA: any = {
        COTIZAR: '',
        VISUALIZAR: 'Visualizar',
        EVALUAR: 'Evaluar',
        AUTORIZAR: 'Autorizar',
        EMITIR: 'Emitir',
        EMITIRR: 'EmitirR',
        RENOVAR: 'Renovar',
        DECLARAR: 'Declarar',
        POLIZARENOVAR: 'RenovarPoliza',
        INCLUIR: 'Incluir',
        POLIZAINCLUIR: 'InclusionPoliza',
        EXCLUIR: 'Excluir',
        ENDOSO: 'Endoso',
        ENDOSAR: 'Endosar',
        ANULACION: 'Anulacion'
    };

    public static ESTADOS: any = {
        CREADO: 'CREADO',
        AP_TECNICA: 'AP. POR TÉCNICA',
        APROBADO: 'APROBADO',
        POR_AUTORIZAR: 'POR AUTORIZAR'
    };

    public static BASE_URL: any = {
        AP: 'accidentes-personales',
        VG: 'vida-grupo'
    }

    public static FLAG_TRAMA: any = {
        SIN_TRAMA: 0
    };

    public static NRO_TRANSACCTION: any = {
        VISTAS: [['', 0], ['Evaluar', 1], ['Emitir', 1], ['EmitirR', 1], ['Renovar', 4], ['RenovarPoliza', 4], ['InclusionPoliza', 2], ['Incluir', 2], ['Excluir', 3],
        ['Endoso', 8], ['Anulacion', 7]]

    };

    public static VISTA_FORMA_PAGO: any = {
        VISTAS: [['', 0], ['Evaluar', 1], ['Emitir', 1], ['EmitirR', 1], ['Renovar', 4], ['Incluir', 2]]
    };

    public static TRX_PENDIENTES: any = {
        VISTAS: [['Emisión', 1], ['Renovación', 4], ['Declaración', 11]/*['Declaración', 4]*/, ['Inclusión', 2], ['Emision', 1], ['Renovacion', 4], ['Declaracion', 11]/*['Declaración', 4]*/, ['Inclusion', 2]]
    };

    public static PAGO_ELEGIDO: any = {
        VOUCHER: 'voucher',
        DIRECTO: 'directo',
        EFECTIVO: 'efectivo',
        OMITIR: 'omitir',
        TRANSFERENCIA: 'transferencia',
        CASH: 'cash'
    };

    public static RAMO_COMERCIAL: any = {
        ACC_PERSONALES: 61,
        VIDA_GRUPO: 72
    }

    public static PERFIL_AFORO: any = {
        ACC_PERSONALES: 6,
        VIDA_GRUPO: 6
    }

    public static PERFIL_EMPRESA: any = {
        ACC_PERSONALES: 5,
        VIDA_GRUPO: 5
    }

    public static PERFIL_INDIVIDUAL: any = {
        ACC_PERSONALES: 1,
        VIDA_GRUPO: 1
    }

    public static PRODUCTO_VGRUPO: any = {
        VIDA_GRUPO: 2,
        RENTA_ESTUDIANTIL: 3,
        MI_FAMILIA: 6
    }

    public static GRUPO_VIAJES: any = [4, 8];
    public static GRUPO_ESTUDIANTIL_AP: any = [3, 7];

    public static GRUPO_VIDA_GRUPO: any = [1, 2, 4, 5, 6];
    public static GRUPO_RENTAS_ESTUDIANTIL: any = [3, 7, 9, 10];
    public static GRUPO_MI_FAMILIA: any = [8];
}


