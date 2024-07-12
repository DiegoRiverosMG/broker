import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA,LOCALE_ID, NgModule } from '@angular/core';
import { DigitOnlyModule } from '@uiowa/digit-only';
import { SessionStorageService } from './../../shared/services/storage/storage-service';
import { BrokerEmissionComponent } from './components/emission/broker-emission.component';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// Modules
import { BrokerRoutingModule } from './broker-routing.module';
import { SharedComponentsModule } from '../../shared/modules/shared-components.module';
import { ModalModules } from '../../shared/components/modal/modal.module';
import { ConfirmModule } from '../../shared/components/confirm/confirm.module';
import { RecaptchaModule } from 'ng-recaptcha';
import { FormButtonModule } from '../desgravamen/shared/components/form-button/form-button.module';

// Components
import { BrokerComponent } from './broker.component';
import { LoginComponent } from './components/login/login.component';
import { NavMenuComponent } from './components/navmenu/navmenu.component';
import { HistorialComponent } from './components/historial/historial.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { FileUploadComponent } from './shared/fileupload/fileupload.component';
import { SalePanelComponent } from './components/salepanel/salepanel.component';
import { Step01Component } from './components/step01/step01.component';
import { Step02Component } from './components/step02/step02.component';
import { Step03Component } from './components/step03/step03.component';
import { Step04Component } from './components/step04/step04.component';
import { Step05Component } from './components/step05/step05.component';
import { ResultadoComponent } from './components/resultado/resultado.component';
import { ReportsalescfComponent } from './components/reports/reportsalescf/reportsalescf.component';
import { ReportsalescvComponent } from './components/reports/reportsalescv/reportsalescv.component';
import { ReportsalesproComponent } from './components/reports/reportsalespro/reportsalespro.component';
import { ReportcomisscvComponent } from './components/reports/reportcomisscv/reportcomisscv.component';
import { ReportcomissproComponent } from './components/reports/reportcomisspro/reportcomisspro.component';
import { ReportsalescertificateComponent } from './components/reports/reportcertif/reportcertif.component';
import { FlowtypeComponent } from '../../shared/components/common/flowtype/flowtype.component';
import { PayrollComponent } from './components/payroll/payroll.component';
import { PayrollAddComponent } from './components/payroll-add/payroll-add.component';
import { CommissLotComponent } from './components/commission-lot/commissionlot.component';
import { CommissionLotAddComponent } from './components/commission-lot-add/commissionlot-add.component';
import { StateComponent } from './components/state/state.component';
import { UbigeoComponent } from '../../shared/components/common/ubigeo/ubigeo.component';
import { StatesalesComponent } from '../../shared/components/common/statesales/statesales.component';
import { ChannelpointComponent } from '../../shared/components/common/channelpoint/channelpoint.component';
import { ChannelsalesComponent } from '../../shared/components/common/channelsales/channelsales.component';
import { UsoComponent } from '../../shared/components/common/uso/uso.component';
import { PaymenttypeComponent } from '../../shared/components/common/paymenttype/paymenttype.component';
import { SalesmodeComponent } from '../../shared/components/common/salesmode/salesmode.component';
import { BankComponent } from '../../shared/components/common/bank/bank.component';
import { CurrencytypeComponent } from '../../shared/components/common/currencytype/currencytype.component';
import { TitleStepComponent } from './components/title-step/title-step.component';
import { BackStepComponent } from './components/back-step/back-step.component';
import { ResVaucherComponent } from './components/res-vaucher/res-vaucher.component';
import { PayrollResultadoVisaComponent } from './components/payroll-resultado-visa/payroll-resultado-visa.component';
import { ResPagoEfectivoComponent } from './components/res-cupon/res-cupon.component';
import { RetrievePasswordComponent } from './components/retrieve-password/retrieve-password.component';
import { MigaPanComponent } from './components/retrieve-password/miga-pan/miga-pan.component';
import { RetrieveSendComponent } from './components/retrieve-send/retrieve-send.component';
import { RenewPasswordComponent } from './components/renew-password/renew-password.component';
import { OverlayComponent } from './components/overlay/overlay.component';
import { VisaResultComponent } from './components/visa-result/visa-result.component';
import { TerminosCondicionesComponent } from './components/terminos-condiciones/terminos-condiciones.component';
import { PrePayrollListComponent } from './components/prepayroll/prepayroll-list/prepayroll-list.component';
import { PrePayrollAddComponent } from './components/prepayroll/prepayroll-add/prepayroll-add.component';
import {
  PrePayrollResultadoVisaComponent
} from './components/prepayroll/prepayroll-resultado-visa/prepayroll-resultado-visa.component';

// Kuntur Components 20190812

