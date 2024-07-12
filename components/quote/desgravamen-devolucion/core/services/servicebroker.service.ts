import { EventEmitter,Injectable,Output } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServicebrokerService {
  @Output() actualizaBroker: EventEmitter<any> = new EventEmitter();
  constructor() { }
}
