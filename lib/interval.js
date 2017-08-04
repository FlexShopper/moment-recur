'use strict';

// Interval object for creating and matching interval-based rules
const internals = module.exports = function buildInterval (/*moment*/) {
    return { 
        create: function createInterval (units, measure) {
            // Make sure all of the units are integers greater than 0.
            for (const unit in units) {
                if (units.hasOwnProperty(unit) && parseInt(unit, 10) <= 0) {
                    throw Error('Intervals must be greater than zero');
                }
            }
            
            return {
                measure: measure.toLowerCase(),
                units: units
            };
        }, 
        match: function matchInterval (type, units, start, date) {
            // Get the difference between the start date and the provided date,
            // using the required measure based on the type of rule'
            const getDiff = () => (date.isBefore(start)) ?
                start.diff(date, type, true) :
                date.diff(start, type, true) ;
                
            const diff = (type == 'days') ? parseInt(getDiff()) : getDiff();
            
            // Check to see if any of the units provided match the date
            for (let unit in units) {
                if (units.hasOwnProperty(unit)) {
                    unit = parseInt(unit, 10);
                    
                    // If the units divide evenly into the difference, we have a match
                    if ((diff % unit) === 0) {
                        return true;
                    }
                }
            }
            
            return false;
        } 
    };
};
