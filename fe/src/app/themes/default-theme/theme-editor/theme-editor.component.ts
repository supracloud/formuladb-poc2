/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'frmdb-theme-editor',
  templateUrl: './theme-editor.component.html',
  styleUrls: ['./theme-editor.component.scss']
})
export class ThemeEditorComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  open() {
    // const modalRef = this.modalService.open(NgbdModalContent);
    // modalRef.componentInstance.name = 'World';
  }

  switchTheme(themeIdx: number) {
    this.router.navigate([this.router.url.replace(/\/\d+\//, '/' + themeIdx + '/')]);
  }
}
