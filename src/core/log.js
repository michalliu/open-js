/**
 * Tencent weibo javascript library
 *
 * Log messages
 *
 * Example:
 * 
 * T.log.info("your message")
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module log
 * @requires base
 *           time
 *           format.sprintf
 */

QQWB.extend("log", {
	
	 // critical level
     CRITICAL: 50

	 // error level
    ,ERROR: 40

	 // warning level
    ,WARNING: 30

	 // infomation level
    ,INFO: 20

	 // debug level
    ,DEBUG: 10

	 // notset level, will log out all the messages
    ,NOTSET: 0

	// log level messages less than this level will be ingored
	// default level set to QQWB.log.NOTSET
    ,_level: 0 

	// log message format
    //,_format:"{{name}} : [{{levelname}}] {{time}} {{message}}"

	// log message format
    ,_format:"%(source)s%(popup)s%(frame)s%(name)s: [%(levelname)s] %(time)s %(message)s"

	/**
	 * Set log message level
	 * 
	 * @access public
	 * @param level {Number} log level
	 * @return {Object} log object
	 */
    ,setLevel: function (level) {
        this._level = level;
        return this;
     }

	/**
	 * Set log message format
	 * 
	 * @access public
	 * @param format {String} log format
	 * @return {Object} log object
	 */
    ,setFormat: function (format) {
        this._format = format;
		return this;
     }

	/**
	 * Log a debug message
	 * 
	 * @access public
	 * @param message {String} message
	 * @return {Object} log object
	 */
    ,debug: function (message) {
        this.DEBUG >= this._level && this._out("DEBUG",message);
        return this;
     }

	/**
	 * Log a info message
	 * 
	 * @access public
	 * @param message {String} message
	 * @return {Object} log object
	 */
    ,info: function (message) {
        this.INFO >= this._level && this._out("INFO",message);
        return this;
     }

	/**
	 * Log a warning message
	 * 
	 * @access public
	 * @param message {String} message
	 * @return {Object} log object
	 */
    ,warning: function (message) {
        this.WARNING >= this._level && this._out("WARNING",message);
        return this;
     }

	/**
	 * Log a error message
	 * 
	 * @access public
	 * @param message {String} message
	 * @return {Object} log object
	 */
    ,error: function (message) {
        this.ERROR >= this._level && this._out("ERROR",message);
        return this;
     }

	/**
	 * Log a critical message
	 * 
	 * @access public
	 * @param message {String} message
	 * @return {Object} log object
	 */
    ,critical: function (message) {
        this.CRITICAL >= this._level && this._out("CRITICAL",message);
        return this;
     }

	/**
	 * Log out message
	 *
	 * @access private
	 * @param level {String} message level
	 *        message {String} message to log out
	 * @return {Void}
	 */
    ,_out: function (level,message) {
        var output = this._format;
        //output = output.replace("{{time}}", this._getTime())
                       //.replace("{{levelname}}", level)
                       //.replace("{{name}}", QQWB._name)
                       //.replace("{{message}}", message);
        //output = output.replace(/\{\{.*?\}\}/g,output);
        output = QQWB.format.sprintf(output,{
            name: QQWB._name
           ,levelname: level
           ,time: QQWB.time.shortTime()
           ,message: message
           ,frame: window != window.parent ? "*":""
		   ,source: window.name ? window.name : ""
		   ,popup: (window.opener || window.name === QQWB._const.AUTH_WINDOW_NAME) ? "#":""
        });

        // capture message
        if (this._capture && typeof this._captureLevel == "number" && this[level] > this._captureLevel && this._capturedMessages) {
            if (this._capturedMessages.length >= this._captureMaxSize) {
                this._capturedMessages.shift();
            }
            this._capturedMessages.push(output);
        }

        // no frame messages
        QQWB._debug && window.console && window.console.log(output);
     }

	/**
	 * Start capture log
	 *
	 * @access public
	 * @param optLevel {String} message level
	 * @param optMaxSize {Number} the max size of captured message
	 * @return {Object} log object
	 */
    ,startCapture: function (optLevel, optMaxSize) {
         this._captureLevel = optLevel || this.NOTSET; // set level of messages to capture
         this._captureMaxSize = optMaxSize || 50; // max keeping 50 messages
         this._capturedMessages = []; // store captured messages
         this._capture = true; // flag know capturing messages or not
         return this;
     }

	/**
	 * Stop capture log
	 *
	 * @access public
	 * @return {Object} log object
	 */
    ,stopCapture: function () {
        if (this._capture) {
            this._capture = false;
        }
        return this;
     }

	/**
	 * Retrieve the last captured messages
	 *
	 * @access public
     * @param {sep} the seprator
	 * @return {Object} log object
	 */
    ,lastCaptured: function (sep) {
        sep = sep || "\n";
        return this._capturedMessages ? this._capturedMessages.join(sep) : "";
     }
});

