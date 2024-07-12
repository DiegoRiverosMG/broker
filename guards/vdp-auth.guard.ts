import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, CanActivate } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class VdpAuthGuard implements CanActivate {
  constructor(private readonly router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const roles: Array<any> = route.data['roles'] as Array<any>;

    const currentUser: any = JSON.parse(
      localStorage.getItem('currentUser') || '{}'
    );

    if (currentUser) {
      if (!roles.includes(+currentUser['profileId'])) {
        this.router.navigate(['/extranet/welcome']);
      }
    } else {
      this.router.navigate(['/extranet/login']);
    }
    return true;
  }
}
