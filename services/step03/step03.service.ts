import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { ListaTipoDocumento } from '../../models/documento/listatipodocumento';
import { Cliente } from '../../models/cliente/cliente';
import { ListaTipoCliente } from '../../models/cliente/listatipocliente';
import { ApiService } from '../../../../shared/services/api.service';
import { HttpHeaders } from '@angular/common/http';
@Injectable()
export class Step03Service {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  constructor(private api: ApiService) { }

  getListTipoPersona(tipoPersona: number = 0): Observable<ListaTipoCliente[]> {
    const endpoint = 'Cliente';
    const action = 'GetListTipoPersona';
    const url = `${endpoint}/${action}/${tipoPersona}`;

    return this.api.get(url);
  }

  getListTipoDocumento(id: string, idtipo: string): Observable<ListaTipoDocumento[]> {
    const endpoint = 'Cliente';
    const action = 'GetListTipoDocumento';
    const url = `${endpoint}/${action}/${id}/${idtipo}`;

    return this.api.get(url);
  }

  getCliente(id: string): Observable<Cliente> {
    const endpoint = 'Cliente';
    const url = `${endpoint}/${id}`;

    return this.api.get(url);
  }

  saveCliente(cliente: Cliente) {
    const endpoint = 'cliente';
    const data = JSON.stringify(cliente);
    return this.api.postHeader(endpoint, data, this.headers);
  }

  clientePorDocumento(tipo: string, numero: string) {
    const endpoint = 'emission';
    const action = 'cliente';
    const url = `${endpoint}/${action}/${tipo}/${numero}`;

    return this.api.get(url);
  }
}
