import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestorCreditosComponent } from './components/main/gestion-creditos.component';
import { LineaCreditoGeneralComponent } from './components/linea-credito/linea-credito-general/linea-credito-general.component';
import { LineaCreditoEstadoComponent } from './components/linea-credito/linea-credito-estado/linea-credito-estado.component';
import { GestionCreditosGuard } from './shared/guards/gestion-creditos.guard';

const routes: Routes = [
  {
    path: '',
    component: GestorCreditosComponent,
    children: [
      {
        path: 'general',
        component: LineaCreditoGeneralComponent,
      },
      {
        path: 'estado',
        component: LineaCreditoEstadoComponent,
      },
      {
        path: '**',
        redirectTo: 'general',
        pathMatch: 'full',
      },
    ],
    canActivate: [GestionCreditosGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionCreditosRoutingModule {}
