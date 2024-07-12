import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-title-step',
  templateUrl: './title-step.component.html',
  styleUrls: ['./title-step.component.css']
})
export class TitleStepComponent implements OnInit {

  @Input() actual: number;
  @Input() anterior = true;
  @Input() titulo = '';
  @Input() url = '';
  @Input() redirigir = false;
  @Input() showempty = false;
  constructor() { }

  ngOnInit() {
  }

}
