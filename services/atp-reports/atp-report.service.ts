import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {
    HttpClient,
    HttpHeaders,
    HttpClientModule,
} from '@angular/common/http';
import { AppConfig } from '../../../../app.config';

const EXCEL_TYPE =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet application/vnd.ms-excel;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
const PDF_EXTENSION = '.pdf';

declare const require: any;
const jsPDF = require('jspdf');
require('jspdf-autotable');

@Injectable({
    providedIn: 'root',
})
export class AtpReportService {
    private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    private Url = AppConfig.URL_API_SCTR;
    private UrlVDP = AppConfig.URL_API_REPORT;

    constructor(private http: HttpClient) { }
    // Procesar Reportes
    public ProcessReports(data: any): Observable<any> {
        const Json = {
            dStart_Date: data.dStart_Date,
            dExpir_Dat: data.dExpir_Dat,
        };
        return this.http.post(this.UrlVDP + '/Report/ReportOperationVDP', Json, {
            headers: this.headers,
        });
    }

    public ProcessReportControlDaily(data: any): Observable<any> {
        const Json = {
            dStart_Date: data.dStart_Date,
            dExpir_Dat: data.dExpir_Dat,
        };
        return this.http.post(this.UrlVDP + '/Report/ReportControlDaily', Json, {
            headers: this.headers,
        });
    }

    public ProcessReportControlMonth(data: any): Observable<any> {
        const Json = {
            dStart_Date: data.dStart_Date,
            dExpir_Dat: data.dExpir_Dat,
        };
        return this.http.post(this.UrlVDP + '/Report/ReportControlMonth', Json, {
            headers: this.headers,
        });
    }

    public ProcessReportControlYear(data: any): Observable<any> {
        const Json = {
            dStart_Date: data.dStart_Date,
            dExpir_Dat: data.dExpir_Dat,
        };
        return this.http.post(this.UrlVDP + '/Report/ReportControlYear', Json, {
            headers: this.headers,
        });
    }
    public ReportRegistryPolicies(data: any): Observable<any> {
        const Json = {
            dStart_Date: data.dStart_Date,
            dExpir_Dat: data.dExpir_Dat,
        };
        return this.http.post(
            this.UrlVDP + '/Report/ReportRegistryPolicies',
            Json,
            {
                headers: this.headers,
            }
        );
    }
    public ReportRegistryPoliciesDetail(data: any): Observable<any> {
        const Json = {
            nPolicy: data.nPolicy,
        };
        return this.http.post(
            this.UrlVDP + '/Report/ReportRegistryPoliciesDetail',
            Json,
            {
                headers: this.headers,
            }
        );
    }
    public ReportRegistryReserve(data: any): Observable<any> {
        const Json = {
            dStart_Date: data.dStart_Date,
            dExpir_Dat: data.dExpir_Dat,
        };
        return this.http.post(this.UrlVDP + '/Report/ReportRegistryReserve', Json, {
            headers: this.headers,
        });
    }

    public ProcessReportsTecVDP(data: any): Observable<any> {
        const Json = {
            dStart_Date: data.dStart_Date,
            dExpir_Dat: data.dExpir_Dat,
        };
        return this.http.post(this.UrlVDP + '/Report/ReportTecVDP', Json, {
            headers: this.headers,
        });
    }

    public ProcessClaimReport(data: any): Observable<any> {
        const Json = {
            sDocument: data.sDocument,
            nPolicy: data.nPolicy,
            sNombres: data.sNombres,
        };
        return this.http.post(this.UrlVDP + '/Report/ReportClaimATP', Json, {
            headers: this.headers,
        });
    }


    public ValProcessPersistReport(data: any): Observable<any> {
        console.log(data);
        const Json = {
            P_DEFFECDATE: data.dProcess_Date.toString(),
            NMONTHS: parseInt(data.mesecitos),
            NPROCESS: parseInt(data.procesoss),
            P_NUSERCODE: parseInt(data.nuser)
        };
        return this.http.post(this.UrlVDP + '/Report/ReportValPersistVDP', Json, {
            headers: this.headers,
        });
    }


