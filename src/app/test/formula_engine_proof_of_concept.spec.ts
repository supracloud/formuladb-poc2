import { cold, hot, getTestScheduler } from 'jasmine-marbles';
import 'rxjs/add/operator/zip';

fdescribe('Formula Engine PoC', () => {
    beforeEach(() => {
    });

    it('should zip by concatenating', function () {
        var e1 = hot('---a---b---|');

        var e2 = hot('-----c---d---|');
        var expected = '-----x---y---|';
        var values = { x: 'ac', y: 'bd' };

        var result = e1.zip(e2, function (x, y) { return String(x) + String(y); });

        expect(result).toBeObservable(expected, values);
    });
});
