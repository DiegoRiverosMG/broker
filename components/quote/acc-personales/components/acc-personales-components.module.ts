import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NavmenusctrModule } from '../../../navmenusctr/navmenusctr.module';
import { BrokerPipesModule } from '../../../../pipes/broker.pipes.module';

import { PanelWidgetModule } from './panel-widget/panel-widget.module';
import { PanelTableModule } from './panel-table/panel-table.module';
import { PanelModalModule } from './panel-modal/panel-modal.module';
import { PanelCardModule } from './panel-card/panel-card.module';
import { FormButtonModule } from './form-button/form-button.module';
import { FormInputSelectModule } from './form-input-select/form-input-select.module';
import { FormInputTextModule } from './form-input-text/form-input-text.module';
import { FormInputDateModule } from './form-input-date/form-input-date.module';
import { LoadingScreenModule } from './loading-screen/loading-screen.module';

import { PanelHeaderProductoModule } from './panel-header-producto/panel-header-producto.module';
import { PanelInfoContratanteModule } from './panel-info-contratante/panel-info-contratante.module';
import { PanelInfoContactosModule } from './panel-info-contactos/panel-info-contactos.module';
import { PanelInfoBrokersModule } from './panel-info-brokers/panel-info-brokers.module';
import { PanelInfoPolizaModule } from './panel-info-poliza/panel-info-poliza.module';
import { PanelInfoTramaModule } from './panel-info-trama/panel-info-trama.module';
import { PanelInfoCotizadorModule } from './panel-info-cotizador/panel-info-cotizador.module';
import { PanelInfoEvaluacionModule } from './panel-info-evaluacion/panel-info-evaluacion.module';
import { PanelInfoPagoModule } from './panel-info-pago/panel-info-pago.module';
import { FormSearchClientModule } from './form-search-client/form-search-client.module';
import { BrokerModule } from './../../../../broker.module';
import { PanelInfoExclusionModule } from './panel-info-exclusion/panel-info-exclusion.module';
import { PanelContainerModule } from './panel-container/panel-container.module';
import { PanelInfoColegioModule } from './panel-info-colegio/panel-info-colegio.module';

@NgModule({
  exports: [
    CommonModule,

    NavmenusctrModule,
    BrokerPipesModule,

    PanelWidgetModule,
    PanelContainerModule,
    PanelTableModule,
    PanelModalModule,
    PanelCardModule,
    FormButtonModule,
    FormInputSelectModule,
    FormInputTextModule,
    FormInputDateModule,
    LoadingScreenModule,

    PanelHeaderProductoModule,
    PanelInfoContratanteModule,
    PanelInfoContactosModule,
    PanelInfoBrokersModule,
    PanelInfoPolizaModule,
    PanelInfoTramaModule,
    PanelInfoColegioModule,
    PanelInfoCotizadorModule,
    PanelInfoEvaluacionModule,
    PanelInfoPagoModule,
    PanelInfoExclusionModule,
    FormSearchClientModule,
    BrokerModule
  ],
  imports: [BrokerModule],
  declarations: []
})
export class AccPersonalesComponentsModule { }
