import { Injectable } from '@angular/core';

import { CommonMethods } from '../../../../common-methods';

@Injectable()
export class StorageService {

  get productId() {
    return JSON.parse(localStorage.getItem('codProducto'))['productId'];
  }

  get accPerbranchId() {
    return JSON.parse(localStorage.getItem('accPerID'))['nbranch'];
  }

  get user() {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  get userId() {
    return this.user['id'];
  }

  get eps() {
    //return JSON.parse(sessionStorage.getItem('eps'));
    return JSON.parse(localStorage.getItem('eps'));
  }

  get epsCode() {
    return this.eps['NCODE'];
  }

  get template(): any {
    return CommonMethods.configuracionTemplate(this.productId, this.epsCode);
  }

  get variable(): any {
    return CommonMethods.configuracionVariables(this.productId, this.epsCode);
  }

  get esPerfilExterno() {
    return String(this.user['profileId']) === String(this.variable.var_prefilExterno);
  }

  get esBroker() {
    return String(this.user['profileId']) === String(this.variable.var_prefilExterno);
  }

}
