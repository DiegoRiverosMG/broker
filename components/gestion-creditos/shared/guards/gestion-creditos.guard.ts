import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GestionCreditosGuard implements CanActivate {
  constructor(private readonly router: Router) {}
  canActivate(): boolean {
    const authorizedChannels = [2018000011, 2018000038];
    const channelCurrentUser = +JSON.parse(
      localStorage.getItem('currentUser') || '{}'
    )?.canal;

    if (!authorizedChannels.includes(channelCurrentUser)) {
      this.router.navigate(['/extranet/welcome']);
    }
    return true;
  }
}