import { AgencyFormComponent } from './components/maintenance/agency/agency-form/agency-form.component';
import { HomeComponent } from './components/home/home.component';
// tslint:disable-next-line:max-line-length
import {
  ContractorLocationIndexComponent
} from './components/maintenance/contractor-location/contractor-location-index/contractor-location-index.component';
// tslint:disable-next-line:max-line-length
import {
  ContractorLocationFormComponent
} from './components/maintenance/contractor-location/contractor-location-form/contractor-location-form.component';
// tslint:disable-next-line:max-line-length
import {
  ContractorLocationContactComponent
} from './components/maintenance/contractor-location/contractor-location-contact/contractor-location-contact.component';
import {
  ContractorViewComponent
} from './components/maintenance/contractor-location/contractor-view/contractor-view.component';
import { PolicyFormComponent } from './components/policy/policy-form/policy-form.component';
import { PanelComponent } from './components/panel/panel.component';
// import { NavmenusctrComponent } from './components/navmenusctr/navmenusctr.component';
import { NavmenusctrModule } from './components/navmenusctr/navmenusctr.module';
import { PolicyIndexComponent } from './components/policy/policy-index/policy-index.component';
import {
  PolicyMovementDetailsComponent
} from './components/policy/policy-movement-details/policy-movement-details.component';
import {
  PolicyMovementProofComponent
} from './components/policy/policy-movement-proof/policy-movement-proof.component';
import { AddContractingComponent } from './components/add-contracting/add-contracting.component';
import { AddTelephoneComponent } from './modal/add-telephone/add-telephone.component';
import { AddEmailComponent } from './modal/add-email/add-email.component';
import { AddAddressComponent } from './modal/add-address/add-address.component';
import { AddContactComponent } from './modal/add-contact/add-contact.component';
import { AgencyIndexComponent } from './components/maintenance/agency/agency-index/agency-index.component';
import {
  BrokerSearchBynameComponent
} from './components/maintenance/agency/broker-search-byname/broker-search-byname.component';
import { ProductComponent } from './components/product/product/product.component';
import { SearchContractingComponent } from './modal/search-contracting/search-contracting.component';
import { SearchBrokerComponent } from './modal/search-broker/search-broker.component';
import { ValErrorComponent } from './modal/val-error/val-error.component';
import { ProcessViewerComponent } from './components/policy/process-viewer/process-viewer.component';
import { AddCiiuComponent } from './modal/add-ciiu/add-ciiu.component';
import { QuotationTrackingComponent } from './components/quote/quotation-tracking/quotation-tracking.component';
import { QuotationEvaluationComponent } from './components/quote/quotation-evaluation/quotation-evaluation.component';
import {
  ContractorStateComponent
} from './components/reports/state-report/contractor-state/contractor-state.component';
// tslint:disable-next-line:max-line-length
import {
  CreditQualificationRecordComponent
} from './components/reports/state-report/credit-qualification-record/credit-qualification-record.component';
import { PolicyTransactionsComponent } from './components/policy/policy-transactions/policy-transactions.component';
import { FilePickerComponent } from './modal/file-picker/file-picker.component';
import { PolicyDocumentsComponent } from './components/policy/policy-documents/policy-documents.component';
import { QuotationComponent } from './components/quote/quotation/quotation.component';
import { RequestStatusComponent } from './components/quote/request-status/request-status.component';
import { TransactionReportComponent } from './components/reports/transaction-report/transaction-report.component';
import { InsuredReportComponent } from './components/reports/insured-report/insured-report.component';
import { StateReportComponent } from './components/reports/state-report/state-report.component';
import { AnulMovComponent } from './modal/anul-mov/anul-mov.component';
import { MethodsPaymentComponent } from './modal/methods-payment/methods-payment.component';
import { ngfModule } from 'angular-file';
import { NgSelectModule } from '@ng-select/ng-select';
import { TabsModule } from 'ngx-bootstrap/tabs';
// Kuntur Directives 20190812
import { OnlyNumberDirective } from './directives/only-number-directive';
import { OnlyTextNumberDirective } from './directives/only-text-number-directive';
import { OnlyTextSpaceDirective } from './directives/only-text-space-directive';
import { LegalNameDirective } from './directives/legal-name-directive';
import { FloatDirective } from './directives/float-directive';
import { FloatSixDecimalalService } from './directives/float-six-decimalal.service';
import { UppercaseDirective } from './directives/uppercase-directive';
import { DateDirective } from './directives/date-directive';
import { OnlyTextNumberJustDirective } from './directives/only-text-number-just-directive';
import { OnlyTextSpaceDotDirective } from './directives/only-text-space-dot-directive';
import { DecimalDirective } from './directives/decimal.directive';
/* import { VisaButtonDirective } from './../shared-app/directives/visa-button.directive'; */

// Kuntur Pipes 20190812
// import { TypeDocumentPipe } from './pipes/type-document.pipe';
import { NameContractorPipe } from './pipes/name-contractor.pipe';
import { MilesPipe } from './pipes/miles.pipe';
// import { FileNamePipe } from './pipes/file-name.pipe';
import { FilterPipe } from './pipes/filter.pipe';

// Services
import { AuthGuard } from './guards/auth.guard';
import { BrokerHttpInterceptor } from './guards/broker-http-interceptor';
import { AuthenticationService } from './services/authentication.service';
import { UserService } from './services/user.service';
import { HistorialService } from './services/historial/historial.service';
import { AppConfig } from '../../app.config';
import { GlobalEventsManager } from '../../shared/services/gobal-events-manager';
import { VehiculoService } from './services/vehiculo/vehiculo.service';
import { ApiService } from '../../shared/services/api.service';
import { ExcelService } from '../../shared/services/excel/excel.service';
import { ReportSalesPROService } from './services/reportsalespro/reportsalespro.service';
import { Step03Service } from './services/step03/step03.service';
import { Step04Service } from './services/step04/step04.service';
import { Step05Service } from './services/step05/step05.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ConfigService } from '../../shared/services/general/config.service';
import { UbigeoService } from '../../shared/services/ubigeo/ubigeo.service';
import { UsoService } from '../../shared/services/uso/uso.service';
import { SalesModeService } from '../../shared/services/salesmode/salesmode.service';
import { FileUploadService } from './services/fileupload/fileupload.service';
import { PaymentTypeService } from '../../shared/services/paymenttype/paymenttype.service';
import { StateSalesService } from '../../shared/services/statesales/statesales.service';
import { ChannelSalesService } from '../../shared/services/channelsales/channelsales.service';
import { ChannelPointService } from '../../shared/services/channelpoint/channelpoint.service';
import { ReportSalesCFService } from './services/reportsalescf/reportsalescf.service';
import { ReportSalesCVService } from './services/reportsalescv/reportsalescv.service';
import { ReportComissCVService } from './services/reportcomisscv/reportcomisscv.service';
import { ReportComissPROService } from './services/reportcomisspro/reportcomisspro.service';
import { ReportSalesCertificateService } from './services/reportsalescertificate/reportcertificate.service';
import { FlowTypeService } from '../../shared/services/flowtype/flowtype.service';
import { UtilityService } from '../../shared/services/general/utility.service';
import { ValidatorService } from '../../shared/services/general/validator.service';
import { PapelService } from './services/papel/papel.service';
import { PayrollService } from './services/payroll/payroll.service';
import { StateService } from './services/state/state.service';
import { ClienteService } from '../client/shared/services/cliente.service';
import { VisaService } from '../../shared/services/pago/visa.service';
import { EmisionService } from '../client/shared/services/emision.service';
import { BankService } from '../../shared/services/bank/bank.service';
import { CurrencyTypeService } from '../../shared/services/currencytype/currencytype.service';
import { AccountBankService } from '../../shared/services/accountbank/accountbank.service';
import { PagoEfectivoService } from '../../shared/services/pago/pago-efectivo.service';
import { ConfirmService } from '../../shared/components/confirm/confirm.service';
import { PasswordService } from './services/password/password.service';
import { PrepayrollService } from './services/prepayroll/prepayroll.service';
import { SidebarService } from '../../shared/services/sidebar/sidebar.service';
import { CommissionLotService } from './services/commisslot/comissionlot.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CampaignListComponent } from './components/campaign/campaign-list/campaign-list.component';
import { CampaignAddComponent } from './components/campaign/campaign-add/campaign-add.component';
import { CampaignService } from './services/campaign/campaign.service';
import { DeliveryService } from './services/delivery/delivery.service';
import { ContratanteComponent } from './components/contratante/contratante.component';
import { ChartsModule } from 'ng2-charts';
import { NgxPaginationModule } from 'ngx-pagination';
import { LoginRemoteComponent } from './components/login/login-remote.component';
import { CommissionComponent } from './components/commission/commission.component';
import { VisaNetButtonDirective } from './directives/button-visanet.component';
import {
  NoWhitespaceDirective,
  NoWhitespaceAddressDirective,
} from './directives/input-whitespace';
// import { PrettyNumberPipe } from './pipes/pretty-number.pipe';
import { PolicyRequestComponent } from './components/policy/policy-request/policy-request.component';
import { PolicyEvaluationComponent } from './components/policy/policy-evaluation/policy-evaluation.component';
import { PolicyResultComponent } from './components/policy/policy-result/policy-result.component';
import { MonitoringComponent } from './components/bulk-load/monitoring/monitoring.component';
import { MonitoringViewComponent } from './components/bulk-load/monitoring-view/monitoring-view.component';
import { MonitoringErrorComponent } from './components/bulk-load/monitoring-error/monitoring-error.component';

