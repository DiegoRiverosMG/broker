import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-back-step',
  templateUrl: './back-step.component.html',
  styleUrls: ['./back-step.component.css']
})
export class BackStepComponent implements OnInit {

  @Input() anterior: number;
  @Input() enlace = '';
  @Input() redirigir = false;
  constructor() { }

  ngOnInit() {
  }

}
