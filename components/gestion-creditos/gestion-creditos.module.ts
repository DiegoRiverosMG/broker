import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { SharedComponentsModule } from '@shared/modules/shared-components.module';
import { GestionCreditosRoutingModule } from './gestion-creditos-routing.module';

// *Servicios
import { LineaCreditoGeneralService } from './shared/services/linea-credito-general.service';
import { LineaCreditoEstadoService } from './shared/services/linea-credito-estado.service';

// *Componentes
import { GestorCreditosComponent } from './components/main/gestion-creditos.component';
import { LineaCreditoGeneralComponent } from './components/linea-credito/linea-credito-general/linea-credito-general.component';
import { LineaCreditoEstadoComponent } from './components/linea-credito/linea-credito-estado/linea-credito-estado.component';
import { GestionCreditosGuard } from './shared/guards/gestion-creditos.guard';

@NgModule({
  declarations: [
    GestorCreditosComponent,
    LineaCreditoGeneralComponent,
    LineaCreditoEstadoComponent,
  ],
  imports: [
    CommonModule,
    GestionCreditosRoutingModule,
    SharedComponentsModule,
    BsDatepickerModule.forRoot(),
  ],
  providers: [
    LineaCreditoGeneralService,
    LineaCreditoEstadoService,
    GestionCreditosGuard,
  ],
})
export class GestionCreditosModule {}
