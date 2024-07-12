import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-retrieve-miga-pan',
  templateUrl: './miga-pan.component.html',
  styleUrls: ['./miga-pan.component.css']
})
export class MigaPanComponent implements OnInit {
  @Input() step = 1;

  constructor() { }

  ngOnInit() { }
}
