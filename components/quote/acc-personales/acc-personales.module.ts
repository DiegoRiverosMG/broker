import { BrokerModule } from './../../../broker.module';
import { NgModule } from '@angular/core';

import { AccPersonalesRoutingModule } from './acc-personales-routing.module';
import { AccPersonalesComponentsModule } from './components/acc-personales-components.module';

import { AccPersonalesQuotationComponent } from './acc-personales-quotation/acc-personales-quotation.component';
import { AccPersonalesRequestComponent } from './acc-personales-request/acc-personales-request.component';
import { AccPersonalesPoliciesComponent } from './acc-personales-policies/acc-personales-policies.component';
import { AccPersonalesBandejaComponent } from './acc-personales-bandeja/acc-personales-bandeja.component';

import { AccPersonalesService } from './acc-personales.service';
import { StorageService } from './core/services/storage.service';
import { FileService } from './core/services/file.service';
import { SharedAppModule } from './../../../../shared-app/shared-app.module';
import { NavMenuProdModule } from '../../../../../shared/components/navmenuprod/navmenuprod.module';
@NgModule({
  imports: [
    AccPersonalesRoutingModule,
    AccPersonalesComponentsModule,
    BrokerModule,
    SharedAppModule,NavMenuProdModule
  ],
  declarations: [
    AccPersonalesQuotationComponent,
    AccPersonalesRequestComponent,
    AccPersonalesPoliciesComponent,
    AccPersonalesBandejaComponent,
    
  ],
  exports: [
    AccPersonalesQuotationComponent,
    AccPersonalesRequestComponent,
    AccPersonalesPoliciesComponent,
    AccPersonalesBandejaComponent,
  ],
  providers: [
    AccPersonalesService,
    StorageService,
    FileService,
  ]
})
export class AccPersonalesModule { }
