import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-not-found',
  template:`
  <p>
  ERR: route/page not-found!
  </p>  
  `
})
export class NotFoundComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
