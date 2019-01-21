import { Component, OnInit } from '@angular/core';
import { 
  faTruckLoading,
  faWarehouse,
  faCalendarAlt,
  faCalendarCheck,
  faMoneyCheck,
  faFileInvoiceDollar,
  faListOl,
  faBug,
  faClipboardList,
  faUsers,
  faCashRegister,
  faTools,
  faStore,
  faShoppingCart,
  faStoreAlt,
  faPlusCircle,
  faMinusCircle,
} 
from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'frmdb-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnInit {

  addIcon = faPlusCircle;
  delIcon = faMinusCircle;

  inventoryIcon1 = faTruckLoading;
  inventoryIcon2 = faWarehouse;
  bookingIcon1 = faCalendarAlt;
  bookingIcon2 = faCalendarCheck;
  basicExpenses1 = faMoneyCheck;
  basicExpenses2 = faFileInvoiceDollar;
  ticketing1 = faListOl;
  ticketing2 = faBug;
  planning1 = faClipboardList;
  planning2 = faUsers;
  eCommerce1 = faShoppingCart;
  eCommerce2 = faCashRegister;
  service1 = faTools;
  service2 = faStoreAlt;

  constructor() { }

  ngOnInit() {
  }

}
