import { BrokerModule } from '../../../broker.module';
import { NgModule } from '@angular/core';

import { DesgravamenDevolucionRoutingModule } from './desgravamen-devolucion-routing.module';
import { DesgravamenDevolucionComponentsModule } from './components/desgravamen-devolucion-components.module';

import { DesgravamenDevolucionQuotationComponent } from './desgravamen-devolucion-quotation/desgravamen-devolucion-quotation.component';
import { DesgravamenDevolucionRequestComponent } from './desgravamen-devolucion-request/desgravamen-devolucion-request.component';
import { DesgravamenDevolucionPoliciesComponent } from './desgravamen-devolucion-policies/desgravamen-devolucion-policies.component';
import { DesgravamenDevolucionBandejaComponent } from './desgravamen-devolucion-bandeja/desgravamen-devolucion-bandeja.component';

import { DesgravamenDevolucionService } from './desgravamen-devolucion.service';
import { StorageService } from './core/services/storage.service';
import { FileService } from './core/services/file.service';
import { SharedAppModule } from '../../../../shared-app/shared-app.module';
import { NavMenuProdModule } from '../../../../../shared/components/navmenuprod/navmenuprod.module';
@NgModule({
  imports: [
    DesgravamenDevolucionRoutingModule,
    DesgravamenDevolucionComponentsModule,
    BrokerModule,
    SharedAppModule,NavMenuProdModule
  ],
  declarations: [
    DesgravamenDevolucionQuotationComponent,
    DesgravamenDevolucionRequestComponent,
    DesgravamenDevolucionPoliciesComponent,
    DesgravamenDevolucionBandejaComponent,
    
  ],
  exports: [
    DesgravamenDevolucionQuotationComponent,
    DesgravamenDevolucionRequestComponent,
    DesgravamenDevolucionPoliciesComponent,
    DesgravamenDevolucionBandejaComponent,
  ],
  providers: [
    DesgravamenDevolucionService,
    StorageService,
    FileService,
  ]
})
export class DesgravamenDevolucionModule { }
