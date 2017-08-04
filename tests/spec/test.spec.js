'use strict';

// Getting rid of jshint warnings (the yellow lines and exclaimation points are annoying)
// var jasmine = jasmine, describe = describe, it = it, moment = moment, expect = expect, beforeEach = beforeEach;
const { expect } = require('chai');
const moment = require('../../')(require('moment'));
const startDate = '01/01/2013';
const endDate = '01/01/2014';

describe('Creating a recurring moment', () => {

    var nowMoment = moment();
    var nowDate = nowMoment.format('L');


    it('from moment constructor, with options parameter - moment.recur(options)', (done) => {
        const recur = moment.recur({ start:startDate, end:endDate });
        expect(recur.start.format('L')).equal(startDate);
        expect(recur.end.format('L')).equal(endDate);
        return done();
    });

    it('from moment constructor, with start parameter only - moment.recur(start)', (done) => {
        const recur = moment.recur(startDate);
        expect(recur.start.format('L')).equal(startDate);
        return done();
    });

    it('from moment constructor, with start and end parameters - moment.recur(start, end)', (done) => {
        const recur = moment.recur(startDate, endDate);
        expect(recur.start.format('L')).equal(startDate);
        expect(recur.end.format('L')).equal(endDate);
        return done();
    });

    it('from moment function, with options parameter - moment().recur(options)', () => {
        const recur = moment().recur({ start:startDate, end:endDate });
        expect(recur.start.format('L')).equal(startDate);
        expect(recur.end.format('L')).equal(endDate);
    });

    it('from moment function, with start and end parameters - moment().recur(start, end)', () => {
        const recur = moment().recur(startDate, endDate);
        expect(recur.start.format('L')).equal(startDate);
        expect(recur.end.format('L')).equal(endDate);
    });

    it('from moment function, with starting moment and end parameter - moment(start).recur(end)', () => {
        const recur = moment(startDate, ['MM-DD-YYYY']).recur(endDate);
        expect(recur.start.format('L')).equal(startDate);
        expect(recur.end.format('L')).equal(endDate);
    });

    it('from moment function, starting now, with end parameter  - moment().recur(end)', () => {
        const recur = nowMoment.recur(endDate);
        expect(recur.start.format('L')).equal(nowDate);
        expect(recur.end.format('L')).equal(endDate);
    });

    it('from moment function, starting now - moment().recur()', () => {
        const recur = nowMoment.recur();
        expect(recur.start.format('L')).equal(nowDate);
    });

    it(`from moment function, with starting moment and end parameter, which is 
            a moment object - moment(start).recur(end)`, () => {
        var startMoment = moment(startDate, ['MM-DD-YYYY']);
        var endMoment = moment(endDate, ['MM-DD-YYYY']);
        const recur = moment(startMoment, ['MM-DD-YYYY']).recur(endMoment);
        expect(recur.start.format('L')).equal(startDate);
        expect(recur.end.format('L')).equal(endDate);
    });
});

describe('Setting', () => {
    let recur;

    beforeEach(() => {
        recur = moment().recur();
    });

    it('\'start\' should be getable/setable with startDate()', () => {
        recur.startDate(startDate);
        expect(recur.startDate().format('L')).equal(startDate);
    });

    it('\'end\' should be getable/setable with endDate()', () => {
        recur.endDate(endDate);
        expect(recur.endDate().format('L')).equal(endDate);
    });

    it('\'from\' should be getable/setable with fromDate()', () => {
        recur.fromDate(startDate);
        expect(recur.fromDate().format('L')).equal(startDate);
    });
});

describe('The every() function', () => {
    it('should create a rule when a unit and measurement is passed', () => {
        const recurrence = moment().recur().every(1, 'day');
        expect(recurrence.save().rules.length).equal(1);
    });

    it('should not create a rule when only a unit is passed', () => {
        const recurrence = moment().recur().every(1);
        expect(recurrence.save().rules.length).equal(0);
    });

    it('should set the temporary units property', () => {
        const recurrence = moment().recur().every(1);
        expect(recurrence.units).not.equal(null);
    });

    it('should accept an array', () => {
        const recurrence = moment().recur().every([1, 2]);
        expect(recurrence.units).not.equal(null);
    });
});

