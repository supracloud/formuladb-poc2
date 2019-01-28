/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */




import * as _ from 'lodash';
import { diffObj } from './key_value_obj';


describe('key_value_obj', () => {
    beforeEach(() => {
    });

    it('should correctly diff and patch objects', () => {
        let diff = diffObj({
            _id: "1", a: 1, b: 2, c: {
                _id: '1.1',
                c1: [{ _id: '1.1.0'}, { _id: '1.1.1', c1prop: 123, c2prop: 'lhs only' }, { _id: '1.1.2', c1prop: 456 }, { _id: '1.1.3', c1prop: 789 }, { _id: '1.1.4', c1prop: 100 }]
            }
        }, {
                _id: "2", x: 'rhs-only', a: { a1: 1, a2: 2 }, b: ['2', '3'], c: {
                    _id: '1.1',
                    c1: [{ _id: '1.1.0'}, { _id: '1.1.1', c1prop: 123 }, { _id: '1.1.2', c1prop: 456, c1prop2: 'rhs only' }, { _id: '1.1.3', c1prop: { x: 1, y: 2 }, c1prop2: 'rhs only' }, { _id: '1.1.4', c1prop: ['x', 'y'] }]
                }
            });
        expect(diff).toEqual({
            "_id": {
                "lhs": "1",
                "rhs": "2"
            },
            "a": {
                "lhs": 1,
                "rhs": {
                    "a1": 1,
                    "a2": 2
                }
            },
            "b": {
                "lhs": 2,
                "rhs": [
                    "2",
                    "3"
                ]
            },
            "c": {
                "c1": [
                    {},
                    {
                        "c2prop": {
                            "lhs": "lhs only",
                            "rhs": null
                        }
                    },
                    {
                        "c1prop2": {
                            "lhs": null,
                            "rhs": "rhs only"
                        }
                    },
                    {
                        "c1prop": {
                            "lhs": 789,
                            "rhs": {
                                "x": 1,
                                "y": 2
                            }
                        },
                        "c1prop2": {
                            "lhs": null,
                            "rhs": "rhs only"
                        }
                    },
                    {
                        "c1prop": {
                            "lhs": 100,
                            "rhs": [
                                "x",
                                "y"
                            ]
                        }
                    }
                ]
            },
            "x": {
                "lhs": null,
                "rhs": "rhs-only"
            }
        });
    });
});
