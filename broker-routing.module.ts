import { AuthGuard } from './guards/auth.guard';
import { AuthGuardL } from './guards/lote.guard';
import { AuthGuardC } from './guards/comlot.guard';
import { BrokerEmissionComponent } from './components/emission/broker-emission.component';
import { Component, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BrokerComponent } from './broker.component';
import { LoginComponent } from './components/login';

import { SalePanelComponent } from './components/salepanel/salepanel.component';
import { Step01Component } from './components/step01/step01.component';
import { Step02Component } from './components/step02/step02.component';
import { Step03Component } from './components/step03/step03.component';
import { Step04Component } from './components/step04/step04.component';
import { Step05Component } from './components/step05/step05.component';
import { ResultadoComponent } from './components/resultado/resultado.component';
import { ResVaucherComponent } from './components/res-vaucher/res-vaucher.component';

import { HistorialComponent } from './components/historial';
import { ReportsalesproComponent } from './components/reports/reportsalespro/reportsalespro.component';
import { ReportsalescfComponent } from './components/reports/reportsalescf/reportsalescf.component';
import { ReportsalescvComponent } from './components/reports/reportsalescv/reportsalescv.component';
import { ReportcomissproComponent } from './components/reports/reportcomisspro/reportcomisspro.component';
import { ReportcomisscvComponent } from './components/reports/reportcomisscv/reportcomisscv.component';
import { PayrollComponent } from './components/payroll/payroll.component';
import { PayrollAddComponent } from './components/payroll-add/payroll-add.component';
import { PayrollResultadoVisaComponent } from './components/payroll-resultado-visa/payroll-resultado-visa.component';
import { CommissLotComponent } from './components/commission-lot/commissionlot.component';
import { CommissionLotAddComponent } from './components/commission-lot-add/commissionlot-add.component';
import { ResPagoEfectivoComponent } from './components/res-cupon/res-cupon.component';
import { RetrievePasswordComponent } from './components/retrieve-password/retrieve-password.component';
import { RetrieveSendComponent } from './components/retrieve-send/retrieve-send.component';
import { RenewPasswordComponent } from './components/renew-password/renew-password.component';
import { PrePayrollListComponent } from './components/prepayroll/prepayroll-list/prepayroll-list.component';
import { PrePayrollAddComponent } from './components/prepayroll/prepayroll-add/prepayroll-add.component';

import { CampaignListComponent } from './components/campaign/campaign-list/campaign-list.component';
import { CampaignAddComponent } from './components/campaign/campaign-add/campaign-add.component';

import {
  PrePayrollResultadoVisaComponent
} from './components/prepayroll/prepayroll-resultado-visa/prepayroll-resultado-visa.component';
import { ReportsalescertificateComponent } from './components/reports/reportcertif/reportcertif.component';

// KUNTUR 20190812
import { QuotationComponent } from './components/quote/quotation/quotation.component';
import { RequestStatusComponent } from './components/quote/request-status/request-status.component';
import { TransactionReportComponent } from './components/reports/transaction-report/transaction-report.component';
import { InsuredReportComponent } from './components/reports/insured-report/insured-report.component';
import { StateReportComponent } from './components/reports/state-report/state-report.component';
import { PanelComponent } from './components/panel/panel.component';
import { HomeComponent } from './components/home/home.component';
// tslint:disable-next-line:max-line-length
import {
  ContractorLocationIndexComponent
} from './components/maintenance/contractor-location/contractor-location-index/contractor-location-index.component';
import { PolicyFormComponent } from './components/policy/policy-form/policy-form.component';
import { AddContractingComponent } from './components/add-contracting/add-contracting.component';
import { PolicyIndexComponent } from './components/policy/policy-index/policy-index.component';
import {
  PolicyMovementProofComponent
} from './components/policy/policy-movement-proof/policy-movement-proof.component';
import { AgencyIndexComponent } from './components/maintenance/agency/agency-index/agency-index.component';
import { AgencyFormComponent } from './components/maintenance/agency/agency-form/agency-form.component';
import { ProductComponent } from './components/product/product/product.component';
import { QuotationEvaluationComponent } from './components/quote/quotation-evaluation/quotation-evaluation.component';
import {
  ContractorStateComponent
} from './components/reports/state-report/contractor-state/contractor-state.component';
import { PolicyTransactionsComponent } from './components/policy/policy-transactions/policy-transactions.component';
import { ProcessViewerComponent } from './components/policy/process-viewer/process-viewer.component';
import { PolicyEvaluationComponent } from './components/policy/policy-evaluation/policy-evaluation.component';
import { PolicyRequestComponent } from './components/policy/policy-request/policy-request.component';
import { PolicyResultComponent } from './components/policy/policy-result/policy-result.component';
import { MonitoringComponent } from './components/bulk-load/monitoring/monitoring.component';
import { MonitoringErrorComponent } from './components/bulk-load/monitoring-error/monitoring-error.component';
import { SaleClientReportComponent } from './components/reports/sale-client-report/sale-client-report.component';
import { SaleChannelReportComponent } from './components/reports/sale-channel-report/sale-channel-report.component';
import {
  SaleEnterpriseReportComponent
} from './components/reports/sale-enterprise-report/sale-enterprise-report.component';
// tslint:disable-next-line:max-line-length
import {
  CommissionEnterpriseReportComponent
} from './components/reports/commission-enterprise-report/commission-enterprise-report.component';
import {
  CommissionChannelReportComponent
} from './components/reports/commission-channel-report/commission-channel-report.component';
// import { RecordComponent } from './components/record/record.component';
import { PayrollKunturComponent } from './components/payroll-kuntur/payroll-kuntur.component';
import { AddCoverComponent } from './components/add-cover/add-cover.component';
import { CoverIndexComponent } from './components/cover/cover-index/cover-index.component';
import { AddModuleComponent } from './components/add-module/add-module.component';
import {
  PolicyTransactionsAllComponent
} from './components/policy-all/policy-transactions-all/policy-transactions-all.component';
// tslint:disable-next-line:max-line-length
import {
  PolicyMovementDetailsAllComponent
} from './components/policy-all/policy-movement-details-all/policy-movement-details-all.component';
import { PlotComponent } from './components/bulk-load/plot/plot.component';
import { ModuleIndexComponent } from './components/module/module-index/module-index.component';
import {
  CoverSpecificInformationComponent
} from './components/cover/cover-specific-information/cover-specific-information.component';
import { CoverRateComponent } from './components/cover/cover-rate/cover-rate.component';
import { CoverRateDetailComponent } from './components/cover/cover-rate-detail/cover-rate-detail.component';
import {
  PolicyDocumentsAllComponent
} from './components/policy-all/policy-documents-all/policy-documents-all.component';
import {
  PolicyMovementCancelComponent
} from './components/policy-all/policy-movement-cancel/policy-movement-cancel.component';
import { CommissionKunturComponent } from './components/maintenance/commission/commission.component';
import { CommissionModalComponent } from './components/maintenance/commission-modal/commission-modal.component';
import {
  ProcessDemandIndexComponent
} from './components/process-demand/process-demand-index/process-demand-index.component';
import { PremiumReportComponent } from './components/premium-reports/premium-report/premium-report.component';
import {
  PremiumReportTrackingComponent
} from './components/premium-reports/premium-report-tracking/premium-report-tracking.component';
import {
  RequestProformaPolicyComponent
} from './components/consultations/request-proforma-policy/request-proforma-policy.component';
import { InterfaceCrossingComponent } from './components/consultations/interface-crossing/interface-crossing.component';
import { CurrentlyInsuredComponent } from './components/consultations/currently-insured/currently-insured.component';