describe('An interval', () => {
    it('should not match a date before the start date', () => {
        var start = moment(startDate, ['MM-DD-YYYY']);
        var before = start.clone().subtract(1, 'day');
        const recurrence = start.recur();
        recurrence.every(1, 'day');
        expect(recurrence.matches(before)).equal(false);
    });

    it('should not match a date after the end date', () => {
        var start = moment(startDate, ['MM-DD-YYYY']);
        var after = moment(endDate, ['MM-DD-YYYY']).add(1, 'day');
        const recurrence = start.recur();
        recurrence.endDate(endDate).every(1, 'day');
        expect(recurrence.matches(after)).equal(false);
    });

    it('can be daily', () => {
        const recurrence = moment(startDate, ['MM-DD-YYYY']).recur().every(2).days();
        expect(recurrence.matches( moment(startDate, ['MM-DD-YYYY']).add(2, 'days') )).equal(true);
        expect(recurrence.matches( moment(startDate, ['MM-DD-YYYY']).add(3, 'days') )).equal(false);
    });

    it('can be weekly', () => {
        const recurrence = moment(startDate, ['MM-DD-YYYY']).recur().every(2).weeks();
        expect(recurrence.matches( moment(startDate, ['MM-DD-YYYY']).add(2, 'weeks') )).equal(true);
        expect(recurrence.matches( moment(startDate, ['MM-DD-YYYY']).add(2, 'days')  )).equal(false);
        expect(recurrence.matches( moment(startDate, ['MM-DD-YYYY']).add(3, 'weeks') )).equal(false);
    });

    it('can be monthly', () => {
        const recurrence = moment(startDate, ['MM-DD-YYYY']).recur().every(3).months();
        expect(recurrence.matches( moment(startDate, ['MM-DD-YYYY']).add(3, 'months') )).equal(true);
        expect(recurrence.matches( moment(startDate, ['MM-DD-YYYY']).add(2, 'months') )).equal(false);
        expect(recurrence.matches( moment(startDate, ['MM-DD-YYYY']).add(2, 'days'))).equal(false);
    });

    it('can be yearly', () => {
        const recurrence = moment(startDate, ['MM-DD-YYYY']).recur().every(2).years();
        expect(recurrence.matches( moment(startDate, ['MM-DD-YYYY']).add(2, 'year') )).equal(true);
        expect(recurrence.matches( moment(startDate, ['MM-DD-YYYY']).add(3, 'year') )).equal(false);
        expect(recurrence.matches( moment(startDate, ['MM-DD-YYYY']).add(2, 'days')  )).equal(false);
    });

    it('can be an array of intervals', () => {
        const recurrence = moment(startDate, ['MM-DD-YYYY']).recur().every([3,5]).days();
        expect(recurrence.matches( moment(startDate, ['MM-DD-YYYY']).add(3, 'days'))).equal(true);
        expect(recurrence.matches( moment(startDate, ['MM-DD-YYYY']).add(5, 'days'))).equal(true);
        expect(recurrence.matches( moment(startDate, ['MM-DD-YYYY']).add(10, 'days'))).equal(true);
        expect(recurrence.matches( moment(startDate, ['MM-DD-YYYY']).add(4, 'days'))).equal(false);
        expect(recurrence.matches( moment(startDate, ['MM-DD-YYYY']).add(8, 'days'))).equal(false);
    });
});