    public ProcessPersistReport(data: any): Observable<any> {
        const Json = {
            P_DPROCESSDATE: data.dProcess_Date,
            NMONTHS: parseInt(data.mesecitos),
            NPROCESS: parseInt(data.procesoss),
            NUSERCODE: parseInt(data.nuser)
        };
        return this.http.post(this.UrlVDP + '/Report/ReportPersistVDP', Json, {
            headers: this.headers,
        });
    }

    public ProcessPersistReportByDate(data: any): Observable<any> {

        const Json = {
            P_DPROCESSDATE: data.date_proces,
            DSTARTDATE_INI: data.init_date,
            DSTARTDATE_FIN: data.fin_date,
            NUSERCODE: parseInt(data.ncode)
        };
        return this.http.post(this.UrlVDP + '/Report/ReportPersistByDateVDP', Json, {
            headers: this.headers,
        });
    }
    
    public getListaJefe(idJefe: any): Observable<any> {
        const Json = {
            codJefe: idJefe,
        };
        return this.http.post(this.UrlVDP + '/Report/GetListaJefe', Json, {
            headers: this.headers,
        });
    }

    public getListaSupervisor(idSupervisor: any): Observable<any> {
        const Json = {
            codSupervisor: idSupervisor,
        };
        return this.http.post(this.UrlVDP + '/Report/GetListaSupervisor', Json, {
            headers: this.headers,
        });
    }
    public VdpComisionReportVDP(data: any): Observable<any> {
        const Json = {
            dStart_Date: data.dStart_Date,
            dExpir_Dat: data.dExpir_Dat,
        };
        return this.http.post(this.UrlVDP + '/Report/ReportComisionVDP', Json, {
            headers: this.headers,
        });
    }

    public VdpRenovationeportVDP(data: any): Observable<any> {
        const Json = {
            dStart_Date: data.dStart_Date,
            dExpir_Dat: data.dExpir_Dat,
        };
        return this.http.post(this.UrlVDP + '/Report/ReportRenovationVDP', Json, {
            headers: this.headers,
        });
    }
    public ReportContaComisionVDP(data: any): Observable<any> {
        const Json = {
            nNum: 1,
        };
        return this.http.post(this.UrlVDP + '/Report/ReportContaComisionVDP', Json, {
            headers: this.headers,
        });
    }

    //Reporte Tecnico de Desgravamen con Devolución
    public ProcessReportsTecnic(data: any): Observable<any> {
        const Json = {
            dStart_Date: data.dStart_Date,
            dExpir_Dat: data.dExpir_Dat,
        };
        return this.http.post(this.Url + '/ReportKuntur/ReportTecnic', Json, {
            headers: this.headers,
        });
    }

    //Reporte Operaciones de Desgravamen con Devolución
    public ProcessReportsOperac(data: any): Observable<any> {
        const Json = {
            dStart_Date: data.dStart_Date,
            dExpir_Dat: data.dExpir_Dat,
        };
        return this.http.post(this.Url + '/ReportKuntur/ReportOperac', Json, {
            headers: this.headers,
        });
    }

    //Reporte Facturacion de Desgravamen con Devolución
    public ProcessReportsFacturacion(data: any): Observable<any> {
        const Json = {
            "dStart_Date": data.dStart_Date,
            "dExpir_Dat": data.dExpir_Dat,
        };
        return this.http.post(this.Url + '/ReportKuntur/ReportFacturacion', Json,
            {
                headers: this.headers
            });
    }

    //Reporte Convenios de Desgravamen con Devolución
    public ProcessReportsConvenios(data: any): Observable<any> {
        const Json = {
            "dStart_Date": data.dStart_Date,
            "dExpir_Dat": data.dExpir_Dat,
        };
        return this.http.post(this.Url + '/ReportKuntur/ReportConvenios', Json,
            {
                headers: this.headers
            });
    }

    //Reporte Comisiones de Desgravamen con Devolución
    public ProcessReportsComisiones(data: any): Observable<any> {
        const Json = {
            "dStart_Date": data.dStart_Date,
            "dExpir_Dat": data.dExpir_Dat,
        };
        return this.http.post(this.Url + '/ReportKuntur/ReportComisiones', Json,
            {
                headers: this.headers
            });
    }