import { BrokerPipesModule } from './pipes/broker.pipes.module';

// Kuntur Services 20190812
import { PolicyService } from '../broker/services/policy/policy.service';
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
import { RecordComponent } from './components/record/record.component';
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
import { OnlyTextNumberSpaceDirective } from './directives/only-text-number-space-directive';
import { OnlyTextNumberSpaceDotDirective } from './directives/only-text-number-space-dot-directive';
import { OnlyTextSpaceJustDirective } from './directives/only-text-space-just-directive';
import { OnlyNumberDecimals } from './directives/only-number-decimals-directive';
import {
  PolicyMovementCancelComponent
} from './components/policy-all/policy-movement-cancel/policy-movement-cancel.component';
import {
  ProcessDemandIndexComponent
} from './components/process-demand/process-demand-index/process-demand-index.component';
import { OnlyTextNumberBelowDirective } from './directives/only-text-number-below-directive';
import { CommissionKunturComponent } from './components/maintenance/commission/commission.component';
import { CommissionModalComponent } from './components/maintenance/commission-modal/commission-modal.component';
import { BandejaComponent } from './components/quote/bandeja/bandeja.component';
import { PremiumReportComponent } from './components/premium-reports/premium-report/premium-report.component';
import {
  PremiumReportTrackingComponent
} from './components/premium-reports/premium-report-tracking/premium-report-tracking.component';
import {
  RequestProformaPolicyComponent
} from './components/consultations/request-proforma-policy/request-proforma-policy.component';
// tslint:disable-next-line:max-line-length
import {
  RequestProformaPolicyViewComponent
} from './components/consultations/request-proforma-policy-view/request-proforma-policy-view.component';
import { InterfaceCrossingComponent } from './components/consultations/interface-crossing/interface-crossing.component';
import { CurrentlyInsuredComponent } from './components/consultations/currently-insured/currently-insured.component';
import { PolicyCipComponent } from './components/policy/policy-cip/policy-cip.component';
/* import { MenuLateralComponent } from './shared/menu-lateral/sidebar.component';
 */
/* import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar'; */
import { SharedAppModule } from '../shared-app/shared-app.module';
import { NGSidebarComponent } from './shared/ng-sidebar/ng-sidebar.component';
import { CreditPoliticaComponent } from './components/gestion-Cobranzas/credit-politica/credit-politica.component';
import { CreditViewComponent } from './components/gestion-Cobranzas/credit-view/credit-view.component';
import {
  PaymentClientStatusComponent
} from './components/gestion-Cobranzas/payment-client-status/payment-client-status.component';
import {
  PaymentClentViewComponent
} from './components/gestion-Cobranzas/payment-clent-view/payment-clent-view.component';
import { BillReportReceiptComponent } from './components/reports/bill-report-receipt/bill-report-receipt.component';
// tslint:disable-next-line:max-line-length
import {
  BillReportReceiptColumnDialogComponent
} from './components/reports/bill-report-receipt-column-dialog/bill-report-receipt-column-dialog.component';
import { CommissionAuthComponent } from './components/commission-auth/commission-auth.component';
import { TableType } from './models/payroll/tabletype';
import { QuotationCovidComponent } from './components/quote/covid/quotation-covid/quotation-covid.component';
import { RequestCovidComponent } from './components/quote/covid/request-covid/request-covid.component';
import { CovidEvaluationComponent } from './components/quote/covid/covid-evaluation/covid-evaluation.component';
import { PolicyCovidComponent } from './components/policy-all/policy-covid/policy-covid.component';
import { LoginProfileComponent } from './components/login-profile/login-profile.component';
import { MinimumPremiumComponent } from './components/maintenance/minimum-premium/minimum-premium.component';
import { ParameterSettingsComponent } from './components/maintenance/parameter-settings/parameter-settings.component';
// tslint:disable-next-line:max-line-length
import {
  MaximumInsurableRemunerationDialogComponent
} from './components/maintenance/maximum-insurable-remuneration-dialog/maximum-insurable-remuneration-dialog.component';
// tslint:disable-next-line:max-line-length
import {
  CombinationActivitiesDialogComponent
} from './components/maintenance/combination-activities-dialog/combination-activities-dialog.component';
import {
  RetroactivityDialogComponent
} from './components/maintenance/retroactivity-dialog/retroactivity-dialog.component';
import {
  PanelInfoPagoModule
} from './components/quote/acc-personales/components/panel-info-pago/panel-info-pago.module';
import { StorageService } from './components/quote/acc-personales/core/services/storage.service';
import { AccPersonalesService } from './components/quote/acc-personales/acc-personales.service';
import { FileService } from './components/quote/acc-personales/core/services/file.service';
import { PanelModalModule } from './components/quote/acc-personales/components/panel-modal/panel-modal.module';
import { LogsUsuariosComponent } from './components/logs-usuarios/logs-usuarios.component';
import { LogsService } from './services/logs/logs.service';