import { LoginRemoteComponent } from './components/login/login-remote.component';
import { BandejaComponent } from './components/quote/bandeja/bandeja.component';
import { CommissionComponent } from './components/commission/commission.component';
import { CommissionAuthComponent } from './components/commission-auth/commission-auth.component';
import { PolicyCipComponent } from './components/policy/policy-cip/policy-cip.component';
import { CreditPoliticaComponent } from './components/gestion-Cobranzas/credit-politica/credit-politica.component';
import {
  PaymentClientStatusComponent
} from './components/gestion-Cobranzas/payment-client-status/payment-client-status.component';
import { BillReportReceiptComponent } from './components/reports/bill-report-receipt/bill-report-receipt.component';
import { QuotationCovidComponent } from './components/quote/covid/quotation-covid/quotation-covid.component';
import { RequestCovidComponent } from './components/quote/covid/request-covid/request-covid.component';
import { CovidEvaluationComponent } from './components/quote/covid/covid-evaluation/covid-evaluation.component';
import { PolicyCovidComponent } from './components/policy-all/policy-covid/policy-covid.component';
import { LoginProfileComponent } from './components/login-profile/login-profile.component';
import { MinimumPremiumComponent } from './components/maintenance/minimum-premium/minimum-premium.component';
import { ParameterSettingsComponent } from './components/maintenance/parameter-settings/parameter-settings.component';
import { LogsUsuariosComponent } from './components/logs-usuarios/logs-usuarios.component';
import { CertificadoElectronicoComponent } from './components/certificado-electronico';
import { PlataformaPanelComponent } from './components/plataforma-panel/plataforma-panel.component';
import { ComprobantesComponent } from './components/comprobantes/comprobantes.component';
import { AuthorizationComponent } from './components/authorization/authorization.component';
import { QuotationReportComponent } from './components/reports/quotation-report/quotation-report.component';
import { PreliminaryReportComponent } from './components/reports/preliminary-report/preliminary-report.component';
import { DevolucionComponent } from './components/devoluciones/devolucion/devolucion.component';
import { CorreoComponent } from './components/devoluciones/correo/correo.component';
import { ReversionComponent } from './components/devoluciones/reversion/reversion.component';
import { ReporteNotaCreditoComponent } from './components/reporte-nota-credito/reporte-nota-credito.component';
// tslint:disable-next-line:max-line-length
import {
  RequestPreliminaryMonitoreoComponent
} from './components/consultations/request-preliminary-monitoreo/request-preliminary-monitoreo.component';
import { AsesoriaBrokerComponent } from './components/reports/asesoria-broker/asesoria-broker.component';
import {
  RequestAsesoriaBrokerComponent
} from './components/consultations/request-asesoria-broker/request-asesoria-broker.component';
import { ReporteCtasXcobrarComponent } from './components/reports/reporte-ctas-xcobrar/reporte-ctas-xcobrar.component';
// tslint:disable-next-line:max-line-length
import {
  RequestReporteCtasXCobrarComponent
} from './components/consultations/request-reporte-ctas-xcobrar/request-reporte-ctas-xcobrar.component';
// tslint:disable-next-line:max-line-length
import {
  RequestPreliminaryMonitoreoPayComponent
} from './components/consultations/request-preliminary-monitoreo-pay/request-preliminary-monitoreo-pay.component';
import {
  PreliminaryReportPayComponent
} from './components/reports/preliminary-report-pay/preliminary-report-pay.component';
import { ReporteCierreComponent } from './components/reports/reporte-cierre/reporte-cierre.component';
import {
  RequestReporteCierreComponent
} from './components/consultations/request-reporte-cierre/request-reporte-cierre.component';
import { NotasCreditoComponent } from './components/reports/notas-credito/notas-credito.component';
import {
  RequestNotasCreditoComponent
} from './components/consultations/request-notas-credito/request-notas-credito.component';
import { CreditNoteComponent } from './components/creditNote/creditNote.component';
import { WelcomeComponent } from '@shared/components/soat/generic/welcome/welcome.component';
import { ReporteSoatComponent } from './components/reports/reporte-soat/reporte-soat.component';
import {
  RequestProvicomisionesComponent
} from './components/consultations/request-provicomisiones/request-provicomisiones.component';
import {
  RequestReporteSoatComponent
} from './components/consultations/request-reporte-soat/request-reporte-soat.component';
import { TrayTransactComponent } from './components/transact/tray-transact/tray-transact.component';
import { TransactAccessComponent } from './components/transact/transact-access/transact-access.component';
import {
  TransactAccessDesgravamenComponent
} from './components/transact/transact-access-desgravamen/transact-access-desgravamen.component';  //R.P.
import { TransactEvaluationComponent } from './components/transact/transact-evaluation/transact-evaluation.component';
import {
  TransactEvaluationDesgravamenComponent
} from './components/transact/transact-evaluation-desgravamen/transact-evaluation-desgravamen.component'; //R.P.
import { ReportIndicatorsComponent } from './components/reports/report-indicators/report-indicators.component';
import { RebillComponent } from './components/rebill/rebill.component';
import { ReporteRefacturacion } from './components/rebillReport/rebillReport.component';
import { ValidationLotComponent } from './components/validation-lot/validation-lot.component';
import { ValidateLotGuard } from './guards/validate-lot.guard';

