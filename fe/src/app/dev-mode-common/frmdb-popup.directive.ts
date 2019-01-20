import { OnInit, Directive, HostBinding, OnDestroy, HostListener } from '@angular/core';

@Directive({
  selector: '[frmdb-popup]',
  host: {
    '[draggable]': 'true',
  }
})
// <div ="true" [style.transform]="'translate3d('+x+'px,'+y+'px,0px)'" (mousedown)="dragStartHandle($event)"

export class FrmdbPopupDirective implements OnInit, OnDestroy {

  @HostBinding('style.transform')
  styleTransform(): string {
    return 'translate3d(' + this.x + 'px,' + this.y + 'px,0px)';
  }

  x = 200;
  y = 200;
  deltaX = 0;
  deltaY = 0;
  dragged = false;

  @HostListener('mousedown', ['$event']) onmousedown($event) {
    this.dragStartHandle($event)
  }

  ngOnInit() {

    document.body.addEventListener('dragover', e => {
      e.preventDefault();
      return false;
    });
    document.body.addEventListener("pointermove", e => {
      this.dragHandle(e);
    });
    document.body.addEventListener("mouseup", e => {
      this.dragEndHandle(e);
    });

  }

  ngOnDestroy(): void {
    //TODO remove event handlers
  }

  dragStartHandle(e: any) {
    this.deltaX = e.clientX - this.x;
    this.deltaY = e.clientY - this.y;
    this.dragged = true;
  }

  dragHandle(e: any) {
    if (this.dragged) {
      this.x = e.clientX - this.deltaX;
      this.y = e.clientY - this.deltaY;
    }
  }

  dragEndHandle(e: any) {
    this.dragged = false;

  }

}
