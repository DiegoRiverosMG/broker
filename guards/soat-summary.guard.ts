import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SoatSummaryGuard implements CanActivate {
  constructor(private readonly router: Router) {}
  canActivate(): boolean {
    const session = sessionStorage.getItem('soat-summary-navigate');
    if (session) {
      return true;
    }
    this.router.navigate(['/extranet/stepAll']);
    return true;
  }
}
