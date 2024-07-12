import { Component, OnInit } from '@angular/core';
import { String } from './constants/string';

@Component({
  selector: 'app-photocheck',
  templateUrl: './photocheck.component.html',
  styleUrls: ['./photocheck.component.sass'],
})
export class PhotocheckComponent implements OnInit {
  private promotorList: Array<any> = String.promotorList;
  currentPromotor: any = null;

  constructor() {}

  ngOnInit(): void {
    const idCurrentUser = +this.currentUser['id'];
    const findUser = this.promotorList.find((x) =>
      x.id.includes(idCurrentUser)
    );
    this.currentPromotor = findUser;
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
  }
}
