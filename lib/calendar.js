'use strict';

// Calendar object for creating and matching calendar-based rules
const internals = module.exports = function buildCalendar (moment) {
    // Dictionary of unit types based on measures
    const unitTypes = {
        'daysOfMonth': 'date',
        'daysOfWeek': 'day',
        'weeksOfMonth': 'monthWeek',
        'weeksOfMonthByDay': 'monthWeekByDay',
        'weeksOfYear': 'week',
        'monthsOfYear': 'month'
    };

    // Dictionary of ranges based on measures
    const ranges = {
        'daysOfMonth': { low: 1, high: 31 },
        'daysOfWeek': { low: 0, high: 6 },
        'weeksOfMonth': { low: 0, high: 4 },
        'weeksOfMonthByDay': { low: 0, high: 4 },
        'weeksOfYear': { low: 0, high: 52 },
        'monthsOfYear': { low: 0, high: 11 }
    };

    

    return {
        create: function createCalendarRule (list, measure) {
            var keys = [];

            // Convert day/month names to numbers, if needed
            if (measure === 'daysOfWeek') {
                list = internals.namesToNumbers.call({ moment }, list, 'days');
            } else if (measure === 'monthsOfYear') {
                list = internals.namesToNumbers.call({ moment }, list, 'months');
            }

            for (const key in list) if (hasOwnProperty.call(list, key)) keys.push(key);

            // Make sure the listed units are in the measure's range
            internals.checkRange(ranges[measure].low, ranges[measure].high, keys); 

            return { measure, unit: list, units: list };
        },
        match: function matchCalendarRule (measure, list, date) {
            // Get the unit type (i.e. date, day, week, monthWeek, weeks, months)
            var unitType = unitTypes[measure];

            // Get the unit based on the required measure of the date
            var unit = date[unitType]();

            // If the unit is in our list, return true, else return false
            if (list[unit]) {
                return true;
            }

            // match on end of month days
            if (unitType === 'date' && unit == date.add(1, 'months').date(0).format('D') && unit < 31) {
                while (unit <= 31) {
                    if (list[unit]) {
                        return true;
                    }
                    unit++;
                }
            }

            return false;
        }
    };
};
// Private function for checking the range of calendar values
internals.checkRange = function checkRange (low, high, list) {
    list.forEach(function (v) {
        if (v < low || v > high) {
            throw Error('Value should be in range ' + low + ' to ' + high);
        }
    });
};


 // Private function to convert day and month names to numbers
internals.namesToNumbers = function namesToNumbers (list, nameType) {
     
    var newList = {};
     
    for (const unit in list) {
        if (list.hasOwnProperty(unit)) {
            const unitInt = (isNaN(parseInt(unit, 10))) ?
                 unit : parseInt(unit, 10);
                 
            const unitNum = this.moment().set(nameType, unitInt).get(nameType);
            newList[unitNum] = list[unit];
        }
    }
     
    return newList;
};
 
 