describe('The Calendar Interval', () => {

    describe('daysOfWeek', () => {
        it('should work', () => {
            const recurrence = moment.recur().every(['Sunday', 1]).daysOfWeek();
            expect(recurrence.matches(moment().day('Sunday'))).equal(true);
            expect(recurrence.matches(moment().day(1))).equal(true);
            expect(recurrence.matches(moment().day(3))).equal(false);
        });

        // it("should work with timezones", () => {
        // const recurrence = moment.tz('2015-01-25',"America/Vancouver").recur().every(["Sunday", 1]).daysOfWeek();
        //     var check = moment.tz('2015-02-01',"Asia/Hong_Kong");
        //     expect(recurrence.matches(check)).equal(true);
        // });
    });

    it('daysOfMonth should work', () => {
        const recurrence = moment('2015-01-01', ['YYYY-MM-DD'])
            .recur().every([1, 10]).daysOfMonth();
        expect(recurrence.matches( moment('2015-01-01', ['YYYY-MM-DD']))).equal(true);
        expect(recurrence.matches( moment('2015-01-02', ['YYYY-MM-DD']))).equal(false);
        expect(recurrence.matches( moment('2015-01-10', ['YYYY-MM-DD']))).equal(true);
        expect(recurrence.matches( moment('2015-01-15', ['YYYY-MM-DD']))).equal(false);
        expect(recurrence.matches( moment('2015-02-01', ['YYYY-MM-DD']))).equal(true);
        expect(recurrence.matches( moment('2015-02-02', ['YYYY-MM-DD']))).equal(false);
        expect(recurrence.matches( moment('2015-02-10', ['YYYY-MM-DD']))).equal(true);
        expect(recurrence.matches( moment('2015-02-15', ['YYYY-MM-DD']))).equal(false);
    });

    it('weeksOfMonth should work', () => {
        const recurrence = moment.recur().every([1, 3]).weeksOfMonth();
        expect(recurrence.matches( moment(startDate, ['MM-DD-YYYY']).date(6) )).equal(true);
        expect(recurrence.matches( moment(startDate, ['MM-DD-YYYY']).date(26) )).equal(true);
        expect(recurrence.matches( moment(startDate, ['MM-DD-YYYY']).date(27) )).equal(false);
    });

    it('weeksOfYear should work', () => {
        const recurrence = moment.recur().every(20).weekOfYear();
        expect(recurrence.matches( moment('05/14/2014', ['MM-DD-YYYY']) )).equal(true);
        expect(recurrence.matches( moment(startDate, ['MM-DD-YYYY']) )).equal(false);
    });

    it('rules can be combined', () => {
        var valentines = moment.recur().every(14).daysOfMonth()
                                       .every('Februray').monthsOfYear();
        expect(valentines.matches( moment('02/14/2014', ['MM/DD/YYYY']) )).equal(true);
        expect(valentines.matches( moment(startDate, ['MM/DD/YYYY']) )).equal(false);
    });

    it('can be passed units, without every()', () => {
        const recurrence = moment.recur().daysOfMonth([1,3]);
        expect(recurrence.matches('01/01/2014')).equal(true);
        expect(recurrence.matches('01/03/2014')).equal(true);
        expect(recurrence.matches(moment('01/03/2014', ['MM/DD/YYYY']))).equal(true);
        expect(recurrence.matches('01/06/2014')).equal(false);
        expect(recurrence.matches(moment('01/04/2014', ['MM/DD/YYYY']))).equal(false);
    });
});

describe('Rules', () => {
    it('should be overridden when duplicated', () => {
        const recurrence = moment('01/01/2014', ['MM/DD/YYYY']).recur().every(1).day();
        recurrence.every(2).days();
        expect(recurrence.rules.length).equal(1);
    });

    it('should be forgettable', () => {
        const recurrence = moment('01/01/2014', ['MM/DD/YYYY']).recur().every(1).day();
        recurrence.forget('days');
        expect(recurrence.rules.length).equal(0);
    });

    it('should be possible to see if one exists', () => {
        const recurrence = moment('01/01/2014', ['MM/DD/YYYY']).recur().every(1).day();
        expect(recurrence.hasRule('days')).equal(true);
        expect(recurrence.hasRule('months')).equal(false);
    });
});