import { GeneracionQrComponent } from './components/generacion-qr/generacion-qr.component';
import { GeneracionQrAddComponent } from './components/generacion-qr-add/generacion-qr-add.component';
import { AtpReportComponent } from './components/atp-reports/atp-report/atp-report.component';
import { ReassingTransactComponent } from './components/transact/reassing-transact/reassing-transact.component';
import { AtpClaimReportComponent } from './components/atp-reports/atp-claim-report/atp-claim-report.component';
import { VdpPersistReportComponent } from './components/atp-reports/vdp-persist-report/vdp-persist-report.component';
import { RestrictGuard } from '@shared/guards/restrict.guard';
import { CommissionCoComponent } from './components/commission-channel/commission-channel.component';
import { CommissionReportComponent } from './components/commission-report/commission-report.component';

import { VdpTecnicReportComponent } from './components/atp-reports/vdp-tecnic-report/vdp-tecnic-report.component';
import { VdpControlReportComponent } from './components/atp-reports/vdp-control-report/vdp-control-report.component';
import {
  VdpControlDetailReportComponent
} from './components/atp-reports/vdp-control-detail-report/vdp-control-detail-report.component';
import {
  VdpAnualResumeReportComponent
} from './components/atp-reports/vdp-anual-resume-report/vdp-anual-resume-report.component';
import {
  VdpMonthResumeReportComponent
} from './components/atp-reports/vdp-month-resume-report/vdp-month-resume-report.component';
import {
  VdpDailyResumeReportComponent
} from './components/atp-reports/vdp-daily-resume-report/vdp-daily-resume-report.component';
// tslint:disable-next-line:max-line-length
import {
  VdpReserveRegistryReportComponent
} from './components/atp-reports/vdp-Reserve-Registry-Report/vdp-Reserve-Registry-Report.component';
import {
  VdpComisionReportComponent
} from './components/atp-reports/vdp-provision-comision-report/vdp-provision-comision-report.component';
import {
  VdpRenovationReportComponent
} from './components/atp-reports/vdp-renovacion-report/vdp-renovacion-report.component';
import {
  VdpContaComisionReportComponent
} from './components/atp-reports/vdp-ContaComision-report/vdp-ContaComision-report.component';
import {
  VdpFacturationReportComponent
} from './components/atp-reports/vdp-Facturation-report/vdp-Facturation-report.component';
import {
  VdpConveniosReportComponent
} from './components/atp-reports/vdp-Convenios-report/vdp-Convenios-report.component';
import { VcfPolicyReportComponent } from './components/atp-reports/vcf-Policys-Reports/vdf-policy-report.component';
import { ConfigCommissionComponent } from './components/atp-reports/config-commission/config-commission.component';

// *PORTAL DE TRAMITES
import { BandejaTramitesComponent } from './components/portal-tramites/bandeja-tramites/bandeja-tramites.component';
import { NuevoTramiteComponent } from './components/portal-tramites/nuevo-tramite/nuevo-tramite.component';
import { SeleccionPolizaComponent } from './components/portal-tramites/seleccion-poliza/seleccion-poliza.component';

// *VIDA DEVOLUCION PROTECTA +
import { NuevoClienteComponent } from './components/vida-devolucion/nuevo-cliente/nuevo-cliente.component';
import { QuoteTrayComponent } from './components/vida-devolucion/quote-tray/quote-tray.component';
import { QuoteAsignComponent } from './components/vida-devolucion/quote-asign/quote-asign.component';
import { ViewQuotationComponent } from './components/vida-devolucion/view-quotation/view-quotation.component';
import { SalesHistoryComponent } from './components/vida-devolucion/sales-history/sales-history.component';
// *CARGA MASIVA
import {
  MassiveChargeTrayComponent
} from './components/vida-devolucion/massive-charge/massive-charge-tray/massive-charge-tray.component';
// tslint:disable-next-line:max-line-length
import {
  MassiveChargeDetailComponent
} from './components/vida-devolucion/massive-charge/massive-charge-detail/massive-charge-detail.component';

import { SoatSummaryGuard } from './guards/soat-summary.guard';
import { VdpAuthGuard } from './guards/vdp-auth.guard';

// reporte tecnico, operacion, facturacion, convenios,comisiones y cuentasxcobrar de desgravamen con devolucion
import { DescdTecnicReportComponent } from './components/atp-reports/descd-tecnic-report/descd-tecnic-report.component';
import { DescdOperacReportComponent } from './components/atp-reports/descd-operac-report/descd-operac-report.component';
import {
  DescdFacturacionReportComponent
} from './components/atp-reports/descd-facturacion-report/descd-facturacion-report.component';
import {
  DescdConveniosReportComponent
} from './components/atp-reports/descd-convenios-report/descd-convenios-report.component';
import {
  DescdComisionesReportComponent
} from './components/atp-reports/descd-comisiones-report/descd-comisiones-report.component';
import { ProviComisionesReportComponent } from './components/provi-comisiones-report/provi-comisiones-report.component';
import {
  ReporteComisionesAutomaticasComponent
} from './components/reports/reporte-comisiones-automaticas/reporte-comisiones-automaticas.component';
import {
  DescdCuentasxcobrarReportComponent
} from './components/atp-reports/descd-cuentasxcobrar-report/descd-cuentasxcobrar-report.component';


import { PhotocheckComponent } from './components/photocheck/photocheck.component';
import { ReporteLoteCobranzasComponent } from './components/reporte-lote-cobranzas/reporte-lote-cobranzas.component';

import { LoginEpsComponent } from './components/login-eps/login-eps.component';

import { ReporteSucaveComponent } from './components/reports/reporte-sucave/reporte-sucave.component';
import {
  RequestReporteSucaveComponent
} from './components/consultations/request-reporte-sucave/request-reporte-sucave/request-reporte-sucave.component';
import {
  SucaveErrorComponent
} from './components/consultations/request-reporte-sucave/request-reporte-sucave-error/request-reporte-sucave-error.component';

