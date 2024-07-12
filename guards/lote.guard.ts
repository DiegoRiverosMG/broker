import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';

@Injectable()
export class AuthGuardL implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const cu = JSON.parse(localStorage.getItem('currentUser'));
    if (cu.canal == 2018000011) {
      /* alert('No tienes permiso para ver esta página'); */
      this.router.navigate(['/extranet/commissionlot']);
      return false;
    }
    return true;
  }
}