    //Reporte Provision de comisiones
    public ProcessReportsProviComisiones(data: any): Observable<any> {
        const Json = {
            "nBranch": data.nBranch,
            "dStart_Date": data.dStart_Date,
            "dExpir_Dat": data.dExpir_Dat,
        };
        return this.http.post(this.Url + '/ReportKuntur/ReportProviComisiones', Json,
            {
                headers: this.headers
            });
    }

    //Reporte cuentasxcobrar de Desgravamen con Devolución
    public ProcessReportsCuentasxcobrar(data: any): Observable<any> {
        const Json = {
            "dStart_Date": data.dStart_Date,
            "dExpir_Dat": data.dExpir_Dat,
        };
        return this.http.post(this.Url + '/ReportKuntur/ReportCuentasxcobrar', Json,
            {
                headers: this.headers
            });
    }
    public ProcessReportFacturationVDP(data: any): Observable<any> {
        const Json = {
            "dStart_Date": data.dStart_Date,
            "dExpir_Dat": data.dExpir_Dat,
        };
        return this.http.post(this.UrlVDP + '/Report/ReportFacturationVDP', Json,
            {
                headers: this.headers
            });
    }
    public ProcessReportConvenioVDP(data: any): Observable<any> {
        const Json = {
            "dStart_Date": data.dStart_Date,
            "dExpir_Dat": data.dExpir_Dat,
        };
        return this.http.post(this.UrlVDP + '/Report/ReportConvenioVDP', Json,
            {
                headers: this.headers
            });
    }

    public ProcessVCFPolicyReports(data: any): Observable<any> {
        const Json = {
            "dStart_Date": data.dStart_Date,
            "dExpir_Dat": data.dExpir_Dat,
        };
        return this.http.post(this.UrlVDP + '/Report/ReportOperationVCF', Json,
            {
                headers: this.headers
            });
    }

    public ProcessVdpProvisionComisionReportGenerate(data: any): Observable<any> {
        const Json = {
            "dStart_Date": data.dStart_Date,
            "dExpir_Dat": data.dExpir_Dat,
        };
        return this.http.post(this.UrlVDP + '/Report/VdpProvisionComisionReportGenerate', Json,
            {
                headers: this.headers
            });
    }

    public ProcessVdpProvisionComisionConsultationComponent(data: any): Observable<any> {
        const Json = {
            "dStart_Date": data.dStart_Date,
            "dExpir_Dat": data.dExpir_Dat,
        };
        return this.http.post(this.UrlVDP + '/Report/VdpProvisionComisionConsultation', Json,
            {
                headers: this.headers
            });
    }

    
    public GetConfigurationComisionVDP(data: any): Observable<any> {
        const Json = {
            codigo: 0,
        };
        return this.http.post(this.UrlVDP + '/Report/GetConfigurationComisionVDP', Json, {
            headers: this.headers,
        });
    }

    public ValidarComisionVDP(data: any): Observable<any> {
        const Json = {
            "dStart_Date": data.dStart_Date,
            "dExpir_Dat": data.dExpir_Dat,
            "nusercode": data.nusercode,
            "procesovdp": data.procesovdp
        };
        return this.http.post(this.UrlVDP + '/Report/ValidarComisionVDP', Json,
            {
                headers: this.headers
            });
    }

    public TablaErroresComisionVDP(data: any): Observable<any> {
        const Json = {
            codigo: 0,
        };
        return this.http.post(this.UrlVDP + '/Report/TablaErroresComisionVDP', Json, {
            headers: this.headers,
        });
    }

    public CabeceraPreeliminar(data: any): Observable<any> {
        const Json = {
            codigo: 0,
        };
        return this.http.post(this.UrlVDP + '/Report/CabeceraPreeliminar', Json, {
            headers: this.headers,
        });
    }

    public GetCabeceraTypeProceso(data: any): Observable<any> {
        const Json = {
            codigo: 0,
        };
        return this.http.post(this.UrlVDP + '/Report/GetCabeceraTypeProceso', Json, {
            headers: this.headers,
        });
    }

