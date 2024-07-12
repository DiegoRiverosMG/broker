import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';

@Injectable()
export class AuthGuardC implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const cu = JSON.parse(localStorage.getItem('currentUser'));
    if (cu.profileId != 150 && cu.profileId != 151 && cu.profileId != 20) {
      /* alert('No tienes permiso para ver esta página'); */
      this.router.navigate(['/extranet/welcome']);
      return false;
    }
    return true;
  }
}
