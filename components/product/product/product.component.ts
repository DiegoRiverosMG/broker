import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product/panel/product.service';
import { ProductByUserRQ } from '../../../models/product/panel/Request/ProductByUserRQ';
import { Router } from '@angular/router';
import { CommonMethods } from '../../common-methods';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  productByUser = new ProductByUserRQ();
  productList = null;
  system = 0;
  epsList = JSON.parse(sessionStorage.getItem("epsKuntur"))
  codProducto = JSON.parse(localStorage.getItem("codProducto"))["productId"];
  //epsItem: any = JSON.parse(sessionStorage.getItem("eps"));
  epsItem: any = JSON.parse(localStorage.getItem("eps"));
  variable: any = {}
  lblProducto: string = "";
  lblFecha: string = "";

  constructor(private productService: ProductService,
    private router: Router
  ) { }

  async ngOnInit() {
    this.system = JSON.parse(localStorage.getItem("codProducto"))["productId"] == "1" ? 1 : 2;
    this.productList = JSON.parse(localStorage.getItem("productUser"))["res"];

    // Configuracion de las variables
    this.variable = await CommonMethods.configuracionVariables(this.codProducto, this.epsItem.NCODE)

    this.lblProducto = CommonMethods.tituloProducto(this.variable.var_nomProducto, this.epsItem.SNAME)
    this.lblFecha = CommonMethods.tituloPantalla()
  }

  goToPanel(item) {
    if (this.codProducto != item.NIDPRODUCT) {
      //sessionStorage.setItem('eps', JSON.stringify(this.epsList[0]));
      localStorage.setItem('eps', JSON.stringify(this.epsList[0]));
    }

    this.router.navigate([item.SSLUG], { queryParams: { id: item.NIDPRODUCT } });
  }

}
