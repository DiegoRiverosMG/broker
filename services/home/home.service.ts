import { Injectable } from '@angular/core';

@Injectable()
export class HomeService {
  public token: string;

  constructor() {
    // Establecer token si se guarda en el almacenamiento local
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
  }



}