describe('weeksOfMonthByDay()', () => {
    it('can recur on the 1st and 3rd Sundays of the month', () => {
        const recurrence = moment.recur()
            .every(['Sunday']).daysOfWeek()
            .every([0, 2]).weeksOfMonthByDay();
        expect(recurrence.matches(moment(startDate, ['MM-DD-YYYY']))).equal(false);
        expect(recurrence.matches(moment(startDate, ['MM-DD-YYYY']).date(6))).equal(true);
        expect(recurrence.matches(moment(startDate, ['MM-DD-YYYY']).date(8))).equal(false);
        expect(recurrence.matches(moment(startDate, ['MM-DD-YYYY']).date(13))).equal(false);
        expect(recurrence.matches(moment(startDate, ['MM-DD-YYYY']).date(20))).equal(true);
        expect(recurrence.matches(moment(startDate, ['MM-DD-YYYY']).date(27))).equal(false);
    });

    it('can recur on the 2nd, 4th and 5th Sundays and Thursdays of the month', () => {
        const recurrence = moment.recur()
            .every(['Sunday', 'Thursday']).daysOfWeek()
            .every([1, 3, 4]).weeksOfMonthByDay();
        expect(recurrence.matches(moment(startDate, ['MM-DD-YYYY']).date(6))).equal(false);
        expect(recurrence.matches(moment(startDate, ['MM-DD-YYYY']).date(13))).equal(true);
        expect(recurrence.matches(moment(startDate, ['MM-DD-YYYY']).date(20))).equal(false);
        expect(recurrence.matches(moment(startDate, ['MM-DD-YYYY']).date(27))).equal(true);
        expect(recurrence.matches(moment(startDate, ['MM-DD-YYYY']).date(3))).equal(false);
        expect(recurrence.matches(moment(startDate, ['MM-DD-YYYY']).date(10))).equal(true);
        expect(recurrence.matches(moment(startDate, ['MM-DD-YYYY']).date(17))).equal(false);
        expect(recurrence.matches(moment(startDate, ['MM-DD-YYYY']).date(24))).equal(true);
        expect(recurrence.matches(moment(startDate, ['MM-DD-YYYY']).date(31))).equal(true);
    });

    it('can recur on the 4th Wednesday of the month', () => {
        const recurrence = moment.recur()
            .every(moment('2017-09-27').day()).daysOfWeek()
            .every(moment('2017-09-27').monthWeekByDay()).weeksOfMonthByDay();

        expect(recurrence.matches(moment('2017-09-27'))).equal(true);
        expect(recurrence.matches(moment('2017-10-25'))).equal(true);
        expect(recurrence.matches(moment('2017-11-22'))).equal(true);
        expect(recurrence.matches(moment('2017-12-27'))).equal(true);

    });

    it('will throw an error if used without daysOfWeek()', () => {
        try {
            const recurrence = moment.recur().every(0).weeksOfMonthByDay();
        } catch (e) {
            expect(e.message).equal('weeksOfMonthByDay must be combined with daysOfWeek');
        }
    });
});

describe('Future Dates', () => {
    it('can be generated', () => {
        const recurrence = moment('01/01/2014', ['MM/DD/YYYY']).recur().every(2).days();
        const nextDates = recurrence.next(3, 'L');
        expect(nextDates.length).equal(3);
        expect(nextDates[0]).equal('01/03/2014');
        expect(nextDates[1]).equal('01/05/2014');
        expect(nextDates[2]).equal('01/07/2014');
    });

    it('can start from a temporary \'from\' date', () => {
        const recurrence = moment('01/01/2014', ['MM/DD/YYYY']).recur().every(2).days()
            .fromDate('02/05/2014');
        const nextDates = recurrence.next(3, 'L');
        expect(nextDates.length).equal(3);
        expect(nextDates[0]).equal('02/06/2014');
        expect(nextDates[1]).equal('02/08/2014');
        expect(nextDates[2]).equal('02/10/2014');
    });
});

describe('Previous Dates', () => {
    it('can be generated', () => {
        const recurrence = moment('01/01/2014', ['MM/DD/YYYY']).recur().every(2).days();
        const nextDates = recurrence.previous(3, 'L');
        expect(nextDates.length).equal(3);
        expect(nextDates[0]).equal('12/30/2013');
        expect(nextDates[1]).equal('12/28/2013');
        expect(nextDates[2]).equal('12/26/2013');
    });
});

