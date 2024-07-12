import { Component, Input, OnInit } from '@angular/core';

import { CommonMethods } from '../../../../common-methods';

@Component({
  selector: 'panel-header-producto',
  templateUrl: './panel-header-producto.component.html',
  styleUrls: ['./panel-header-producto.component.css']
})
export class PanelHeadeProductoComponent implements OnInit {
  
  @Input() title: string;
  
  lblProducto: string = '';
  lblFecha: string = '';
  
  codProducto: string = JSON.parse(localStorage.getItem('codProducto'))['productId'];
  //epsItem: any = JSON.parse(sessionStorage.getItem('eps'));
  epsItem: any = JSON.parse(localStorage.getItem('eps'));
  
  async ngOnInit() {
    let variable: any = await CommonMethods.configuracionVariables(this.codProducto, this.epsItem.NCODE);
    
    // Titulo
    this.lblProducto = CommonMethods.tituloProducto(variable.var_nomProducto, this.epsItem.SNAME);
    this.lblFecha = CommonMethods.tituloPantalla();
  }
  
}