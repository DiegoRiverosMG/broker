import { Component, OnInit } from '@angular/core';
import { Cliente } from '../../../broker/models/cliente/cliente';
import { Router } from '@angular/router';

@Component({
  selector: 'app-res-cupon',
  templateUrl: './res-cupon.component.html',
  styleUrls: ['./res-cupon.component.css'],
})
export class ResPagoEfectivoComponent implements OnInit {
  bLoading = false;
  bAprobado = true;
  cliente: Cliente;

  constructor(private router: Router) {}

  ngOnInit() {
    window.scrollTo(0, 0);
    this.initComponent();
  }

  initComponent() {
    sessionStorage.setItem('pagefrom', 'LastStepComponent');
    const clienteSesion = sessionStorage.getItem('contratante');

    if (clienteSesion !== null) {
      this.cliente = JSON.parse(clienteSesion);
    }
  }

  imprimir() {}

  limpiarSesion() {
    sessionStorage.removeItem('placa');
    sessionStorage.removeItem('auto');
    sessionStorage.removeItem('vigencia');
    sessionStorage.removeItem('contratante');
    sessionStorage.removeItem('certificado');
    sessionStorage.removeItem('plan');
    sessionStorage.removeItem('tarifa');
    sessionStorage.removeItem('kushki-payload');
  }

  IrPlaca(): void {
    this.limpiarSesion();
    sessionStorage.setItem('Modalidad', JSON.stringify({ tipoCertificado: 3 }));
    sessionStorage.removeItem('acept-terms-stepall');
    this.router.navigate(['broker/stepAll']);
  }
}
