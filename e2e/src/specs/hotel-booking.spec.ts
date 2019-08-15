/**
 * © 2019 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 * 
 */

import { browser, element, ExpectedConditions, by } from 'protractor';
import { HotelBooking } from '../po/hotel-booking.po';

const hotelBooking = new HotelBooking();

describe('display hotel booking page', () => {
  it('should display the home page', async () => {
    await hotelBooking.navigateToHome();

    expect(await hotelBooking.getTitle()).toEqual('Relax Your Mind');
    //element(by.model('todoList.todoText')).sendKeys('write first protractor test');
    //element(by.css('[value="add"]')).click();

    //var todoList = element.all(by.repeater('todo in todoList.todos'));
    //expect(todoList.count()).toEqual(3);
    //expect(todoList.get(2).getText()).toEqual('write first protractor test');

    // You wrote your first test, cross it off the list
    //todoList.get(2).element(by.css('input')).click();
    //var completedAmount = element.all(by.css('.done-true'));
    //expect(completedAmount.count()).toEqual(2);
  });
});
