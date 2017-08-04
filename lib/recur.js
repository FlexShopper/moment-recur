'use strict';

// The main Recur object to provide an interface for settings, rules, and matching
const internals = module.exports = function buildRecur (moment, Interval, Calendar) {

    // A dictionary used to match rule measures to rule types
    const ruleTypes = {
        'days': 'interval',
        'weeks': 'interval',
        'months': 'interval',
        'years': 'interval',
        'daysOfWeek': 'calendar',
        'daysOfMonth': 'calendar',
        'weeksOfMonth': 'calendar',
        'weeksOfMonthByDay': 'calendar',
        'weeksOfYear': 'calendar',
        'monthsOfYear': 'calendar'
    };

    // a dictionary of plural and singular measures
    const measures = {
        'days': 'day',
        'weeks': 'week',
        'months': 'month',
        'years': 'year',
        'daysOfWeek': 'dayOfWeek',
        'daysOfMonth': 'dayOfMonth',
        'weeksOfMonth': 'weekOfMonth',
        'weeksOfMonthByDay': 'weekOfMonthByDay',
        'weeksOfYear': 'weekOfYear',
        'monthsOfYear': 'monthOfYear'
    };


    /////////////////////////////////
    // Private Methods             //
    // Must be called with .call() //
    /////////////////////////////////

    // Private method that tries to set a rule.
    function trigger () {
        var rule;
        var ruleType = ruleTypes[this.measure];

        if (!(this instanceof Recur)) {
            throw Error('Private method trigger() was called directly or not called as instance of Recur!');
        }

        // Make sure units and measure is defined and not null
        if ((typeof this.units === 'undefined' || this.units === null) || !this.measure) {
            return this;
        }

        // Error if we don't have a valid ruleType
        if (ruleType !== 'calendar' && ruleType !== 'interval') {
            throw Error('Invalid measure provided: ' + this.measure);
        }

        // Create the rule
        if (ruleType === 'interval') {
            if (!this.start) {
                throw Error('Must have a start date set to set an interval!');
            }

            rule = Interval.create(this.units, this.measure);
        }

        if (ruleType === 'calendar') {
            rule = Calendar.create(this.units, this.measure);
        }

        // Remove the temporary rule data
        this.units = null;
        this.measure = null;

        if (rule.measure === 'weeksOfMonthByDay' && !this.hasRule('daysOfWeek')) {
            throw Error('weeksOfMonthByDay must be combined with daysOfWeek');
        }

        // Remove existing rule based on measure
        for (let i = 0; i < this.rules.length; i++) {
            if (this.rules[i].measure === rule.measure) {
                this.rules.splice(i, 1);
            }
        }

        this.rules.push(rule);
        return this;
    }

    // Private method to get next, previous or all occurrences
    function getOccurrences (num, format, type) {
        var currentDate, date;
        var dates = [];

        if (!(this instanceof Recur)) {
            throw Error('Private method trigger() was called directly or not called as instance of Recur!');
        }

        if (!this.start && !this.from) {
            throw Error('Cannot get occurrences without start or from date.');
        }

        if (type === 'all' && !this.end) {
            throw Error('Cannot get all occurrences without an end date.');
        }

        if (!!this.end && (this.start > this.end)) {
            throw Error('Start date cannot be later than end date.');
        }

        // Return empty set if the caller doesn't want any for next/prev
        if (type !== 'all' && !(num > 0)) {
            return dates;
        }

        // Start from the from date, or the start date if from is not set.
        currentDate = (this.from || this.start).clone();

        // Include the initial date in the results if wanting all dates
        if (type === 'all') {
            if (this.matches(currentDate, false)) {
                date = format ? currentDate.format(format) : currentDate.clone();
                dates.push(date);
            }
        }

        // Get the next N dates, if num is null then infinite
        while (dates.length < (num === null ? dates.length + 1 : num)) {
            if (type === 'next' || type === 'all') {
                currentDate.add(1, 'day');
            } else {
                currentDate.subtract(1, 'day');
            }

            //console.log("Match: " + currentDate.format("L") + " - " + this.matches(currentDate, true));

            // Don't match outside the date if generating all dates within start/end
            if (this.matches(currentDate, (type === 'all' ? false : true))) {
                date = format ? currentDate.format(format) : currentDate.clone();
                dates.push(date);
            }
            if (currentDate >= this.end) {
                break;
            }
        }

        return dates;
    }


    ///////////////////////
    // Private Functions //
    ///////////////////////

    // Private function to see if a date is within range of start/end
    function inRange (start, end, date) {
        if (start && date.isBefore(start)) { return false; }
        if (end && date.isAfter(end)) { return false; }
        return true;
    }

    // Private function to turn units into objects
    function unitsToObject (units) {
        var list = {};

        if (Object.prototype.toString.call(units) == '[object Array]') {
            units.forEach(function (v) {
                list[v] = true;
            });
        } else if (units === Object(units)) {
            list = units;
        } else if ((Object.prototype.toString.call(units) == '[object Number]') || 
            (Object.prototype.toString.call(units) == '[object String]')) {
            list[units] = true;
        } else {
            const msg = 'Provide an array, object, string or number when passing units!';
            throw Error(msg);
        }

        return list;
    }

    // Private function to check if a date is an exception
    function isException (exceptions, date) {
        for (let i = 0, len = exceptions.length; i < len; i++) {
            if (moment(exceptions[i], acceptedFormats).isSame(date)) {
                return true;
            }
        }
        return false;
    }

    // Private function to pluralize measure names for use with dictionaries.
    function pluralize (measure) {
        const pluralizedMapping = {
            day: 'days',
            week: 'weeks',
            month: 'months',
            year: 'years',
            dayOfWeek: 'daysOfWeek',
            dayOfMonth: 'daysOfMonth',
            weekOfMonth: 'weeksOfMonth',
            weekOfMonthByDay: 'weeksOfMonthByDay',
            weekOfYear: 'weeksOfYear',
            monthOfYear: 'monthsOfYear'    
        };
        
        return (measure in pluralizedMapping) ?
            pluralizedMapping[measure] :
            measure;
    }
    
    const buildInitializer = (thisProp) => function (date) {
        if (date === null) {
            this[thisProp] = null;
            return this;
        }

        if (date) {
            if (moment.isMoment(date)){
                this[thisProp] = date.dateOnly();    
            } else if (typeof date === 'string'){
                this[thisProp] = moment(date, [
                    'MM/DD/YYYY',
                    'MM-DD-YYYY',
                    'YYYY-MM-DD'
                ]).dateOnly();    
            } else {
                this[thisProp] = moment(date).dateOnly();    
            }
            
            return this;
        }

        return this[thisProp];
    };


    // Private funtion to see if all rules match
    function matchAllRules (rules, date, start) {
        var i, len, rule, type;

        for (i = 0, len = rules.length; i < len; i++) {
            rule = rules[i];
            type = ruleTypes[rule.measure];

            if (type === 'interval') {
                if (!Interval.match(rule.measure, rule.units, start, date)) {
                    return false;
                }
            } else if (type === 'calendar') {
                if (!Calendar.match(rule.measure, rule.units, date)) {
                    return false;
                }
            } else {
                return false;
            }
        }

        return true;
    }

    // Private function to create measure functions
    const createMeasure = (measure) => function (units) {
        this.every.call(this, units, measure);
        return this;
    };
    

    const acceptedFormats = [
        'MM/DD/YYYY',
        'MM-DD-YYYY',
        'YYYY-MM-DD'
    ];

    //////////////////////
    // Public Functions //
    //////////////////////
    class Recur {
        constructor (options) {
            if (options.start) {
                this.start = moment(options.start, acceptedFormats)
                .dateOnly();
            }

            if (options.end) {
                this.end = moment(options.end, acceptedFormats).dateOnly();
            }

            // Our list of rules, all of which must match
            this.rules = options.rules || [];

            // Our list of exceptions. Match always fails on these dates.
            const exceptions = options.exceptions || [];
            this.exceptions = [];

            for (let i = 0; i < exceptions.length; i++) {
                this.except(exceptions[i]);
            }

            // Temporary units integer, array, or object. Does not get imported/exported.
            this.units = null;

            // Temporary measure type. Does not get imported/exported.
            this.measure = null;

            // Temporary from date for next/previous. Does not get imported/exported.
            this.from = null;

            return this;
        }
        // Export the settings, rules, and exceptions of this recurring date
        save () {
            const data = { exceptions: [], rules: this.rules };
            
            if (this.start && moment(this.start).isValid()) {
                data.start = this.start.format('L');
            }
            
            if (this.end && moment(this.end).isValid()) {
                data.end = this.end.format('L');
            }
            
            for (let i = 0, len = this.exceptions.length; i < len; i++) {
                data.exceptions.push(this.exceptions[i].format('L'));
            }
            
            return data;
        }
        repeats () {
            if (this.rules.length > 0) {
                return true;
            }
            
            return false;
        }
        
        // Set the units and, optionally, the measure
        every (units, measure) {
            if ((typeof units !== 'undefined') && (units !== null)) {
                this.units = unitsToObject(units);
            }
            
            if ((typeof measure !== 'undefined') && (measure !== null)) {
                this.measure = pluralize(measure);
            }
            
            return trigger.call(this);
        }
        
        
        // Creates an exception date to prevent matches, even if rules match
        except (date) {
            date = moment(date, acceptedFormats).dateOnly();
            this.exceptions.push(date);
            return this;
        }
        
        // Forgets rules (by passing measure) and exceptions (by passing date)
        forget (dateOrRule) {
            var i, len;
            
            var whatMoment = (typeof dateOrRule === 'string') ? 
                moment(dateOrRule, ['MM/DD/YYYY', 'YYYY-MM-DD', 'MM-DD-YYYY']) :
                dateOrRule;
            
            // If valid date, try to remove it from exceptions
            if (whatMoment.isValid()) {
                whatMoment = whatMoment.dateOnly(); // change to date only for perfect comparison
                for (i = 0, len = this.exceptions.length; i < len; i++) {
                    if (whatMoment.isSame(this.exceptions[i])) {
                        this.exceptions.splice(i, 1);
                        return this;
                    }
                }
                
                return this;
            }
            
            // Otherwise, try to remove it from the rules
            for (i = 0, len = this.rules.length; i < len; i++) {
                if (this.rules[i].measure === pluralize(dateOrRule)) {
                    this.rules.splice(i, 1);
                }
            }
        }
        
        // Checks if a rule has been set on the chain
        hasRule (measure) {
            var i, len;
            for (i = 0, len = this.rules.length; i < len; i++) {
                if (this.rules[i].measure === pluralize(measure)) {
                    return true;
                }
            }
            return false;
        }
        
        // Attempts to match a date to the rules
        matches (dateToMatch, ignoreStartEnd) {
            const date = (typeof dateToMatch === 'string') ?
                moment(dateToMatch, acceptedFormats).dateOnly() : 
                moment(dateToMatch).set({
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    milliseconds: 0
                })
                .add(dateToMatch.utcOffset(), 'minute')
                .utcOffset(0);
            
            if (!date.isValid()) {
                throw Error('Invalid date supplied to match method: ' + dateToMatch);
            }
            
            return (
                !ignoreStartEnd && !inRange(this.start, this.end, date) ||
                isException(this.exceptions, date) ||
                !matchAllRules(this.rules, date, this.start)
            ) ? false : true;
        }
        
        // Get next N occurrences
        next (num, format) {
            return getOccurrences.call(this, num, format, 'next');
        }
        
        // Get previous N occurrences
        previous (num, format) {
            return getOccurrences.call(this, num, format, 'previous');
        }
        
        // Get all occurrences between start and end date
        all (format) {
            return getOccurrences.call(this, null, format, 'all');
        }
        
    }



    // Get/Set start date
    Recur.prototype.startDate = buildInitializer('start');
    
    // Get/Set end date
    Recur.prototype.endDate = buildInitializer('end');
    
    // Get/Set `from` date
    Recur.prototype.fromDate = buildInitializer('from');

    // Create the measure functions (days(), months(), daysOfMonth(), monthsOfYear(), etc.)
    for (const measure in measures) {
        Recur.prototype[measure] = Recur.prototype[measures[measure]] = createMeasure(measure);
    }

    return Recur;
};