describe('All Dates', () => {
    it('can be generated', () => {
        const recurrence = moment('01/01/2014', ['MM/DD/YYYY']).recur('01/07/2014').every(2).days();
        const allDates = recurrence.all('L');
        expect(allDates.length).equal(4);
        expect(allDates[0]).equal('01/01/2014');
        expect(allDates[1]).equal('01/03/2014');
        expect(allDates[2]).equal('01/05/2014');
        expect(allDates[3]).equal('01/07/2014');
    });

    it('can start from a temporary \'from\' date', () => {
        const recurrence = moment().recur('01/01/2014', '01/08/2014').every(2).days();
        recurrence.fromDate('01/05/2014');
        const allDates = recurrence.all('L');
        expect(allDates.length).equal(2);
        expect(allDates[0]).equal('01/05/2014');
        expect(allDates[1]).equal('01/07/2014');
    });

    it('should throw error if start date is after end date', function (done) {
        const recurrence = moment().recur('07/26/2017', '08/01/2013').every(2).days();
        try {
            recurrence.all('L');
        } catch (err){
            expect(err.message).to.include('Start date cannot be later than end date.');
            return done();
        }
    });

    it('should only generate a single date when start date and end date are the same', () => {
        const recurrence = moment().recur('01/01/2014', '01/01/2014').every(1).days();
        const allDates = recurrence.all('L');
        expect(allDates.length).equal(1);
        expect(allDates[0]).equal('01/01/2014');
    });
});

describe('Exceptions', () => {
    var mo, exception, recur, exceptionWithTz;

    beforeEach(() => {
        mo = moment(startDate, ['MM-DD-YYYY']);
        exception = mo.clone().add(3, 'day').utcOffset(-300);
        recur = mo.clone().recur().every(1, 'days');
        exceptionWithTz = moment().utcOffset(exception.format('YYYY-MM-DD'));
    });

    it('should prevent exception days from matching', () => {
        recur.except(exception);
        expect(recur.matches(exception)).equal(false);
    });

    it.skip('should work when the passed in exception is in a different time zone', () => {
        recur.except(exception);
        expect(recur.matches(exceptionWithTz)).equal(false);
    });

    it('should be removeable', () => {
        recur.except(exception);
        recur.forget(exception);
        expect(recur.matches(exception)).equal(true);
    });
});

describe('Exceptions with weeks', () => {
    var mo, exception, recur, exceptionWithTz;

    beforeEach(() => {
        mo = moment(startDate, ['MM-DD-YYYY']);
        exception = mo.clone().add(7, 'day');
        recur = mo.clone().recur().every(1, 'weeks');
        // exceptionWithTz = moment.tz(exception.format('YYYY-MM-DD'), 'Asia/Hong_Kong');
    });

    it('should not match on the exception day', () => {
        expect(recur.matches(exception)).equal(true);
        recur.except(exception);
        expect(recur.matches(exception)).equal(false);
    });

    it.skip('should not match on the exception day', () => {
        expect(recur.matches(exceptionWithTz)).equal(true);
        recur.except(exception);
        expect(recur.matches(exceptionWithTz)).equal(false);
    });
});

describe('Options', () => {
    it('should be importable', () => {
        const recurrence = moment().recur({
            start: '01/01/2014',
            end: '12/31/2014',
            rules: [
                { units: {  2 : true }, measure: 'days' }
            ],
            exceptions: ['01/05/2014']
        });

        expect(recurrence.startDate().format('L')).equal('01/01/2014');
        expect(recurrence.endDate().format('L')).equal('12/31/2014');
        expect(recurrence.rules.length).equal(1);
        expect(recurrence.exceptions.length).equal(1);
        expect(recurrence.matches('01/03/2014')).equal(true);
        expect(recurrence.matches('01/05/2014')).equal(false);
    });

    it('shold be exportable', () => {
        const recurrence = moment('01/01/2014', ['MM/DD/YYYY'])
            .recur('12/31/2014')
            .every(2, 'days')
            .except('01/05/2014');
        var data = recurrence.save();
        expect(data.start).equal('01/01/2014');
        expect(data.end).equal('12/31/2014');
        expect(data.exceptions[0]).equal('01/05/2014');
        expect(data.rules[0].units[2]).equal(true);
        expect(data.rules[0].measure).equal('days');
    });
});

describe('The repeats() function', () => {
    it('should return true when there are rules set', () => {
        const recurrence = moment().recur().every(1).days();
        expect(recurrence.repeats()).equal(true);
    });

    it('should return false when there are no rules set', () => {
        const recurrence = moment().recur();
        expect(recurrence.repeats()).equal(false);
    });
});
