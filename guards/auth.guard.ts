import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { GlobalEventsManager } from '../../../shared/services/gobal-events-manager';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private router: Router,
        private globalEventsManager: GlobalEventsManager) { }

    canActivate(route: ActivatedRouteSnapshot) {
        const cu = JSON.parse(localStorage.getItem('currentUser'));
        if (cu) {
            if (
                route.data.roles &&
                route.data.roles.indexOf(cu.profileId) === -1
            ) {
                this.router.navigate(['/extranet/salepanel']);
                return false;
            }
            return true;
        }
        this.router.navigate(['/extranet/login']);
        return false;
    }
}
