'use strict';

const buildRecur = require('./lib/recur');
const buildInterval = require('./lib/interval');
const buildCalendar = require('./lib/calendar');


const internals = module.exports = function (moment) {

    if (typeof moment === 'undefined') {
        throw Error('Can\'t find moment');
    }

    const Interval = buildInterval(moment);

    // Calendar object for creating and matching calendar-based rules
    const Calendar = buildCalendar(moment);

    // The main Recur object to provide an interface for settings, rules, and matching
    const Recur = buildRecur(moment, Interval, Calendar);

    // Recur can be created the following ways:
    // moment.recur()
    // moment.recur(options)
    // moment.recur(start)
    // moment.recur(start, end)
    moment.recur = function (start, end) {
        // If we have an object, use it as a set of options
        if (start === Object(start) && !moment.isMoment(start)) {
            return new Recur(start);
        }

        // else, use the values passed
        return new Recur({ start: start, end: end });
    };

    // Recur can also be created the following ways:
    // moment().recur()
    // moment().recur(options)
    // moment().recur(start, end)
    // moment(start).recur(end)
    // moment().recur(end)
    moment.fn.recur = function (start, end) {
        // If we have an object, use it as a set of options
        if (start === Object(start) && !moment.isMoment(start)) {
            // if we have no start date, use the moment
            if (typeof start.start === 'undefined') {
                start.start = this;
            }

            return new Recur(start);
        }

        // if there is no end value, use the start value as the end
        if (!end) {
            end = start;
            start = undefined;
        }

        // use the moment for the start value
        if (!start) {
            start = this;
        }

        return new Recur({ start: start, end: end, moment: this });
    };

    // Plugin for calculating the week of the month of a date
    moment.fn.monthWeek = function () {
        // First day of the first week of the month
        var week0 = this.clone().startOf('month').startOf('week');

        // First day of week
        var day0 = this.clone().startOf('week');

        return day0.diff(week0, 'weeks');
    };

    // Plugin for calculating the occurrence of the day of the week in the month.
    // Similar to `moment().monthWeek()`, the return value is zero-indexed.
    // A return value of 2 means the date is the 3rd occurence of that day
    // of the week in the month.
    moment.fn.monthWeekByDay = function () {
        return Math.floor((this.date() - 1) / 7);
    };

    // Plugin for removing all time information from a given date
    moment.fn.dateOnly = function () {
        // If moment-timezone is being used
        if (this.tz && typeof (moment.tz) === 'function') {
            return moment.tz(this.format('YYYY-MM-DD[T]00:00:00Z'), 'UTC');
        } 
        
        // Return date w/ hours, minutes, seconds, milliseconds set to zero.
        // offset minutes are added and then set to zero such that specifying
        // dates like '01/01/2000', doesn't result in '12/31/1999' as start date
        return this.set({
            hours: 0,
            minutes: 0,
            seconds: 0,
            milliseconds: 0
        })
        .add(this.utcOffset(), 'minute')
        .utcOffset(0);
    };

    return moment;
};
