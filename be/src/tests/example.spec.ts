/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */


// 
import { marbles } from "rxjs-marbles";

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/find';
import { Subject } from "rxjs/Subject";
import { withLatestFrom, startWith } from 'rxjs/operators'

// if you used the '@types/mocha' method to install mocha type definitions, un-comment the following line

describe('example specs', () => {
  it('withLatestFrom', async (done) => {
    let s1: Subject<string> = new Subject();
    let s2: Subject<string|null> = new Subject();
    s1.pipe(withLatestFrom(s2.pipe(startWith(null)))).subscribe(([x1, x2]) => {
      console.log(x1, x2);
      done();
    });
    s1.next("1");
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