// interfaz en linea
import { InterfaceRentasComponent } from './components/interface-rentas/interface-rentas.component';
import { InterfaceBankpaymentObsComponent } from './components/interface-bankpayment-obs/interface-bankpayment-obs.component';
import { InterfaceBankPaymentComponent } from './components/interface-bankpayment/interface-bankpayment.component';
import { InterfaceMonitoringComponent } from './components/interface-monitoring/interface-monitoring.component';
import { ClosingDateConfigComponent } from './components/closing-date-config/closing-date-config.component';
import {
  ModuleReportsOperacionesComponent
} from './components/module-reports-operaciones/module-reports-operaciones.component';
import { InterfaceDependenceComponent } from './components/interface-dependence/interface-dependence.component';
import { PriorityConfigurationComponent } from './components/priority-configuration/priority-configuration.component';
import {
  AccountingEntriesConfigComponent
} from './components/accounting-entries-config/accounting-entries-config.component';
import { ModuleCostCenterComponent } from './components/module-cost-center/module-cost-center.component';

import { InterfazComponent } from './components/interfaz/interfaz.component';
import { ScheduleMaintenanceComponent } from './components/schedule-maintenance/schedule-maintenance.component';
import { ModuleReportsBancarioComponent } from './components/module-reports-bancario/module-reports-bancario.component';
import {
  ConsultaControlBancarioComponent
} from './components/consulta-control-bancario/consulta-control-bancario.component';

import {
  VdpProvisionComisionReportGenerateComponent
} from './components/atp-reports/vdp-provision-comision-report-generate/vdp-provision-comision-report-generate.component';
import {
  VdpProvisionComisionConsultationComponent
} from './components/atp-reports/vdp-provision-comision-consultation/vdp-provision-comision-consultation.component';
import {
  VdpProvisionComisionEvaluacionConsultaComponent
} from './components/atp-reports/vdp-provision-comision-evaluacion-consulta/vdp-provision-comision-evaluacion-consulta.component';
import {
  VdpProvisionComisionAutorizarConsultaComponent
} from './components/atp-reports/vdp-provision-comision-autorizar-consulta/vdp-provision-comision-autorizar-consulta.component';
import {
  VdpProcesoGeneracionPlanillaPagosComponent
} from './components/atp-reports/vdp-proceso-generacion-planilla-pagos/vdp-proceso-generacion-planilla-pagos.component';
import {
  VdpReporteAsesoresVentasVigentesComponent
} from './components/atp-reports/vdp-reporte-asesores-ventas-vigentes/vdp-reporte-asesores-ventas-vigentes.component';
import {
  VdpReportVentasComisionesAsesorComponent
} from './components/atp-reports/vdp-report-ventas-comisiones-asesor/vdp-report-ventas-comisiones-asesor.component';
import {
  VdpReportVentasComisionesSupervisorComponent
} from './components/atp-reports/vdp-report-ventas-comisiones-supervisor/vdp-report-ventas-comisiones-supervisor.component';
import {
  VdpReportVentasComisionesJefeComponent
} from './components/atp-reports/vdp-report-ventas-comisiones-jefe/vdp-report-ventas-comisiones-jefe.component';
import {
  VdpReportVentasComisionesSoporteComponent
} from './components/atp-reports/vdp-report-ventas-comisiones-soporte/vdp-report-ventas-comisiones-soporte.component';


// reporte recibo
import {
  RequestReporteReciboComponent
} from './components/consultations/request-reporte-recibo/request-reporte-recibo.component';
import { ReporteReciboComponent } from './components/reports/reporte-recibo/reporte-recibo.component';
import {
  ReporteTramasHistoricasComponent
} from './components/reports/reporte-tramas-historicas/reporte-tramas-historicas.component';

import {
  ReporteInconsistenciasSanitasComponent
} from './components/reports/reporte-inconsistencias-sanitas/reporte-inconsistencias-sanitas.component';
import {
  BandejaSolicitudesComponent
} from './components/bandeja-solicitudes/bandeja-solicitudes.component';


import {
  MantenimientoComiDifComponent
} from './components/maintenance/mantenimiento-comi-dif/mantenimiento-comi-dif.component';
import {
  MantenimientoPlanAsistComponent
} from './components/maintenance/mantenimiento-planes-asistencias/mantenimiento-planes-asistencias.component';
import { SettingsRmvComponent } from './components/maintenance/settings-rmv/settings-rmv.component';
//INI MMQ 11-12-2023
//INMOBILIARIA
import { InmobiliaryLoadMassiveComponent } from './components/inmobiliary/inmobiliary-load-massive/inmobiliary-load-massive.component';
import { InmobiliaryMonitoringComponent } from './components/inmobiliary/inmobiliary-monitoring/inmobiliary-monitoring.component';
import { InmobiliaryMonitoringViewComponent } from './components/inmobiliary/inmobiliary-monitoring-view/inmobiliary-monitoring-view.component';
import { InmobiliaryMonitoringErrorComponent } from './components/inmobiliary/inmobiliary-monitoring-error/inmobiliary-monitoring-error.component';
import { InmobiliaryControlCierreComponent } from './components/inmobiliary/inmobiliary-control-cierre/inmobiliary-control-cierre.component';
import { InmobiliaryReportCierreComponent } from './components/inmobiliary/inmobiliary-report-cierre/inmobiliary-report-cierre.component';
import { InmobiliaryMaintenanceClientComponent } from './components/inmobiliary/inmobiliary-maintenance-client/inmobiliary-maintenance-client.component'; //GCAA 06022024
import { InmobiliaryInterfaceMonitoringComponent } from './components/inmobiliary/inmobiliary-interface-monitoring/inmobiliary-interface-monitoring.component';
import { InmobiliaryModuleReportsOperacionesComponent } from './components/inmobiliary/inmobiliary-module-reports-operaciones/inmobiliary-module-reports-operaciones.component';
import { InmobiliaryConsultaControlBancarioComponent } from './components/inmobiliary/inmobiliary-consulta-control-bancario/inmobiliary-consulta-control-bancario.component';
import { InmobiliaryClosingDateConfigComponent } from './components/inmobiliary/inmobiliary-closing-date-config/inmobiliary-closing-date-config.component';
//FIN MMQ 11-12-2023

