import { Injectable } from '@angular/core';
import { PlanFilter } from '../../models/plan/planfilter';
import { ApiService } from '../../../../shared/services/api.service';


@Injectable()
export class PlanService {

  constructor(private api: ApiService) { }

  obtenerTarifa(filter: PlanFilter) {
    const endpoint = 'emission';
    const action = 'obtenerplanes';
    const url = `${endpoint}/${action}`;
    const data = JSON.stringify(filter);

    return this.api.post(url, data);
  }
}
