import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';
@Injectable()
export class FormModalService {
  // Observable string sources
  private gridsterFormFinishedRendering = new Subject<string>();
  private destroyForm = new Subject<string>();

  // Observable string streams
  gridsterFormFinishedRendering$ = this.gridsterFormFinishedRendering.asObservable();
  destroyForm$ = this.destroyForm.asObservable();

  // Service message commands
  sendGridsterFormFinishedRenderingEvent() {
    this.gridsterFormFinishedRendering.next();
  }
  sendDestroyFormEvent() {
    this.destroyForm.next();
  }
}
