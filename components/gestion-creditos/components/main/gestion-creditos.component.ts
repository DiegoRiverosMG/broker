import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { EmisionService } from '../../../../../client/shared/services/emision.service';
import { EventStrings } from '../../../../shared/events/events';
import { LineaCreditoGeneralService } from '../../shared/services/linea-credito-general.service';

@Component({
  selector: 'app-creditos',
  moduleId: module.id,
  templateUrl: 'gestion-creditos.component.html',
  styleUrls: ['gestion-creditos.component.sass'],
})
export class GestorCreditosComponent implements OnInit {
  constructor(
    public readonly datePipe: DatePipe,
    private readonly emissionService: EmisionService,
    private readonly lineaCreditoGeneralService: LineaCreditoGeneralService
  ) {}

  ngOnInit() {
    this.getStatusAuthorized();

    this.emissionService
      .registrarEvento('', EventStrings.GESTORCREDITOS_INGRESAR)
      .subscribe();
  }

  export() {
    this.emissionService
      .registrarEvento('', EventStrings.GESTORCREDITOS_EXPORTAR)
      .subscribe();
  }

  getStatusAuthorized(): void {
    const user = +this.currentUser.id;

    this.lineaCreditoGeneralService.getAuthorized(user).subscribe({
      next: (response: any) => {
        if (response.success) {
          localStorage.setItem(
            'creditUser',
            JSON.stringify({
              id: user,
              autorizado: response.autorizar,
            })
          );
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
  }
}
