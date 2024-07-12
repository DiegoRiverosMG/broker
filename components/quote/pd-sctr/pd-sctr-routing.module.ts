import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PdSctrPolicyFormComponent } from './pd-sctr-policy-form/pd-sctr-policy-form.component';
import { PdSctrPolicyIndexComponent } from './pd-sctr-policy-index/pd-sctr-policy-index.component';
import { PdSctrPolicyTransactionsComponent } from './pd-sctr-policy-transactions/pd-sctr-policy-transactions.component';
import { PdSctrQuotationEvaluationComponent } from './pd-sctr-quotation-evaluation/pd-sctr-quotation-evaluation.component';
import { PdSctrQuotationComponent } from './pd-sctr-quotation/pd-sctr-quotation.component';
import { PdSctrRequestStatusComponent } from './pd-sctr-request/pd-sctr-request-status.component';

const routes: Routes = [
  {
    path:'cotizador',
    //extranet/quotation
    component: PdSctrQuotationComponent
  },
  {
    path: 'consulta-cotizacion',
    //extranet/request-status
    component: PdSctrRequestStatusComponent
  },
  {
    path: 'cotizacion-evaluacion',
    component: PdSctrQuotationEvaluationComponent
  },
  {
    path: 'consulta-polizas',
    //extranet/policy-transactions
    component: PdSctrPolicyIndexComponent
  },
  { 
    path: 'poliza/emitir', 
    //extranet/policy/emit
    component: PdSctrPolicyFormComponent 
  }, // modo: emitir
  {
    path: 'poliza/transaccion/:mode',
    component: PdSctrPolicyTransactionsComponent
    // modo: emitir, incluir, renovar
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PdSctrRoutingModule { }
