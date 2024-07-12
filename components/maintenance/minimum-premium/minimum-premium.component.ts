import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-minimum-premium',
  templateUrl: './minimum-premium.component.html',
  styleUrls: ['./minimum-premium.component.css']
})
export class MinimumPremiumComponent implements OnInit {
    monthlyAmount: number
    yearlyAmount: number
    quoteCreationAmount: number
    emissionAmount: number
    renewalAmount: number
    comment: string

    save() {
        let data: any = {}
        data.monthlyAmount = this.monthlyAmount
        data.yearlyAmount = this.yearlyAmount
        data.quoteCreationAmount = this.quoteCreationAmount
        data.emissionAmount = this.emissionAmount
        data.renewalAmount = this.renewalAmount
        data.comment = this.comment
        console.log('data', data)
    }

  constructor() { }

  ngOnInit(): void {
  }

}