    public MonitoreoReporteProvisionComisionVDP(id: any): Observable<any> {
        const Json = {
            "id": id
        };
        return this.http.post(this.UrlVDP + '/Report/MonitoreoReporteProvisionComisionVDP', Json, {
            headers: this.headers,
        });
    }

    public ReportMonitoreoComisionCabeceraVDP(data: any): Observable<any> {
        const Json = {
            dStart_Date: data.dStart_Date,
            dExpir_Dat: data.dExpir_Dat,
        };
        return this.http.post(this.UrlVDP + '/Report/ReportMonitoreoComisionCabeceraVDP', Json, {
            headers: this.headers,
        });
    }

    public ConsultaComisionVDP(data: any): Observable<any> {
        const Json = {
            dStart_Date: data.dStart_Date,
            nusercode: data.nusercode,
            procesovdp: data.procesovdp
        };
        return this.http.post(this.UrlVDP + '/Report/ConsultaComisionVDP', Json, {
            headers: this.headers,
        });
    }

    public insertarDatosConsultaComisionVDP(datos: any[]): Observable<any> {
        const jsonData = {
          data: datos,
          
        };
        console.log("VALOR QUE MANDA AL BACK: " , datos)
        return this.http.post(this.UrlVDP + '/Report/insertarDatosConsultaComisionVDP', jsonData, {
          headers: this.headers
        });
      }

      public ConsultaAutorizarComisionVDP(data: any): Observable<any> {
        const Json = {
            procesovdp: data.procesovdp,
            dStart_Date: data.dStart_Date
        };
        return this.http.post(this.UrlVDP + '/Report/ConsultaAutorizarComisionVDP', Json, {
            headers: this.headers,
        });
    }

    public GuardarAutorizarComisionVDP(datos: any[]): Observable<any> {
        const jsonData = {
          data: datos,
        };
        console.log("VALOR QUE MANDA AL BACK: " , datos)
        return this.http.post(this.UrlVDP + '/Report/GuardarAutorizarComisionVDP', jsonData, {
          headers: this.headers
        });
      }

      public GeneracionPlanillaPagosCabeceraVDP(data: any): Observable<any> {
        const Json = {
            codigo: 0,
        };
        return this.http.post(this.UrlVDP + '/Report/GeneracionPlanillaPagosCabeceraVDP', Json, {
            headers: this.headers,
        });
    }
    public GeneracionPlanillaPagos(data: any): Observable<any> {
        const Json = {
            g_fecha_fin_mes:  data.g_fecha_fin_mes,
            procesovdp: data.procesovdp,
            g_fecha_pago: data.g_fecha_pago,
            g_nusercode: data.nusercode
        };
        return this.http.post(this.UrlVDP + '/Report/GeneracionPlanillaPagos', Json, {
            headers: this.headers,
        });
    }
    public GeneracionPlanillaPagosTypeProceso(data: any): Observable<any> {
        const Json = {
            codigo: 0,
        };
        return this.http.post(this.UrlVDP + '/Report/GeneracionPlanillaPagosTypeProceso', Json, {
            headers: this.headers,
        });
    }
    public GeneracionPlanillaPagosDetalleVDP(id: any): Observable<any> {
        const Json = {
            procesovdp: id
        };
        return this.http.post(this.UrlVDP + '/Report/GeneracionPlanillaPagosDetalleVDP', Json, {
            headers: this.headers,
        });
    }

    public ObtenerDatosJefeVentas(id: any): Observable<any> {
        const Json = {
            codigo: 0,
        };
        return this.http.post(this.UrlVDP + '/Report/ObtenerDatosJefeVentas', Json, {
            headers: this.headers,
        });
    }

    public ObtenerDatosSupervisor(id: any): Observable<any> {
        const data = {
            codigoJ: id // Aquí pasas el id seleccionado como el valor del campo "codigo" en el JSON
        };
        return this.http.post(this.UrlVDP + '/Report/ObtenerDatosSupervisor', data, {
            headers: this.headers,
        });
    }

