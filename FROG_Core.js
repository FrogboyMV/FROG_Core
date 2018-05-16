//=============================================================================
// Frogboy RMMV Plugin
// FROG_Core.js
//=============================================================================

var Imported = Imported || {};
Imported.FROG_Core = true;

var FROG = FROG || {};
FROG.Core = FROG.Core || {};

/*:
 * @plugindesc v1.0 Core for FROG Plugins
 * @author Frogboy
 *
 * @help
 * Core for FROG Plugins
 * Author Frogboy
 *
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * This is simply some funtions I need for most of my other plugins.
 *
 * ============================================================================
 * How to Use
 * ============================================================================
 *
 * Just install it if you use any of my other plugins.
 *
 * ============================================================================
 * Terms of Use
 * ============================================================================
 *
 * This plugin can be used in commercial or non-commercial projects.
 * Credit Frogboy in your work
 *
 * ============================================================================
 * Changelog
 * ============================================================================
 *
 * Version 1.0 - Initial release
 *
 * ============================================================================
 */
(function() {
    // Global Default Variables
    FROG.Core.badGaugeStartColor = "#305080";
    FROG.Core.badGaugeEndColor = "#5080A0";

    /** Converts RPG Maker MV plugin parameters to an easy to use JSON object
     * @param {object} objRead - Plugin Parameters Parameters  (required)
     * @param {object} objWrite - Object that you want to store the converted parameters into (required)
     */
    FROG.Core.jsonParams = function (objRead, objWrite, level) {
        level = level || 1;
        if (level >= 100) return [];

        // Arrays
        if (Array.isArray(objRead)) {
            for (var i=0; i<objRead.length; i++) {
                var value = objRead[i];
                if (value !== "") {
                    if (!isNaN(value)) value = parseFloat(value);
                    else if (value == "true") value = true;
                    else if (value == "false") value = false;
                    else {
                        try {
                            value = JSON.parse(value);
                        }
                        catch (e) {
                            value = value;
                        }
                    }
                }

                if (typeof value != "object") {
                    objWrite.push(value);
                }
                else {
                    objWrite.push((Array.isArray(value)) ? [] : {})
                    FROG.Core.jsonParams(value, objWrite[objWrite.length - 1], level + 1);
                }
            }
        }
        else {
            // Objects
            Object.keys(objRead).forEach(function(key, index) {
                var value = objRead[key];
                if (value !== "") {
                    if (!isNaN(value)) value = parseFloat(value);
                    else if (value == "true") value = true;
                    else if (value == "false") value = false;
                    else {
                        try {
                            value = JSON.parse(value);
                        }
                        catch (e) {
                            value = value;
                        }
                    }
                }

                if (typeof value != "object") {
                    objWrite[makeKey(key)] = value;
                }
                else {
                    objWrite[makeKey(key)] = (Array.isArray(value)) ? [] : {};
                    FROG.Core.jsonParams(value, objWrite[makeKey(key)], level + 1);
                }
            });
        }

        function makeKey(param) {
            return param.slice(0, 1).toLowerCase() + param.slice(1).replace(/[^\w]/gi, "");
        }
    }

    /** Returns a random integer between the min and max
     * @param {number} min - Minimum integer
     * @param {number} max - Maximum integer
     * @returns {number} Randomly generated integer
     */
    FROG.Core.randomInt = function (min, max) {
        min = min || 0;
        max = max || 0;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /** Tests to see if object is empty
     * @param {object} object - An object to test (required)
     * @returns {boolean} Whether the object is empty or not
     */
    FROG.Core.isEmpty = function (object) {
        return (!object || (Object.keys(object).length === 0 && object.constructor === Object));
    }

    /** Extract meta proprty from an object's notebox (Typically weapons, armor, items and states)
     * @param {object} gameObj - Any game object that has <metaProp> meta data (required)
     * @param {string} metaProp - Name of the meta property to extract (required)
     * @param {string} abbr - The abbreviation used to identify the subset of the metaProp
     * @returns {number} Returns the bonus extracted from this obejct
     */
    FROG.Core.extractMetaBonus = function (gameObj, metaProp, abbr) {
        abbr = (abbr) ? abbr.toString().toLowerCase().trim() : "";
        metaProp = metaProp || "";
        var bonus = 0;

        if (gameObj && gameObj.meta && gameObj.meta[metaProp] && gameObj.meta[metaProp].indexOf(' ') > -1) {
            var bonusStr = gameObj.meta[metaProp].trim() + ',';
            for (var i=0; i<4; i++) bonusStr = bonusStr.replace('  ', ' ');
            var arrList = bonusStr.split(',');

            for (var i in arrList) {
                var token = arrList[i].trim();
                if (token && token.indexOf(' ') > -1) {
                    var arrToken = token.split(' ');
                    var token0 = (arrToken.length > 0) ? arrToken[0] : "";
                    var token1 = (arrToken.length > 1) ? arrToken[1] : "";

                    // Figure out which is the bonus and which is the abbr
                    if (!isNaN(token0)) {
                        var bonusVal = parseFloat(token0);
                        var bonusAbbr = token1.toLowerCase().trim();
                    }
                    else {
                        var bonusVal = parseFloat(token1);
                        var bonusAbbr = token0.toLowerCase().trim();
                    }

                    // Check for abbreviation
                    if (bonusAbbr) {
                        bonus += (bonusAbbr == abbr) ? bonusVal : 0;
                    }
                    // Just get bonus
                    else {
                        bonus += r_bonus;
                    }
                }
            }
        }

        return bonus;
    }

    /** Drill down into an object and return all values of given prop name as an array.
     * @param {object} object - Object to search through (required)
     * @param {string} prop - Property name to gether values for.
     * @param {number} level - This is just used to ensure that recusion ends (optional)
     * @returns {array} Returns array of all values for the given property
     */
    FROG.Core.getProp = function (object, prop, level) {
        level = level || 1;
        if (level >= 100) return [];
        var rArr = [];

        // Arrays
        if (Array.isArray(object)) {
            for (var i in object) {
                var value = object[i];
                if (typeof value == "object") {
                    rArr = rArr.concat(FROG.Core.getProp(value, prop, level + 1));
                }
            }
        }
        else {
            // Objects
            Object.keys(object).forEach(function(key, index) {
                var value = object[key];
                if (key == prop) {
                    rArr.push(object[key]);
                }
                else if (typeof value == "object") {
                    rArr = rArr.concat(FROG.Core.getProp(value, prop, level + 1));
                }
            });
        }
        return rArr;
    }

    /** Formats plugin parameters so that you can use variables in place of hard-coded values
     * @param {string} arg - A plugin parameter (required)
     * @returns {string} Returns the argument back but will convert any v[id] to the stored variable value
     */
    FROG.Core.formatArg = function (arg) {
        if (!arg) return "";
        if (arg && arg.substr(0, 2) == "v[") {
            var varId = parseInt(arg.replace("v[", "").replace("]", ""));
            if (!isNaN(varId)) {
                return $gameVariables.value(varId);
            }
        }
        return arg;
    }

    /** Randomizes the elements of an array
     * @param {array} array - An array (required)
     * @returns {array} Returns same array with the elements shuffled
     */
    FROG.Core.shuffleArray = function (array) {
        var cIndex = array.length;
        var rIndex;
        var temp;

        while (cIndex > 0) {
            rIndex = Math.floor(Math.random() * cIndex);
            cIndex -= 1;
            temp = array[cIndex];
            array[cIndex] = array[rIndex];
            array[rIndex] = temp;
        }

        return array;
    }

    /** Creates an object out of name:value paired Plugin Command arguments
     * @param {array} args - Plugin Command parameter args array
     * @returns {object} Assembles an object into the appropriate name/value pairs
     */
    Game_Interpreter.prototype.nameValueParams = function (args) {
        var options = {};
        for (var i=1; i<args.length; i++) {
            if (args[i].indexOf(':') > 0) {
                var prop = FROG.Core.formatArg(args[i].split(':')[0].toLowerCase());
                var val = FROG.Core.formatArg(args[i].split(':')[1]);
                options[prop] = val;
            }
        }
        return options;
    }
})();