import { LeadService } from './services/lead/lead.service';
import { CertificadoElectronicoComponent } from './components/certificado-electronico';
import { PlataformaPanelComponent } from './components/plataforma-panel/plataforma-panel.component';
import { QuotationCoverComponent } from './components/quote/quotation-cover/quotation-cover.component';
import { ComprobantesComponent } from './components/comprobantes/comprobantes.component';
import { AuthorizationComponent } from './components/authorization/authorization.component';
import { ChannelPointModule } from '../backoffice/components/transaction/shared/channel-point/channel-point.module';
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
import { ReporteCierreComponent } from './components/reports/reporte-cierre/reporte-cierre.component';
import { ReporteCierreService } from './services/report/reporte-cierre.service';
import {
  RequestReporteCierreComponent
} from './components/consultations/request-reporte-cierre/request-reporte-cierre.component';
import { NotasCreditoComponent } from './components/reports/notas-credito/notas-credito.component';
import {
  RequestNotasCreditoComponent
} from './components/consultations/request-notas-credito/request-notas-credito.component';
import { CreditNoteComponent } from './components/creditNote/creditNote.component';
import { AsesoriaBrokerComponent } from './components/reports/asesoria-broker/asesoria-broker.component';
import {
  RequestAsesoriaBrokerComponent
} from './components/consultations/request-asesoria-broker/request-asesoria-broker.component';
import { NavMenuProdModule } from '../../shared/components/navmenuprod/navmenuprod.module';
import { WelcomeComponent } from '../../shared/components/soat/generic/welcome/welcome.component';
// tslint:disable-next-line:max-line-length
import {
  RequestReporteCtasXCobrarComponent
} from './components/consultations/request-reporte-ctas-xcobrar/request-reporte-ctas-xcobrar.component';
import { ReporteCtasXcobrarComponent } from './components/reports/reporte-ctas-xcobrar/reporte-ctas-xcobrar.component';
import {
  PreliminaryReportPayComponent
} from './components/reports/preliminary-report-pay/preliminary-report-pay.component';
// tslint:disable-next-line:max-line-length
import {
  RequestPreliminaryMonitoreoPayComponent
} from './components/consultations/request-preliminary-monitoreo-pay/request-preliminary-monitoreo-pay.component';
import { ReporteSoatComponent } from './components/reports/reporte-soat/reporte-soat.component';
import {
  RequestReporteSoatComponent
} from './components/consultations/request-reporte-soat/request-reporte-soat.component';
import { AtpReportComponent } from './components/atp-reports/atp-report/atp-report.component';

import { TrayTransactComponent } from './components/transact/tray-transact/tray-transact.component';
import { TransactAccessComponent } from './components/transact/transact-access/transact-access.component';
import { TransactEvaluationComponent } from './components/transact/transact-evaluation/transact-evaluation.component';
import { ReportIndicatorsComponent } from './components/reports/report-indicators/report-indicators.component';
/* const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
}; */
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { ValidationLotComponent } from './components/validation-lot/validation-lot.component';
import { RebillComponent } from './components/rebill/rebill.component';
import { ReporteRefacturacion } from './components/rebillReport/rebillReport.component';
import { GeneracionQrComponent } from './components/generacion-qr/generacion-qr.component';
import { GeneracionQrAddComponent } from './components/generacion-qr-add/generacion-qr-add.component';
import { DebtReportService } from './services/debt-report/debt-report.service';
import { ReassingTransactComponent } from './components/transact/reassing-transact/reassing-transact.component';
import { AtpClaimReportComponent } from './components/atp-reports/atp-claim-report/atp-claim-report.component';
import { VdpPersistReportComponent } from './components/atp-reports/vdp-persist-report/vdp-persist-report.component';
import { SearchEndoserComponent } from './modal/search-endoser/search-endoser.component';
import { RestrictGuard } from '@shared/guards/restrict.guard';
// tslint:disable-next-line:max-line-length
import {
  TransactAccessDesgravamenComponent
} from './components/transact/transact-access-desgravamen/transact-access-desgravamen.component';
// tslint:disable-next-line:max-line-length
import {
  TransactEvaluationDesgravamenComponent
} from './components/transact/transact-evaluation-desgravamen/transact-evaluation-desgravamen.component';

import { DesgravamenServicePD } from '../desgravamen/desgravament.service';
import { CommissionCoComponent } from './components/commission-channel/commission-channel.component';
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
// tslint:disable-next-line:max-line-length
import {
  VdpRenovationReportComponent
} from './components/atp-reports/vdp-renovacion-report/vdp-renovacion-report.component'; // VdpRenovationReportComponent
// tslint:disable-next-line:max-line-length
import {
  VdpContaComisionReportComponent
} from './components/atp-reports/vdp-ContaComision-report/vdp-ContaComision-report.component'; // ReportContaComisionVDP
import {
  VdpFacturationReportComponent
} from './components/atp-reports/vdp-Facturation-report/vdp-Facturation-report.component';
import {
  VdpConveniosReportComponent
} from './components/atp-reports/vdp-Convenios-report/vdp-Convenios-report.component';
import { VcfPolicyReportComponent } from './components/atp-reports/vcf-Policys-Reports/vdf-policy-report.component';

// *VIDA DEVOLUCION PROTECTA +
import { BuyPlanDataComponent } from './components/vida-devolucion/buy-plandata/buy-plandata.component';
import { QuoteTrayComponent } from './components/vida-devolucion/quote-tray/quote-tray.component';
import { QuoteAsignComponent } from './components/vida-devolucion/quote-asign/quote-asign.component';
import { ViewQuotationComponent } from './components/vida-devolucion/view-quotation/view-quotation.component';
import { DataProductComponent } from './components/vida-devolucion/data-product/data-product.component';
import { SalesHistoryComponent } from './components/vida-devolucion/sales-history/sales-history.component';
import { UnassignedQuotesComponent } from './components/vida-devolucion/unassigned-quotes/unassigned-quotes.component';
import { ApprovalsPendingComponent } from './components/vida-devolucion/approvals-pending/approvals-pending.component';
import { NuevoClienteComponent } from './components/vida-devolucion/nuevo-cliente/nuevo-cliente.component';
import { ContratanteFormComponent } from './components/vida-devolucion/contratante-form/contratante-form.component';

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

// *CARGA MASIVA
import {
  MassiveChargeTrayComponent
} from './components/vida-devolucion/massive-charge/massive-charge-tray/massive-charge-tray.component';
// tslint:disable-next-line:max-line-length
import {
  MassiveChargeDetailComponent
} from './components/vida-devolucion/massive-charge/massive-charge-detail/massive-charge-detail.component';

