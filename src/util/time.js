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
 * @package util
 * @module time
 * @requires base
 */

QQWB.extend("time", {
    /**
     * Get current time stamp in milliseconds
     *
     * @access public
     * @return {Date} current date
     */
    now: function () {

        return this.dateNow().getTime();

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

        return new Date();

    }

    /**
     * Get a short time description
	 *
     * @access public
     * @param date {Date} date or current date if date not provided
     * @param format {String} format of date object        
     * @return {String} formatted time string
     */
   ,shortTime: function (date, format) {

	    var tmp;

        if (!(date instanceof Date)) {

            format = date;

            date = this.dateNow();

        }

		return [

			date.getFullYear(),

			'/',

			date.getMonth(),

			'/',

			date.getDate(),

			' ',

			((tmp = date.getHours() ) && tmp < 10 ) ? "0" + tmp : tmp,

			':',

			((tmp = date.getMinutes() ) && tmp < 10 ) ? "0" + tmp : tmp,

			':',

			((tmp = date.getSeconds() ) && tmp < 10 ) ? "0" + tmp : tmp

		].join("");

    }

});

