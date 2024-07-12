import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PolicyemitService } from '../../../../../services/policy/policyemit.service';

@Injectable()
export class PanelInfoPolizaService {

  constructor(
    private policyemitService: PolicyemitService) { }

  public getFrecuenciaPago(params: any): Observable<any[]> {
    if (params.codRenovacion === null || params.codRenovacion === undefined) {
      params.codRenovacion = 0;
    }
    return this.policyemitService.getFrecuenciaPago(params.codRenovacion, params.producto);
  }
}
