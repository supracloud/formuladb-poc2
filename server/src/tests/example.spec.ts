import 'mocha';
import { expect } from 'chai';
import { marbles } from "rxjs-marbles";

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/find';

// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
// import 'mocha';
describe('Hello function', () => {
  it('should return hello world', () => {
    expect("Hello World!").to.equal('Hello World!');
  });

  it('marbles example',  marbles((m) => {
    const values = { A: 3, a: 9, c: 15, d: 20 };
    const source = m.hot('---A--a--c--d---|', values);
    const subs = '^        !       ';
    const expected = '---------(c|)    ';

    const predicate = function (x) { return x % 5 === 0; };

    m.expect((<any>source).find(predicate)).toBeObservable(expected, values);
    m.expect(source).toHaveSubscriptions(subs);
  }));

});
