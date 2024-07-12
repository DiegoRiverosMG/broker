import { Directive, ElementRef, HostListener, Input,HostBinding,Inject,OnInit } from '@angular/core';
import { NgControl,AbstractControl } from '@angular/forms'
import {formatNumber} from '@angular/common'
import { LOCALE_ID } from '@angular/core';

@Directive({
  selector: '[decimal]'
})
export class DecimalDirective implements OnInit {
  
  @Input('decimal') set _(value){
    this.formato=value;
    const digits=value.split('-')[1]
    if (digits==0)
    this.regExpr=new RegExp("^([1-9]\\d*|0)$");
    else
      this.regExpr=new RegExp("^[+-]?([1-9]\\d*|0)?(\\.\\d\{0,"+digits+"\})?$");
  }
  
  private formato:string=null
  private _oldvalue: string = "";
  private regExpr: any;
  private el: HTMLInputElement;
  private control:AbstractControl;

  constructor(private elementRef: ElementRef,private ngcontrol:NgControl,@Inject(LOCALE_ID) private language) {
    this.el = this.elementRef.nativeElement;
    this.control=ngcontrol.control
  }
  @HostBinding('style.text-align') get="right"
  @HostListener('input', ['$event'])
  change($event) {

    let item = $event.target
    let value = item.value;
    let pos = item.selectionStart;
    let matchvalue = value;
    let noMatch: boolean = (value && !(this.regExpr.test(matchvalue)));
    if (noMatch) {
      item.selectionStart = item.selectionEnd = pos - 1;
      if (item.value.length < this._oldvalue.length && pos == 0)
        pos = 2;
      this.el.value=this._oldvalue;

      item.value = this._oldvalue;
      this.control.setValue(item.value)
      item.selectionStart = item.selectionEnd = pos - 1;
    }
    else
    {
      this._oldvalue = value;
    }
  }
  @HostListener("focus", ["$event.target.value"])
  onFocus() {
    if (this.formato)
    this.el.value = this._oldvalue;
  }

  @HostListener("blur", ["$event.target.value"])
  onBlur(value: any) {
    if (this.formato)
    this.transform(value);
  }
  ngOnInit() {
    setTimeout(()=>{
      this.transform(this.control.value);
  
    })
  }
  
  transform(value: any) {
    this._oldvalue = value;
    if (value && !isNaN(value)) {
      this.el.value=formatNumber(+this._oldvalue, this.language, this.formato);
      const formated=this.el.value.split(',').join('')
      if (formated.indexOf(this._oldvalue) >= 0) this._oldvalue = formated;
    }
  }
}