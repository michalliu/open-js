/**
 * Tencent weibo javascript library
 *
 * Time
 *
 * Example:
 * 
 * T.time.getTime()
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module time
 * @requires base
 *           format.sprintf
 */

QQWB.extend("time", {
    /**
     * Get current time stamp in milliseconds
     *
     * @access public
     * @return {Date} current date
     */
    now: function () {
        return +this.dateNow();
    }
    /**
     * Get current time stamp in seconds
     *
     * @access public
     * @return {Date} current date
     */
   ,secondsNow: function () {
        return Math.round(this.now() / 1000);
    }
    /**
     * Get current time stamp
     *
     * @access public
     * @return {Date} current date
     */
    ,dateNow: function () {
        return new Date;
    }
    /**
     * Get a short time description
     * 
     * Example:
     * 
     * T.time.shortTime(); // output is 08:04:34
     * T.time.shortTime(new Date()); // output date
     * T.time.shortTime(new Date(),"%(year)s"); // output date with format
     * T.time.shortTime("%(year)s"); // output current date with format
     *
     * @access public
     * @param date {Date} date or current date if date not provided
     *        format {String} format of date object        
     * @return {String} formatted time string
     */
   ,shortTime: function (date, format) {
        if (!(date instanceof Date)) {
            format = date;
            date = this.dateNow();
        }
        format = format || "%(year)s/%(month)s/%(day)s %(hour)02d:%(minute)02d:%(second)02d";
        return QQWB.format.sprintf(format,{
            year: date.getFullYear()
           ,month: date.getMonth()
           ,day: date.getDate()
           ,hour: date.getHours()
           ,minute: date.getMinutes()
           ,second: date.getSeconds()
        });
    }
});