import { PolicyLinkComponent } from './components/policy/policy-link/policy-link.component';
import { DevolucionesOdinariasRentasDetalleComponent } from './components/devoluciones/devoluciones-odinarias-rentas-detalle/devoluciones-odinarias-rentas-detalle.component';
import { DevolucionesOdinariasRentasComponent } from './components/devoluciones/devoluciones-odinarias-rentas/devoluciones-odinarias-rentas.component';
//Rentas


const broutes: Routes = [
  { path: 'login-remote', component: LoginRemoteComponent },
  { path: 'login-eps/:partner', component: LoginEpsComponent },
  {
    path: '',
    component: BrokerComponent,
    children: [
      { path: 'welcome', component: WelcomeComponent },
      { path: 'login', component: LoginComponent },
      { path: 'salepanel', component: SalePanelComponent },
      { path: 'step01', component: Step01Component },
      { path: 'step02', component: Step02Component },
      { path: 'step03', component: Step03Component },
      { path: 'step04', component: Step04Component },
      {
        path: 'step05',
        component: Step05Component,
        canActivate: [SoatSummaryGuard],
      },
      { path: 'stepAll', component: BrokerEmissionComponent },
      { path: 'resultado/:key', component: ResultadoComponent },
      { path: 'rescupon', component: ResPagoEfectivoComponent },
      { path: 'resvaucher', component: ResVaucherComponent },
      { path: 'historial', component: HistorialComponent },
      { path: 'payroll', component: PayrollComponent },
      {
        path: 'payrolladd/:accion/:id/:nidstate',
        component: PayrollAddComponent,
      },
      { path: 'payrollvisa/:key', component: PayrollResultadoVisaComponent },
      { path: 'prepayroll', component: PrePayrollListComponent },
      {
        path: 'prepayrolladd/:accion/:id/:nidstate',
        component: PrePayrollAddComponent,
      },
      {
        path: 'prepayrollvisa/:key',
        component: PrePayrollResultadoVisaComponent,
      },
      { path: 'campaign', component: CampaignListComponent },
      {
        path: 'campaignadd/:accion/:id/:nidstate',
        component: CampaignAddComponent,
      },
      { path: 'commissionlot', component: CommissLotComponent },
      {
        path: 'commission',
        component: CommissionComponent,
        canActivate: [RestrictGuard],
      },
      {
        path: 'commission-auth',
        component: CommissionAuthComponent,
        canActivate: [RestrictGuard],
      },
      {
        path: 'commissionlot-add/:accion/:id/:nidstate/:nibranch',
        component: CommissionLotAddComponent,
        canActivate: [AuthGuardL],
      },
      {
        path: 'reporte-cobranzas',
        component: ReporteLoteCobranzasComponent,
        canActivate: [ValidateLotGuard],
      },
      { path: 'rptventascf', component: ReportsalescfComponent },
      { path: 'rptventascv', component: ReportsalescvComponent },
      { path: 'rptventaspro', component: ReportsalesproComponent },
      { path: 'rptcomisspro', component: ReportcomissproComponent },
      { path: 'rptcomisscv', component: ReportcomisscvComponent },
      { path: 'rptventascertif', component: ReportsalescertificateComponent },
      { path: 'retrieve', component: RetrievePasswordComponent },
      { path: 'retrieve-send', component: RetrieveSendComponent },
      { path: 'renew-password', component: RenewPasswordComponent },
      { path: 'rebill', component: RebillComponent },
      { path: 'reportRebill', component: ReporteRefacturacion },
      {
        path: 'validacion-lotes',
        component: ValidationLotComponent,
        canActivate: [ValidateLotGuard],
      },
      // KUNTUR 20190812
      { path: 'quotation', component: QuotationComponent },
      {
        path: 'sctr',
        loadChildren: () =>
          import(
            './components/quote/pd-sctr/pd-sctr.module'
            ).then((m) => m.PdSctrModule),
      },
      {
        path: 'accidentes-personales',
        loadChildren: () =>
          import(
            './components/quote/acc-personales/acc-personales.module'
            ).then((m) => m.AccPersonalesModule),
      },
      {
        path: 'desgravamen-devolucion',
        loadChildren: () =>
          import(
            './components/quote/desgravamen-devolucion/desgravamen-devolucion.module'
            ).then((m) => m.DesgravamenDevolucionModule),
      },
      {
        path: 'vida-grupo',
        loadChildren: () =>
          import(
            './components/quote/acc-personales/acc-personales.module'
            ).then((m) => m.AccPersonalesModule),
      },
      {
        path: 'desgravamen',
        loadChildren: () =>
          import('../desgravamen/desgravamen.module').then(
            (m) => m.DesgravamenModule
          ),
      },

      {
        path: 'vida-inversion',
        loadChildren: () =>
            import('../vida-inversion/vida-inversion.module').then(
                (m) => m.VidaInversionModule
            ),
      },
      { path: 'request-status', component: RequestStatusComponent },
      { path: 'transaction-report', component: TransactionReportComponent },
      { path: 'insured-report', component: InsuredReportComponent },
      { path: 'state-report', component: StateReportComponent },
      { path: 'panel', component: PanelComponent },
      { path: 'panel-vidaley/:key', component: PanelComponent },
      { path: 'panel-sctr/:key', component: PanelComponent },
      {
        path: 'certificado-electronico',
        component: CertificadoElectronicoComponent,
      },
      { path: 'home', component: HomeComponent },
      {
        path: 'contractor-location',
        component: ContractorLocationIndexComponent,
      },
      { path: 'policy/emit', component: PolicyFormComponent }, // modo: emitir
      {
        path: 'policy/transaction/:mode',
        component: PolicyTransactionsComponent,
      }, // modo: emitir, incluir, renovar
      { path: 'policy-transactions', component: PolicyIndexComponent },
      {
        path: 'policy-movement-proof',
        component: PolicyMovementProofComponent,
      },
      { path: 'add-contracting', component: AddContractingComponent },
      { path: 'agency', component: AgencyIndexComponent },
      { path: 'agency-form', component: AgencyFormComponent },
      { path: 'quotation-evaluation', component: QuotationEvaluationComponent },
      { path: 'products', component: ProductComponent },
      { path: 'contractor-state', component: ContractorStateComponent },
      { path: 'process-viewer', component: ProcessViewerComponent },
      { path: 'policy-evaluation', component: PolicyEvaluationComponent },
      { path: 'policy-request', component: PolicyRequestComponent },
      { path: 'policy/resultado/:key', component: PolicyResultComponent },
      { path: 'policy/pago-efectivo', component: PolicyCipComponent },
            { path: 'policy/pago-kushki', component: PolicyLinkComponent },
      { path: 'process-error', component: MonitoringErrorComponent },
      { path: 'monitoring', component: MonitoringComponent },
      { path: 'sales-report-client', component: SaleClientReportComponent },
      { path: 'sales-report-channel', component: SaleChannelReportComponent },
      {
        path: 'sales-report-enterprise',
        component: SaleEnterpriseReportComponent,
      },
      {
        path: 'commission-report-enterprise',
        component: CommissionEnterpriseReportComponent,
      },
      {
        path: 'commission-report-channel',
        component: CommissionChannelReportComponent,
      },
      { path: 'payrollkuntur', component: PayrollKunturComponent },
      { path: 'bill-report-receipt', component: BillReportReceiptComponent },
      {
        path: 'payrollkunturadd/:accion/:id/:nidstate',
        component: PayrollAddComponent,
      },
      { path: 'cover', component: CoverIndexComponent },
      { path: 'module', component: ModuleIndexComponent },
      { path: 'add-cover', component: AddCoverComponent },
      { path: 'add-module', component: AddModuleComponent },
      {
        path: 'policy-transactions-all',
        component: PolicyTransactionsAllComponent,
      },
      { path: 'plot', component: PlotComponent },
      {
        path: 'cover-specific-information',
        component: CoverSpecificInformationComponent,
      },
      { path: 'cover-rate', component: CoverRateComponent },
      { path: 'cover-rate-detail', component: CoverRateDetailComponent },
      {
        path: 'policy-movement-cancel',
        component: PolicyMovementCancelComponent,
      },
      { path: 'process-demand-index', component: ProcessDemandIndexComponent },
      { path: 'Commission', component: CommissionKunturComponent },
      { path: 'Commission-edit', component: CommissionModalComponent },
      { path: 'bandeja', component: BandejaComponent },
      { path: 'premiumReport', component: PremiumReportComponent }, // Reporte de Primas
      {
        path: 'premiumReportTracking',
        component: PremiumReportTrackingComponent,
      }, // Monitoreo de Report
      {
        path: 'request-proforma-policy',
        component: RequestProformaPolicyComponent,
      }, // Consulta de proformas
      { path: 'interface-crossing', component: InterfaceCrossingComponent }, // Cruce de Interfaces
      { path: 'currently-insured', component: CurrentlyInsuredComponent }, // Consulta de asegurados vigentes
      { path: 'credit-politica', component: CreditPoliticaComponent },
      {
        path: 'status-payment-client',
        component: PaymentClientStatusComponent,
      },
      { path: 'quotation-covid', component: QuotationCovidComponent },
      { path: 'request-covid', component: RequestCovidComponent },
      { path: 'covid-evaluation', component: CovidEvaluationComponent },
      { path: 'policy-covid', component: PolicyCovidComponent },
      { path: 'login-profile', component: LoginProfileComponent },
      { path: 'minimum-premium', component: MinimumPremiumComponent },
      { path: 'parameter-settings', component: ParameterSettingsComponent },
      { path: 'settings-rmv', component: SettingsRmvComponent },
      { path: 'logs-usuarios', component: LogsUsuariosComponent },
      { path: 'plataforma-panel', component: PlataformaPanelComponent },
      { path: 'comprobantes', component: ComprobantesComponent },
      { path: 'bandeja-aprobacion', component: AuthorizationComponent },
      { path: 'quotation-report', component: QuotationReportComponent },
      { path: 'preliminary-report', component: PreliminaryReportComponent },
      {
        path: 'request-preliminary-monitoreo',
        component: RequestPreliminaryMonitoreoComponent,
      },
      { path: 'asesoria-broker', component: AsesoriaBrokerComponent },
      {
        path: 'request-asesoria-broker',
        component: RequestAsesoriaBrokerComponent,
      },
      { path: 'reporte-ctas-xcobrar', component: ReporteCtasXcobrarComponent },
      {
        path: 'request-reporte-ctas-xcobrar',
        component: RequestReporteCtasXCobrarComponent,
      },
      {
        path: 'reporte-preliminary-report-pay',
        component: PreliminaryReportPayComponent,
      },
      {
        path: 'request-preliminary-monitoreo-pay',
        component: RequestPreliminaryMonitoreoPayComponent,
      },
      {
        path: 'request-reporte-cierre',
        component: RequestReporteCierreComponent,
      },
      { path: 'reporte-cierre', component: ReporteCierreComponent },
      { path: 'notas-credito', component: NotasCreditoComponent },
      {
        path: 'request-notas-credito',
        component: RequestNotasCreditoComponent,
      },
      { path: 'creditNote', component: CreditNoteComponent },
      { path: 'reporte-soat', component: ReporteSoatComponent },
      { path: 'request-reporte-soat', component: RequestReporteSoatComponent },
      { path: 'request-provi-comisiones', component: RequestProvicomisionesComponent },
      {
        path: 'request-asesoria-broker',
        component: RequestAsesoriaBrokerComponent,
      },
      { path: 'tray-transact/:typeSearch', component: TrayTransactComponent },
      { path: 'transact-access/:token', component: TransactAccessComponent },
      { path: 'transact-access-desgravamen/:token', component: TransactAccessDesgravamenComponent }, // R.P.
      { path: 'transact-evaluation', component: TransactEvaluationComponent },
      { path: 'transact-evaluation-desgravamen', component: TransactEvaluationDesgravamenComponent },     // R.P.
      { path: 'report-indicators', component: ReportIndicatorsComponent },
      {
        path: 'generacion-qr',
        component: GeneracionQrComponent,
        canActivate: [RestrictGuard],
      },
      {
        path: 'generacion-qr-add',
        component: GeneracionQrAddComponent,
        canActivate: [RestrictGuard],
      },
      { path: 'reporte-vdp', component: AtpReportComponent }, // Reporte de VDP+
      { path: 'reporte-tecnic', component: VdpTecnicReportComponent }, // Reporte tecnico de VDP+
      { path: 'control-vdp-report', component: VdpControlReportComponent }, // Reporte control VDP
      { path: 'config-commission', component: ConfigCommissionComponent }, // Configuracion de Comisiones VDP+
      {
        path: 'control-detail-vdp-report',
        component: VdpControlDetailReportComponent,
      }, // Reporte detalle control VDP
      {
        path: 'anual-resume-vdp-report',
        component: VdpAnualResumeReportComponent,
      }, // Reporte resume anual VDP
      {
        path: 'month-resume-vdp-report',
        component: VdpMonthResumeReportComponent,
      }, // Reporte resume mes VDP
      {
        path: 'daily-resume-vdp-report',
        component: VdpDailyResumeReportComponent,
      }, // Reporte resume dia VDP
      {
        path: 'Reserve-Registry-Report',
        component: VdpReserveRegistryReportComponent,
      }, // Reporte de Reserva y Reaseguros VDP+
      {
        path: 'reporte-comision-vdp',
        component: VdpComisionReportComponent,
      }, // Reporte de Provisión de Comisiones VDP+
      {
        path: 'reporte-renovacion-vdp',
        component: VdpRenovationReportComponent,
      }, // Reporte de Renovación VDP+
      {
        path: 'reporte-contacomision-vdp',
        component: VdpContaComisionReportComponent,
      }, // Reporte de Contabilidad Comision VDP+
      { path: 'reporte-facturation-vdp', component: VdpFacturationReportComponent }, // Reporte de Facturación VDP+
      { path: 'reporte-convenio-vdp', component: VdpConveniosReportComponent }, // Reporte de Convenio VDP+
      { path: 'reporte-poliza-vcf', component: VcfPolicyReportComponent }, // Reporte de Convenio VDP+

      { path: 'reporte-Comision-Generate-vdp', component: VdpProvisionComisionReportGenerateComponent },
      { path: 'reporte-Comision-Consultation-vdp', component: VdpProvisionComisionConsultationComponent },
      { path: 'reporte-Comision-Evaluacion-vdp', component: VdpProvisionComisionEvaluacionConsultaComponent },
      { path: 'reporte-Comision-Autorizar-vdp', component: VdpProvisionComisionAutorizarConsultaComponent },
      { path: 'reporte-Planilla-Pagos-vdp', component: VdpProcesoGeneracionPlanillaPagosComponent },
      { path: 'reporte-Asesores-Ventas-vdp', component: VdpReporteAsesoresVentasVigentesComponent },
      { path: 'reporte-ventas-comisiones-vdp-asesor', component: VdpReportVentasComisionesAsesorComponent },
      { path: 'reporte-ventas-comisiones-vdp-supervisor', component: VdpReportVentasComisionesSupervisorComponent },
      { path: 'reporte-ventas-comisiones-vdp-jefe', component: VdpReportVentasComisionesJefeComponent },
      { path: 'reporte-ventas-comisiones-vdp-soporte', component: VdpReportVentasComisionesSoporteComponent },

      { path: 'reassing-transact', component: ReassingTransactComponent },
      {
        path: 'vidadevolucion/prospectos',
        component: QuoteTrayComponent,
        data: {
          path: '',
          roles: [191, 192, 194, 195],
        },
        canActivate: [VdpAuthGuard],
      },
      {
        path: 'vidadevolucion/carga-masiva',
        component: MassiveChargeTrayComponent,
      },
      {
        path: 'vidadevolucion/carga-masiva/detalle/:id',
        component: MassiveChargeDetailComponent,
      },

      {
        path: 'vidadevolucion/carga-masiva/detalle',
        component: MassiveChargeDetailComponent,
      },
      {
        path: 'vidadevolucion/prospectos/sin-asignar',
        component: QuoteTrayComponent,
        data: {
          path: '/sin-asignar',
          roles: [192],
          type: 'sin-asignar',
        },
        canActivate: [VdpAuthGuard],
      },
      {
        path: 'vidadevolucion/prospectos/aprobaciones-pendientes',
        component: QuoteTrayComponent,
        data: {
          path: '/aprobaciones-pendientes',
          roles: [192, 197],
        },
        canActivate: [VdpAuthGuard],
      },
      {
        path: 'vidadevolucion/prospectos/aprobaciones-pendientes-riesgo',
        component: QuoteTrayComponent,
        data: {
          path: '/aprobaciones-pendientes-riesgo',
          roles: [193],
        },
        canActivate: [VdpAuthGuard],
      },
      {
        path: 'vidadevolucion/prospectos/aprobaciones-pendientes-bajar-score',
        component: QuoteTrayComponent,
        data: {
          path: '/aprobaciones-pendientes-bajar-score',
          roles: [196],
        },
        canActivate: [VdpAuthGuard],
      },
      {
        path: 'vidadevolucion/cliente/nuevo',
        component: NuevoClienteComponent,
        data: {
          roles: [191, 192, 194, 195],
        },
        canActivate: [VdpAuthGuard],
      },
      {
        path: 'vidadevolucion/resumen',
        component: ViewQuotationComponent,
        data: {
          roles: [191, 192, 193, 194, 195, 196, 197],
        },
        canActivate: [VdpAuthGuard],
      },
      {
        path: 'vidadevolucion/historial',
        component: SalesHistoryComponent,
        data: {
          roles: [191, 192, 193, 194, 195, 196, 197],
        },
        canActivate: [VdpAuthGuard],
      },
      // *PORTAL DE TRAMITES
      { path: 'portal-tramites', component: BandejaTramitesComponent },
      { path: 'portal-tramites/poliza', component: SeleccionPolizaComponent },
      { path: 'portal-tramites/nuevo', component: NuevoTramiteComponent },
      { path: 'reporte-claim-vdp', component: AtpClaimReportComponent },
      { path: 'reporte-persist-vdp', component: VdpPersistReportComponent },
      {
        path: 'commission-channel',
        component: CommissionCoComponent,
        canActivate: [AuthGuardC],
      },
      {
        path: 'commission-report',
        component: CommissionReportComponent,
      },
      { path: 'reporte-claim-vdp', component: AtpClaimReportComponent },
      { path: 'reporte-persist-vdp', component: VdpPersistReportComponent },
      { path: 'reporte-tecnico', component: DescdTecnicReportComponent }, // Reporte Tecnico de Desgravamen con Devolución
      { path: 'reporte-operacion', component: DescdOperacReportComponent }, // Reporte Operaciones de Desgravamen con Devolución
      { path: 'reporte-facturacion', component: DescdFacturacionReportComponent }, // Reporte Facturacion de Desgravamen con Devolución
      { path: 'reporte-convenios', component: DescdConveniosReportComponent }, // Reporte Convenios de Desgravamen con Devolución
      { path: 'reporte-comisiones', component: DescdComisionesReportComponent }, // Reporte Comisiones de Desgravamen con Devolución
      { path: 'provi-comisiones-report', component: ProviComisionesReportComponent }, // Reporte Provision de comisiones
      { path: 'reporte-comisiones-automaticas', component: ReporteComisionesAutomaticasComponent }, // Reporte Comisiones automaticas
      // tslint:disable-next-line:max-line-length
      { path: 'reporte-cuentasxcobrar', component: DescdCuentasxcobrarReportComponent }, // Reporte CuentasxCobrar de Desgravamen con Devolución
      {
        path: 'photocheck',
        component: PhotocheckComponent,
      },


      { path: 'reporte-sucave', component: ReporteSucaveComponent },
      { path: 'request-reporte-sucave', component: RequestReporteSucaveComponent },
      { path: 'request-reporte-sucave-error', component: SucaveErrorComponent },

      // interfaz en linea
            { path: 'inmobiliary-rentas', component: InterfaceRentasComponent },
            { path: 'interface-bankpayment-obs', component: InterfaceBankpaymentObsComponent },
      { path: 'interface-bankpayment', component: InterfaceBankPaymentComponent },
      { path: 'interface-monitoring', component: InterfaceMonitoringComponent }, // Todos los procesos
      { path: 'interface-monitoring/:id', component: InterfaceMonitoringComponent }, // Proceso filtrado por ID
      { path: 'closing-date-config', component: ClosingDateConfigComponent },
      { path: 'module-reports-operativo-contable', component: ModuleReportsOperacionesComponent },
      { path: 'interface-dependence', component: InterfaceDependenceComponent },
      { path: 'priority-configuration', component: PriorityConfigurationComponent },
      { path: 'module-account-entries', component: AccountingEntriesConfigComponent },
      { path: 'module-cost-center', component: ModuleCostCenterComponent },

      { path: 'interfaz', component: InterfazComponent },
      { path: 'schedule-maintenance', component: ScheduleMaintenanceComponent },
      { path: 'module-reports-transferencia-bancario', component: ModuleReportsBancarioComponent },
      { path: 'consulta-control-bancario', component: ConsultaControlBancarioComponent },


      // reporte recibo
      { path: 'request-reporte-recibo', component: RequestReporteReciboComponent },
      { path: 'reporte-recibo', component: ReporteReciboComponent },


      // devoluciones
      { path: 'devolucion', component: DevolucionComponent },
      { path: 'correo', component: CorreoComponent },
      { path: 'reversion', component: ReversionComponent },
      { path: 'reporte-nota-credito', component: ReporteNotaCreditoComponent },
      { path: 'reporte-tramas-historicas', component: ReporteTramasHistoricasComponent },

      // Reporte inconsistencias sanitas
      { path: 'reporte-inconsistencias-sanitas', component: ReporteInconsistenciasSanitasComponent },
            // rentas
            { path: 'devoluciones-odinarias-rentas', component: DevolucionesOdinariasRentasComponent },
            { path: 'devoluciones-odinarias-rentas-detalle/:SCODE', component: DevolucionesOdinariasRentasDetalleComponent },

      { path: 'mantenimiento-comisiones-diferenciadas', component: MantenimientoComiDifComponent },
      { path: 'mantenimiento-planes-asistencias', component: MantenimientoPlanAsistComponent },
      {
        path: 'gestion-creditos',
        loadChildren: () =>
          import('./components/gestion-creditos/gestion-creditos.module').then(
            (m) => m.GestionCreditosModule
          ),
      },
      {
        path: 'bandeja-solicitudes',
        component: BandejaSolicitudesComponent
      },

      // INI MMQ 11-12-2023
      //inmobiliaria
      { path: 'inmobiliary-load-massive', component: InmobiliaryLoadMassiveComponent },                                     // cargas masivas
      { path: 'inmobiliary-monitoring', component: InmobiliaryMonitoringComponent },                                        // monitoreo cargas masivas
      { path: 'inmobiliary-monitoring-view', component: InmobiliaryMonitoringViewComponent },                               // vista detalle monitoreo 
      { path: 'inmobiliary-monitoring-error', component: InmobiliaryMonitoringErrorComponent },                             // errores de cargas masivas
      	    { path: 'inmobiliary-control-cierre', component: InmobiliaryControlCierreComponent }, // control seguimiento
      	    { path: 'inmobiliary-report-cierre', component: InmobiliaryReportCierreComponent }, // reporte cierre
      	    { path: 'inmobiliary-maintenance', component: InmobiliaryMaintenanceClientComponent },
      { path: 'inmobiliary-interface-monitoring', component: InmobiliaryInterfaceMonitoringComponent },                     // monitoreo de interfaz
      { path: 'inmobiliary-interface-monitoring/:id', component: InmobiliaryInterfaceMonitoringComponent },                 // monitoreo de interfaz con id 
      { path: 'inmobiliary-module-reports-operativo-contable', component: InmobiliaryModuleReportsOperacionesComponent },   // reportes contable/operativo
      { path: 'inmobiliary-consulta-control-bancario', component: InmobiliaryConsultaControlBancarioComponent },            // monitoreo control bancario
      { path: 'inmobiliary-closing-date-config', component: InmobiliaryClosingDateConfigComponent },                        // Configuracion fechas cierre interfaz (periodos)
      // FIN MMQ 11-12-2023
      { path: '**', redirectTo: 'login' }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(broutes)],
  declarations: [],
  exports: [RouterModule],
  providers: [AuthGuardL, AuthGuardC],
})
export class BrokerRoutingModule {
}
