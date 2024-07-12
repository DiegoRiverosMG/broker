import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ClientInformationService } from '../../../../../services/shared/client-information.service';

@Injectable()
export class PanelInfoContratanteService {
  
  constructor(
    private clientInformationService: ClientInformationService) {}
    
  getInfoContratante(params): Observable<any> {
    return this.clientInformationService.getCliente360(params);
  } 
  
}