    public ReportAsesoresVentasVigentesVDP(data: any): Observable<any> {
        const Json = {
            codigo_jefe: data.codigo_jefe,
            codigo_supervisor: data.codigo_supervisor
        };
        return this.http.post(this.UrlVDP + '/Report/ReportAsesoresVentasVigentesVDP', Json, {
            headers: this.headers,
        });

    }
    public ListRecodCommissionVDP(): Observable<any> {
        // const Json = {
        //     "dStart_Date": data.dStart_Date,
        //     "dExpir_Dat": data.dExpir_Dat,
        // };
        let Json = "";
        return this.http.post(this.UrlVDP + '/Report/GetRecordCommissionVDP', Json);

    }

    public ReportAsesorPerfilVDP(data: any): Observable<any> {
        const Json = {
            dni: data.dni
        };
        return this.http.post(this.UrlVDP + '/Report/ReportAsesorPerfilVDP', Json, {
            headers: this.headers,
        });
    }

    public ReportVentasVigentesPerfilVDP(data: any): Observable<any> {
        const Json = {
            frecuencia: data.frec,
            mes_pago: data.mes,
            dni: data.dni
        };
        return this.http.post(this.UrlVDP + '/Report/ReportVentasVigentesPerfilVDP', Json, {
            headers: this.headers,
        });
    }

    public ReportSupervisorPoliciesVDP(data: any): Observable<any> {
        const Json = {
            dni: data.dni
        };
        return this.http.post(this.UrlVDP + '/Report/ReportSupervisorPoliciesVDP', Json, {
            headers: this.headers,
        });
    }

    public ReportSupervisorPoliciescomboVDP(data: any): Observable<any> {
        const Json = {
            nid_asesor: data.nid_asesor,
            nid_jefe: data.nid_jefe
        };
        return this.http.post(this.UrlVDP + '/Report/ReportSupervisorPoliciescomboVDP', Json, {
            headers: this.headers,
        });
    }

    public ReportVentasVigentesPerfilVDPSupervisor(data: any): Observable<any> {
        const Json = {
            frecuencia: data.frec,
            mes_pago: data.mes,
            dniasesor: data.dniasesor,
            dni: data.dni
        };
        return this.http.post(this.UrlVDP + '/Report/ReportVentasVigentesPerfilVDPSupervisor', Json, {
            headers: this.headers,
        });
    }

    public ReporJefePoliciesVDP(data: any): Observable<any> {
        const Json = {
            dni: data.dni
        };
        return this.http.post(this.UrlVDP + '/Report/ReporJefePoliciesVDP', Json, {
            headers: this.headers,
        });
    }

    public ReportJefePoliciescomboVDP(data: any): Observable<any> {
        const Json = {
            nid_jefe: data.nid_jefe
        };
        return this.http.post(this.UrlVDP + '/Report/ReportJefePoliciescomboVDP', Json, {
            headers: this.headers,
        });
    }
    public ReportVentasVigentesPerfilVDPJefe(data: any): Observable<any> {
        const Json = {
            frecuencia: data.frec,
            mes_pago: data.mes,
            dni: data.dni,
            dniasesor: data.dniasesor,
            dnisupervisor: data.dnisupervisor
        };
        return this.http.post(this.UrlVDP + '/Report/ReportVentasVigentesPerfilVDPJefe', Json, {
            headers: this.headers,
        });
    }

    public ReportSoporteJefecomboVDP(data: any): Observable<any> {
        const Json = {
        };
        return this.http.post(this.UrlVDP + '/Report/ReportSoporteJefecomboVDP', Json, {
            headers: this.headers,
        });
    }

    public ReportSoporteSupervisorcomboVDP(data: any): Observable<any> {
        const Json = {
            nid_jefe: data.nid_jefe
        };
        return this.http.post(this.UrlVDP + '/Report/ReportSoporteSupervisorcomboVDP', Json, {
            headers: this.headers,
        });
    }

    public ReportSoporteAsesorcomboVDP(data: any): Observable<any> {
        const Json = {
            nid_jefe: data.nid_jefe,
            nid_supervisor: data.nid_supervisor
        };
        return this.http.post(this.UrlVDP + '/Report/ReportSoporteAsesorcomboVDP', Json, {
            headers: this.headers,
        });
    }

    
}
