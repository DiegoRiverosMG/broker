import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DesgravamenDevolucionQuotationComponent } from './desgravamen-devolucion-quotation/desgravamen-devolucion-quotation.component';
import { DesgravamenDevolucionRequestComponent } from './desgravamen-devolucion-request/desgravamen-devolucion-request.component';
import { DesgravamenDevolucionPoliciesComponent } from './desgravamen-devolucion-policies/desgravamen-devolucion-policies.component';
import { DesgravamenDevolucionBandejaComponent } from './desgravamen-devolucion-bandeja/desgravamen-devolucion-bandeja.component';

const routes: Routes = [
    {
        path: 'cotizador',
        component: DesgravamenDevolucionQuotationComponent
    },
    {
        path: 'consulta-cotizacion',
        component: DesgravamenDevolucionRequestComponent
    },
    {
        path: 'consulta-poliza',
        component: DesgravamenDevolucionPoliciesComponent
    },
    {
        path: 'bandeja',
        component: DesgravamenDevolucionBandejaComponent
    },
    {
        path: 'evaluacion-cotizacion/:numeroCotizacion/:mode',
        component: DesgravamenDevolucionQuotationComponent,
        data: {
            esEvaluacion: true
        }
    },
    {
        path: 'evaluacion-poliza/:numeroCotizacion/:mode',
        component: DesgravamenDevolucionQuotationComponent,
        data: {
            esEvaluacion: true
        }
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class DesgravamenDevolucionRoutingModule { }