// *PORTAL DE TRAMITES
import { BandejaTramitesComponent } from './components/portal-tramites/bandeja-tramites/bandeja-tramites.component';
import { NuevoTramiteComponent } from './components/portal-tramites/nuevo-tramite/nuevo-tramite.component';
import { SeleccionPolizaComponent } from './components/portal-tramites/seleccion-poliza/seleccion-poliza.component';

import { CommonComponentsModule } from '@shared/modules/common-components.module';
// reporte tecnico, operacion, facturacion y convenios de desgravamen con devolucion
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
import { ConfigCommissionComponent } from './components/atp-reports/config-commission/config-commission.component';
import {
  ConfigCommissionComponentRecord
} from './components/atp-reports/config-commission-record/config-commission-record.component';


import { PhotocheckComponent } from './components/photocheck/photocheck.component';
import { ReporteLoteCobranzasComponent } from './components/reporte-lote-cobranzas/reporte-lote-cobranzas.component';

import { ReporteSucaveComponent } from './components/reports/reporte-sucave/reporte-sucave.component';
// tslint:disable-next-line:max-line-length
import {
  RequestReporteSucaveComponent
} from './components/consultations/request-reporte-sucave/request-reporte-sucave/request-reporte-sucave.component';
// tslint:disable-next-line:max-line-length
import {
  SucaveErrorComponent
} from './components/consultations/request-reporte-sucave/request-reporte-sucave-error/request-reporte-sucave-error.component';
// tslint:disable-next-line:max-line-length
import {
  SucaveViewComponent
} from './components/consultations/request-reporte-sucave/request-reporte-sucave-view/request-reporte-sucave-view.component';
//interfaz en linea
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
import { ReporteInconsistenciasSanitasService } from './services/report/reporte-inconsistencias-sanitas.service';
import {
  ReporteInconsistenciasSanitasViewComponent
} from './components/reports/reporte-inconsistencias-sanitas/reporte-inconsistencias-sanitas-view/reporte-inconsistencias-sanitas-view.component';

import {
  MantenimientoComiDifComponent
} from './components/maintenance/mantenimiento-comi-dif/mantenimiento-comi-dif.component';
import {
  MantenimientoComiDifModalConfigComponent
} from './components/maintenance/mantenimiento-comi-dif/modal-config/modal-config.component';
import {
  MantenimientoPlanAsistComponent
} from './components/maintenance/mantenimiento-planes-asistencias/mantenimiento-planes-asistencias.component';
import {
  PolicyMovementDetailsCreditComponent
} from './components/policy-all/policy-movement-details-credit/policy-movement-details-credit.component';
import {
  MantenimientoPlanAsistModalConfigComponent
} from './components/maintenance/mantenimiento-planes-asistencias/modal-config/modal-config.component';
import { FormInputTextModule } from '../desgravamen/shared/components/form-input-text/form-input-text.module';
import { FormInputDateModule } from '../desgravamen/shared/components/form-input-date/form-input-date.module';
import { SettingsRmvComponent } from './components/maintenance/settings-rmv/settings-rmv.component';
import { EditPorcentajeComponent } from './components/maintenance/edit-porcentaje/edit-porcentaje.component';
import {
  HistorialPorcentajeRmvComponent
} from './components/maintenance/historial-porcentaje-rmv/historial-porcentaje-rmv.component';
import { PolicyListInsuredComponent } from './components/policy-all/policy-list-insured/policy-list-insured.component';
import { BandejaSolicitudesComponent } from './components/bandeja-solicitudes/bandeja-solicitudes.component';
import { PolicyChangeUserComponent } from './components/policy-all/policy-change-user/policy-change-user.component';
import {
  PolicyCreateInsuredComponent
} from './components/policy-all/policy-create-insured/policy-create-insured.component';
import { LoginEpsComponent } from './components/login-eps/login-eps.component';
import { KushkiFormModule } from '../../shared/modules/kushki-form.module';
import {
  RequestProvicomisionesComponent
} from "@root/layout/broker/components/consultations/request-provicomisiones/request-provicomisiones.component";
import { SearchSchoolComponent } from './modal/search-school/search-school.component';
import { ViewCouponComponent } from './modal/view-coupon/view-coupon.component'; //GCAA 06022024
import { CommissionReportComponent } from './components/commission-report/commission-report.component';
import { PolicyLinkComponent } from './components/policy/policy-link/policy-link.component';
//INI MMQ 11-12-2023
//INNOBILIAIA

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

import { DevolucionesOdinariasRentasComponent } from './components/devoluciones/devoluciones-odinarias-rentas/devoluciones-odinarias-rentas.component';
//Rentas
import { FormInputDateREModule } from './components/form-inputs/form-input-date/form-input-date.module';
import { FormInputSelectREModule } from './components/form-inputs/form-input-select/form-input-select-re.module';
import { FormInputTextREModule } from './components/form-inputs/form-input-text/form-input-text.module';
import { ListadoModalComponent } from './components/modals/listado-modal/listado-modal.component';
import { ClientModalComponent } from './components/modals/client-modal/client-modal.component';
import { EjecutivoModalComponent } from './components/modals/ejecutivo-modal/ejecutivo-modal.component';
import { DevolucionesOdinariasRentasDetalleComponent } from './components/devoluciones/devoluciones-odinarias-rentas-detalle/devoluciones-odinarias-rentas-detalle.component';
import { FormInputSelectTextREModule } from './components/form-inputs/form-input-select-text/form-input-select-text-re.module';
import { ComentarioModalComponent } from './components/modals/comentario-modal/comentario-modal.component';
import { FormInputTextareaREModule } from './components/form-inputs/form-input-textarea/form-input-textarea-re.module';
import { NewDocumentModalComponent } from './components/modals/new-document-modal/new-document-modal.component';
import { ConfirmModalComponent } from './components/modals/confirm-modal/confirm-modal.component';
//INI MMQ 11-12-2023

//import { ViewCouponComponent } from './modal/view-coupon/view-coupon.component'; //GCAA 06022024
//import { CommissionReportComponent } from './components/commission-report/commission-report.component';
@NgModule({
  imports: [
    CommonModule,
    BrokerRoutingModule,
    FormsModule,
    FormButtonModule,
    ReactiveFormsModule,
    HttpClientModule,
    SharedComponentsModule,
    PaginationModule.forRoot(),
    ModalModule,
    ConfirmModule,
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    ModalModules,
    RecaptchaModule,
    NgbModule,
    ChartsModule,
    NgxPaginationModule,
    DigitOnlyModule,
    ngfModule, // Kuntur 20190812
    NgSelectModule, // Kuntur 20190812,
    /* PerfectScrollbarModule, */
    SharedAppModule,
    // BrowserModule,
    ReactiveFormsModule,
    NavmenusctrModule,
    FormInputTextModule,
    FormInputDateModule,
    BrokerPipesModule,
    PanelInfoPagoModule, // ac modal pagos 20201105
    TabsModule.forRoot(),
    ChannelPointModule,
    NavMenuProdModule,
    NgxSkeletonLoaderModule,
    CommonComponentsModule,
    KushkiFormModule,
    FormInputDateREModule,
    FormInputSelectREModule,
    FormInputTextREModule,
    FormInputSelectTextREModule,
    FormInputTextareaREModule
  ],
  exports: [FormsModule, VisaNetButtonDirective],
  declarations: [
    NGSidebarComponent,
    BrokerComponent,
    LoginComponent,
    LoginRemoteComponent,
    NavMenuComponent,
    HistorialComponent,
    SidebarComponent,
    FileUploadComponent,
    SalePanelComponent,
    Step01Component,
    Step02Component,
    Step03Component,
    Step04Component,
    Step05Component,
    ContratanteComponent,
    BrokerEmissionComponent,
    ResultadoComponent,
    UbigeoComponent,
    ReportsalescvComponent,
    ReportsalescfComponent,
    ReportsalescvComponent,
    ReportsalesproComponent,
    ReportcomisscvComponent,
    ReportcomissproComponent,
    ReportsalescertificateComponent,
    FlowtypeComponent,
    StatesalesComponent,
    ChannelpointComponent,
    ChannelsalesComponent,
    UsoComponent,
    PaymenttypeComponent,
    SalesmodeComponent,
    PayrollComponent,
    CommissionComponent,
    PayrollAddComponent,
    StateComponent,
    TitleStepComponent,
    BackStepComponent,
    BankComponent,
    CurrencytypeComponent,
    ResVaucherComponent,
    ResPagoEfectivoComponent,
    PayrollResultadoVisaComponent,
    RetrievePasswordComponent,
    MigaPanComponent,
    RetrieveSendComponent,
    RenewPasswordComponent,
    OverlayComponent,
    VisaResultComponent,
    TerminosCondicionesComponent,
    PrePayrollListComponent,
    PrePayrollAddComponent,
    PrePayrollResultadoVisaComponent,
    CommissLotComponent,
    CommissionLotAddComponent,
    CampaignListComponent,
    CampaignAddComponent,
    VisaNetButtonDirective,
    NoWhitespaceDirective,
    NoWhitespaceAddressDirective,
    QuotationComponent, // Kuntur 20190812
    RequestStatusComponent, // Kuntur 20190812
    TransactionReportComponent, // Kuntur 20190812
    InsuredReportComponent, // Kuntur 20190812
    StateReportComponent, // Kuntur 20190812
    OnlyNumberDirective, // Kuntur 20190812
    OnlyTextNumberDirective, // Kuntur 20190812
    OnlyTextSpaceDirective, // Kuntur 20190812
    DateDirective, // Kuntur 20190812
    LegalNameDirective, // Kuntur 20190812
    FloatDirective, // Kuntur 20190812
    FloatSixDecimalalService, // Kuntur20200316
    UppercaseDirective, // Kuntur 20190812
    OnlyTextSpaceDotDirective,
    OnlyTextNumberJustDirective,
    OnlyTextNumberSpaceDirective,
    OnlyTextNumberSpaceDotDirective,
    OnlyTextSpaceJustDirective,
    OnlyTextNumberBelowDirective,
    OnlyNumberDecimals,
    HomeComponent, // Kuntur 20190812
    ContractorLocationIndexComponent, // Kuntur 20190812
    ContractorLocationFormComponent, // Kuntur 20190812
    ContractorViewComponent, // Kuntur 20190812
    PolicyFormComponent, // Kuntur 20190812
    PanelComponent, // Kuntur 20190812
    // NavmenusctrComponent, // Kuntur 20190812
    PolicyIndexComponent, // Kuntur 20190812
    ConfigCommissionComponent,
    PolicyMovementDetailsComponent, // Kuntur 20190812
    PolicyMovementProofComponent, // Kuntur 20190812
    AddContractingComponent, // Kuntur 20190812
    AddTelephoneComponent, // Kuntur 20190812
    AddEmailComponent, // Kuntur 20190812
    AddAddressComponent, // Kuntur 20190812
    AddContactComponent, // Kuntur 20190812
    AgencyIndexComponent, // Kuntur 20190812
    AgencyFormComponent, // Kuntur 20190812
    ProductComponent, // Kuntur 20190812
    ContractorLocationContactComponent, // Kuntur 20190812
    BrokerSearchBynameComponent, // Kuntur 20190812
    QuotationTrackingComponent, // Kuntur 20190812
    QuotationEvaluationComponent, // Kuntur 20190812
    SearchContractingComponent, // Kuntur 20190812
    SearchBrokerComponent, // Kuntur 
    ListadoModalComponent,//Rentas
    ConfirmModalComponent,//Rentas
    ClientModalComponent,//Rentas
    NewDocumentModalComponent,//Rentas
    EjecutivoModalComponent,//Rentas
    ComentarioModalComponent,//Rentas
    ValErrorComponent, // Kuntur 20190812
    // ViewCouponComponent, // GCAA 06022024
    // TypeDocumentPipe, // Kuntur 20190812
    NameContractorPipe, // Kuntur 20190812
    AddCiiuComponent, // Kuntur 20190812
    MilesPipe, // Kuntur 20190812
    // FileNamePipe, // Kuntur 20190812
    FilterPipe, // Kuntur 20190812
    ValErrorComponent, // Kuntur 20190812
    PolicyDocumentsComponent, // Kuntur 20190812
    ContractorStateComponent, // Kuntur 20190812
    CreditQualificationRecordComponent, // Kuntur 20190812
    PolicyTransactionsComponent, // Kuntur 20190812
    FilePickerComponent, // Kuntur 20190812
    ProcessViewerComponent, // Kuntur 20190919
    // PrettyNumberPipe, // Kuntur 20190919
    AnulMovComponent, // Kuntur 20190812
    PolicyRequestComponent, // Kuntur 20190812
    PolicyEvaluationComponent, // Kuntur 20190812
    MethodsPaymentComponent,
    PolicyResultComponent, // Kuntur 2019103
    MonitoringComponent, // Kuntur 20190812
    MonitoringViewComponent,
    MonitoringErrorComponent,
    SaleClientReportComponent,
    SaleChannelReportComponent,
    SaleEnterpriseReportComponent,
    CommissionEnterpriseReportComponent,
    CommissionChannelReportComponent,
    RecordComponent,
    PayrollKunturComponent,
    AddCoverComponent,
    CoverIndexComponent,
    ModuleIndexComponent,
    AddModuleComponent,
    PolicyTransactionsAllComponent,
    PolicyMovementDetailsAllComponent,
    PlotComponent,
    CoverSpecificInformationComponent,
    CoverRateComponent,
    CoverRateDetailComponent,
    PolicyDocumentsAllComponent,
    PolicyMovementDetailsCreditComponent,
    PolicyMovementCancelComponent,
    ProcessDemandIndexComponent,
    CommissionKunturComponent,
    CommissionModalComponent,
    BandejaComponent, // KUNTUR 17092019
    PremiumReportComponent,
    PremiumReportTrackingComponent, // KUNTUR 11032020
    RequestProformaPolicyComponent,
    RequestProformaPolicyViewComponent,
    InterfaceCrossingComponent,
    CurrentlyInsuredComponent,
    PolicyCipComponent,
    CreditPoliticaComponent,
    CreditViewComponent,
    PaymentClientStatusComponent,
    PaymentClentViewComponent,
    BillReportReceiptComponent,
    BillReportReceiptColumnDialogComponent,
    CommissionAuthComponent,
    QuotationCovidComponent,
    RequestCovidComponent,
    CovidEvaluationComponent,
    PolicyCovidComponent,
    LoginProfileComponent,
    MinimumPremiumComponent,
    ParameterSettingsComponent,
    MaximumInsurableRemunerationDialogComponent,
    CombinationActivitiesDialogComponent,
    RetroactivityDialogComponent,
    LogsUsuariosComponent,
    CertificadoElectronicoComponent,
    PlataformaPanelComponent,
    QuotationCoverComponent,
    RebillComponent,
    ReporteRefacturacion,
    ValidationLotComponent,
    ComprobantesComponent,
    QuotationCoverComponent,
    QuotationReportComponent,
    PreliminaryReportComponent,
    DevolucionComponent,
    CorreoComponent,
    DevolucionesOdinariasRentasComponent, //rentas 20/25/2024
    DevolucionesOdinariasRentasDetalleComponent,//rentas
    ReversionComponent,
    ReporteNotaCreditoComponent,
    RequestPreliminaryMonitoreoComponent,
    ReporteCierreComponent,
    RequestReporteCierreComponent,
    NotasCreditoComponent,
    RequestNotasCreditoComponent,
    CreditNoteComponent,
    AsesoriaBrokerComponent,
    RequestAsesoriaBrokerComponent,
    ReportIndicatorsComponent,
    AuthorizationComponent,
    WelcomeComponent,
    RequestReporteCtasXCobrarComponent,
    ReporteCtasXcobrarComponent,
    PreliminaryReportPayComponent,
    RequestPreliminaryMonitoreoPayComponent,
    ReporteSoatComponent,
    RequestReporteSoatComponent,
    RequestProvicomisionesComponent,
    SearchEndoserComponent,
    AtpReportComponent, // ATP 20210806
    TrayTransactComponent,
    TransactAccessComponent,
    TransactEvaluationComponent,
    GeneracionQrComponent,
    GeneracionQrAddComponent,
    ReassingTransactComponent,
    BuyPlanDataComponent,
    QuoteTrayComponent,
    ViewQuotationComponent,
    DataProductComponent,
    SalesHistoryComponent,
    UnassignedQuotesComponent,
    ApprovalsPendingComponent,
    AtpClaimReportComponent,
    VdpPersistReportComponent,
    TransactAccessDesgravamenComponent,
    TransactEvaluationDesgravamenComponent,
    NuevoClienteComponent,
    ContratanteFormComponent,
    BandejaTramitesComponent,
    NuevoTramiteComponent,
    SeleccionPolizaComponent,
    CommissionCoComponent,
    QuoteAsignComponent,
    VdpTecnicReportComponent,
    DescdTecnicReportComponent,
    DescdOperacReportComponent,
    DescdFacturacionReportComponent,
    DescdConveniosReportComponent,
    DescdComisionesReportComponent,
    ProviComisionesReportComponent,
    ReporteComisionesAutomaticasComponent,
    DescdCuentasxcobrarReportComponent,
    VdpControlReportComponent,
    VdpControlDetailReportComponent,
    VdpAnualResumeReportComponent,
    VdpMonthResumeReportComponent,
    VdpDailyResumeReportComponent,
    VdpReserveRegistryReportComponent,
    DecimalDirective,
    MassiveChargeTrayComponent,
    MassiveChargeDetailComponent,
    VdpComisionReportComponent,
    VdpRenovationReportComponent,
    VdpContaComisionReportComponent,
    VdpFacturationReportComponent,  //ReportFacturaciónVDP
    VdpConveniosReportComponent, //ReportConveniosVDP
    VcfPolicyReportComponent,
    VdpProvisionComisionReportGenerateComponent,
    VdpProvisionComisionConsultationComponent,
    VdpProvisionComisionEvaluacionConsultaComponent,
    VdpProvisionComisionAutorizarConsultaComponent,
    VdpProcesoGeneracionPlanillaPagosComponent,
    VdpReporteAsesoresVentasVigentesComponent,
    VdpReportVentasComisionesAsesorComponent,
    VdpReportVentasComisionesSupervisorComponent,
    VdpReportVentasComisionesJefeComponent,
    VdpReportVentasComisionesSoporteComponent,
    PhotocheckComponent,
    ReporteLoteCobranzasComponent,
    LoginEpsComponent,
    ReporteSucaveComponent,
    RequestReporteSucaveComponent,
    SucaveErrorComponent,
    SucaveViewComponent,
    //interfaz en linea
    InterfaceRentasComponent,
    InterfaceBankpaymentObsComponent,
    InterfaceBankPaymentComponent,
    InterfaceMonitoringComponent,
    ClosingDateConfigComponent,
    ModuleReportsOperacionesComponent,
    InterfaceDependenceComponent,
    PriorityConfigurationComponent,
    AccountingEntriesConfigComponent,
    ModuleCostCenterComponent,
    InterfazComponent,
    ScheduleMaintenanceComponent,
    ModuleReportsBancarioComponent,
    ConsultaControlBancarioComponent,
    RequestReporteReciboComponent,
    ReporteReciboComponent,
    ReporteTramasHistoricasComponent,
    ReporteInconsistenciasSanitasComponent,
    ReporteInconsistenciasSanitasViewComponent,
    MantenimientoComiDifComponent,
    MantenimientoComiDifModalConfigComponent,
    MantenimientoPlanAsistComponent,
    MantenimientoPlanAsistModalConfigComponent,
    ConfigCommissionComponentRecord,
    SettingsRmvComponent,
    EditPorcentajeComponent,
    HistorialPorcentajeRmvComponent,
    PolicyChangeUserComponent,
    PolicyListInsuredComponent,
    PolicyCreateInsuredComponent,
    //INI MMQ 11-12-2023
    //INNOBILIAIA
    InmobiliaryLoadMassiveComponent,
    InmobiliaryMonitoringComponent,
    InmobiliaryMonitoringViewComponent,
    InmobiliaryMonitoringErrorComponent,
    InmobiliaryControlCierreComponent,
    InmobiliaryReportCierreComponent,
    InmobiliaryMaintenanceClientComponent,
    InmobiliaryInterfaceMonitoringComponent,
    InmobiliaryModuleReportsOperacionesComponent,
    InmobiliaryConsultaControlBancarioComponent,    
    InmobiliaryClosingDateConfigComponent,
    //INI MMQ 11-12-2023
    BandejaSolicitudesComponent,
    SearchSchoolComponent,
    ViewCouponComponent, // GCAA 06022024
    InterfaceRentasComponent,
    PolicyLinkComponent,
    CommissionReportComponent // GCAA 06022024
  ],
  entryComponents: [
    ResVaucherComponent,
    PayrollResultadoVisaComponent,
    FilePickerComponent, // Kuntur 20190812
    CreditQualificationRecordComponent, // Kuntur 20190812
    ContractorViewComponent, // Kuntur 20190812
    ContractorLocationFormComponent, // Kuntur 20190812
    ContractorLocationContactComponent, // Kuntur 20190812
    PolicyMovementDetailsComponent, // Kuntur 20190812
    PolicyFormComponent, // Kuntur 20190812
    AddTelephoneComponent, // Kuntur 20190812
    AddEmailComponent, // Kuntur 20190812
    AddAddressComponent, // Kuntur 20190812
    AddContactComponent, // Kuntur 20190812
    AgencyFormComponent, // Kuntur 20190812
    BrokerSearchBynameComponent, // Kuntur 20190812
    QuotationTrackingComponent, // Kuntur 20190812
    SearchContractingComponent, // Kuntur 20190812
    SearchBrokerComponent, // Kuntur 20190812
        SearchSchoolComponent,
    SearchBrokerComponent, // Kuntur 
    ListadoModalComponent,//Rentas
    ConfirmModalComponent,//Rentas
    EjecutivoModalComponent,//Rentas
    ComentarioModalComponent,//Rentas
    ClientModalComponent, //Rentas
    NewDocumentModalComponent,//Rentas
    SearchSchoolComponent,

    ValErrorComponent, // Kuntur 20190812
    ViewCouponComponent, // GCAA 06022024
    PolicyDocumentsComponent, // Kuntur 20190812
    AddCiiuComponent, // Kuntur 20190812
    AnulMovComponent, // Kuntur 20190919
    MethodsPaymentComponent, // Kuntur 2019103
    MonitoringViewComponent, // Kuntur 20190917
    PolicyMovementDetailsAllComponent,
    PolicyDocumentsAllComponent,
    PolicyMovementDetailsCreditComponent,
    RequestProformaPolicyViewComponent, // Kuntur 20200515
    CreditViewComponent,
    PaymentClentViewComponent,
    BillReportReceiptComponent,
    BillReportReceiptColumnDialogComponent,
    MaximumInsurableRemunerationDialogComponent,
    CombinationActivitiesDialogComponent,
    RetroactivityDialogComponent,
    QuotationCoverComponent, // Kuntur 20200822
    SearchEndoserComponent, // desgravament
    ReassingTransactComponent,
    SucaveViewComponent,
    ReporteInconsistenciasSanitasViewComponent,
    MantenimientoComiDifModalConfigComponent,
    MantenimientoPlanAsistModalConfigComponent,
    ConfigCommissionComponent,
    ConfigCommissionComponentRecord,
    EditPorcentajeComponent,
    HistorialPorcentajeRmvComponent,
    PolicyChangeUserComponent,
    PolicyListInsuredComponent,
    PolicyCreateInsuredComponent
  ],

  schemas: [CUSTOM_ELEMENTS_SCHEMA,NO_ERRORS_SCHEMA],
  providers: [
    AppConfig,
    AuthGuard,
    AuthenticationService,
    UserService,
    GlobalEventsManager,
    HistorialService,
    UbigeoService,
    Step03Service,
    Step04Service,
    HistorialService,
    Step03Service,
    Step04Service,
    VehiculoService,
    ApiService,
    ExcelService,
    ReportSalesPROService,
    ReportSalesCFService,
    ReportSalesCVService,
    ReportComissCVService,
    ReportComissPROService,
    ReportSalesCertificateService,
    FlowTypeService,
    ConfigService,
    UbigeoService,
    UsoService,
    PaymentTypeService,
    StateSalesService,
    ChannelSalesService,
    ChannelPointService,
    UtilityService,
    ValidatorService,
    SalesModeService,
    PapelService,
    PayrollService,
    StateService,
    VisaService,
    BankService,
    CurrencyTypeService,
    AccountBankService,
    ClienteService,
    EmisionService,
    PagoEfectivoService,
    ConfirmService,
    PagoEfectivoService,
    PasswordService,
    AccPersonalesService, // modal -ac
    StorageService, // modal -ac
    FileService, // modal -ac
    DatePipe,
    LogsService,
    LeadService,
    DebtReportService,
    DesgravamenServicePD,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: BrokerHttpInterceptor,
      multi: true,
    },
    /*  {
       provide: PERFECT_SCROLLBAR_CONFIG,
       useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
     }, */
    DecimalPipe,
    PrepayrollService,
    SidebarService,
    Step05Service,
    CommissionLotService,
    CampaignService,
    FileUploadService,
    DeliveryService,
    SessionStorageService,
    RestrictGuard,
  ],
})
export class BrokerModule {
}
