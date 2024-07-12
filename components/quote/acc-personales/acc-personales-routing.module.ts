import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccPersonalesQuotationComponent } from './acc-personales-quotation/acc-personales-quotation.component';
import { AccPersonalesRequestComponent } from './acc-personales-request/acc-personales-request.component';
import { AccPersonalesPoliciesComponent } from './acc-personales-policies/acc-personales-policies.component';
import { AccPersonalesBandejaComponent } from './acc-personales-bandeja/acc-personales-bandeja.component';

const routes: Routes = [
  {
    path: 'cotizador',
    component: AccPersonalesQuotationComponent
  },
  {
    path: 'consulta-cotizacion',
    component: AccPersonalesRequestComponent
  },
  {
    path: 'consulta-poliza',
    component: AccPersonalesPoliciesComponent
  },
  {
    path: 'bandeja',
    component: AccPersonalesBandejaComponent
  },
  {
    path: 'evaluacion-cotizacion/:numeroCotizacion/:mode',
    component: AccPersonalesQuotationComponent,
    data: {
      esEvaluacion: true
    }
  },
  {
    path: 'evaluacion-poliza/:numeroCotizacion/:mode',
    component: AccPersonalesQuotationComponent,
    data: {
      esEvaluacion: true
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccPersonalesRoutingModule { }
