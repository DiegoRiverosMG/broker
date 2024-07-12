import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

import { ClientInformationService } from '../../../../../services/shared/client-information.service';
import { AccPersonalesConstants } from '../../core/constants/acc-personales.constants';

@Component({
  selector: 'form-search-client',
  templateUrl: './form-search-client.component.html',
  styleUrls: ['./form-search-client.component.css']
})
export class FormSearchClientComponent implements OnInit {
  
  @Input() label: string;
  @Input() disabled: boolean;
  
  @Input() client: any;
  @Output() clientChange: EventEmitter<any> = new EventEmitter();

  @Input() clear: boolean;
  @Output() clearChange: EventEmitter<any> = new EventEmitter();
      
  codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
  CONSTANTS: any = AccPersonalesConstants;
  
  constructor(
    public clientInformationService: ClientInformationService) {}
    
  ngOnInit() {
    this.client = this.client || {};
    this.clientChange.emit(this.client);
  }
  clearInfo(){
    console.log('hola')
    //this.clear = true;
    this.client.numDocumento = '';
  }

}