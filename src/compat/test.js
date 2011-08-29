/**
 * Tencent weibo javascript library
 *
 * Unit test framework
 *
 * @author michalliu
 * @version 1.0
 * @package compat
 * @module test
 * @requires base
 */

(function (){

    var 
        session, // test session
        start, // start time of call test.run()
        end, // end time of test.run()
        pool = {length:0}, // pool of all the tests removed from pool when test done
        result = [], // pool of the result of test
        id = 0; // test unique id auto increment

    /**
     * Add a test item to pool
     * 
     * @access private
     * @return {Number} the index in the pool
     */
    function poolAdd(procedure, expected, description) {
        pool[id++] = {
              "description": description || "No description"
             ,"procedure": procedure
             ,"expected": expected
        };
        pool.length++; // maintain the length property of pool
        return id - 1; // id of current test
    }

    /**
     * Run a test
     *
     * Test item will be marked as pass or fail then move from
     * test's pool to result's pool
     *
     * @access private
     * @param id {Number} the index in the test pool
     * @return {Number} the index in the result pool
     */
    function poolRun(id) {
        var 
            actual, // actual value
            expect, // expected value
            pass, // indicate test whether passed
            test = pool[id]; // the test object

        if (test) {
            try{
                actual = typeof test.procedure === "function" ? test.procedure() : test.procedure; // run test procedure
                expect = typeof test.expected === "function" ? test.expected() : test.expected; // run expect procedure
                pass = actual === expect;
                if (pass) {
                   test.pass = true;
               } else {
                   test.fail = {
                       "actual": actual
                      ,"expect": expect
                   };
               }
            } catch (e) {
                test.fail = {
                    "message": e.toString()
                };
            } finally {
                delete pool[id]; // remove from pool
                pool.length--; // maintain the length property of pool
                return result.push(test) - 1; // the index in the result array for current test item
            }
        }
        return -1; // id not valid
    }

    /**
     * Float to percentage string
     *
     * @access private
     * @param fraction {Number} float number
     * @return {String} percentage string
     */
    function percentage (fraction) {
        return !(fraction >= 0 && fraction <= 1) ? "Not available" : (fraction * 100 + "").substr(0,5) + "%";
    }

    /**
     * Statics constructor
     *
     * Self invoke constructor
     *
     * Note:
     * If data is passed in,it means the statics running in a session
     * Data contains *position* of result pool
     *
     * @access private
     * @param data {Array} partial result keys array or the result
     * @return {Statics} a statics instance
     */
    function Statics(data, session) {
        if (this instanceof Statics) {
            this.data = (data || result).slice(0); // clone array
            if (session) {
                this.session = { 
                    id: session.id
                   ,end: session.end
                   ,start: session.start
                };
            }
        } else {
            return new Statics(data, session);
        }
    }

    Statics.prototype = {
        /**
         * Get statics
         *
         * Currently only support text statics
         *
         * @access public
         * @param format {String} text,xml,json etc.
         * @return {Mixed} result statics
         */
        statics: function (format) {
            var 
                temp, // temp value
                report, // statics report
                passed = [], // passed tests pool
                failed = []; // failed tests pool

            format = format || "text"; // default report type is text

            for (var i=0,l=this.data.length; i<l; i++) {
                temp = this.data[i];
                if (typeof temp === "number") { // convert key to its value
                    temp = result[temp+""];
                }
                temp.pass && passed.push(temp);
                temp.fail && failed.push(temp);
            }

            if (format === "text") {
                report = [];
                report.push("***" + (this.session ? " Session(" + this.session.id +")":"") + " Test Report ***");
                report.push("  Cost: " + (this.session ? (this.session.end - this.session.start)/1000 : (end - start)/1000) + " seconds");
                report.push(" Total: " + this.data.length);
                report.push("Passed: " + passed.length);
                report.push("Failed: " + failed.length);
                report.push("Percet: " + percentage(passed.length/this.data.length));
                if (failed.length > 0) {
                    report.push("Detail:");
                    for (var i=0,l=failed.length; i<l; i++) {
                        temp = failed[i];
                        if (temp.fail.message) {
                            report.push( i + 1 + ")." + " >>>EXCEPTION THROWN<<< in test(" + temp.description + ") " + temp.fail.message);
                        } else {
                            report.push( i + 1 + ")." + " >>>VALUE NOT MATCH<<< in test(" + temp.description + ") " + " expected " + temp.fail.expect + " actual " + temp.fail.actual);
                        }
                    }
                }
                return report.join("\n");
            }
        } 
    };

    /**
     * Start a new test session
     *
     * @access private
     * @return {Void}
     */
    function session_start() {
     // if checked T.test.add(...); T.test.add(...); will be treated as one session till run is called
     // if (!session) {
            session = new Session();
            session.start = + new Date;
     // }
    }

    /**
     * End current session
     *
     * @access private
     * @return {Void}
     */
    function session_end() {
        session && (session.end = + new Date);
    }

    /**
     * Destory current session
     *
     * @access private
     * @return {Void}
     */
    function session_destory() {
        session = null;
    }

    /**
     * Session constructor
     *
     * @access private
     * @return {Session} session instance
     */
    function Session() {
        this.id = QQWB.uid(); // random session id
        this.idPool = []; // contains id of test
    }

    Session.prototype = {
        /**
         * Add test id to session
         *
         * @access private
         * @param id {Number} test id
         * @return {Void}
         */
        _addId: function (id) {
            this.idPool.push(id);
        }

        /**
         * Add test item to session
         *
         * Note:
         * Test item added to global pool
         * Session just store the position of test in the pool
         *
         * Example usage:
         * T.test
         *       .add(...) //add a test to session(and pool)
         *       .add(...) //add a test to session(and pool)
         *       ...
         *
         *
         * @access public
         * @param procedure {Mixed} the procedure to finish this test
         *                          if procedure is a function it will
         *                          be executed automaticlly
         * @param expected {Mixed}  the expected value of this test
         *                          if expected is a function it will
         *                          be executed automaticlly
         * @param description {String} speak more about this test
         * @return {Session} the current session     
         */
       ,add: function (procedure, expected, description) {
            this._addId(poolAdd(procedure, expected, description));
            return this;
        }

        /**
         * Run the tests in current session
         *
         * Example usage:
         * T.test
         *       .add(...) //add a test to session(and pool)
         *       .add(...) //add a test to session(and pool)
         *       ...
         *       .run() // run the test in this session
         *       .statics() // get statics for this session
         *
         * @access public
         * @return {Statics} statics object
         */
       ,run: function () { // run in session
            var temp,
                statics,
                results = [];
            for (var i=0,l=this.idPool.length; i<l; i++) {
                temp = poolRun(this.idPool[i]);
                temp && results.push(temp);
            }
            session_end(); // record the time of this session end
            statics = Statics(results,session);
            session_destory();// destory test session
            return statics;
        }
    };

    QQWB.extend("test",{

        /**
         * Add test item to session
         *
         * Note:
         * Test item added to global pool
         * Current session will store the position of test in the pool
         *
         * Example usage:
         * T.test
         *       .add(...) //add a test to session(and pool)
         *       .add(...) //add a test to session(and pool)
         *       ...
         *
         * @access public
         * @param procedure {Mixed} the procedure to finish this test
         *                          if procedure is a function it will
         *                          be executed automaticlly
         * @param expected {Mixed}  the expected value of this test
         *                          if expected is a function it will
         *                          be executed automaticlly
         * @param description {String} speak more about this test
         * @return {Session} the current session     
         */
        add: function (procedure, expected, description) {
            session_start(); // spawn a new session object
            session._addId(poolAdd(procedure, expected, description));
            return session;
        }

        /**
         * Run all the tests except the test already done
         *
         * Example usage:
         * T.test
         *       .add(...) //add a test to session(and pool)
         *       .add(...) //add a test to session(and pool)
         *       ...
         *
         * T.test
         *       .run() // run all the tests except already done
         *       .statics() //get full statics of all the tests
         *
         * @access public
         * @return {Statics} statics object
         */
       ,run: function () {
           session_destory(); // destory current session
           start = + new Date; // start time of global test
           for (var id in pool) {
               if (id !== 'length' && pool.hasOwnProperty(id)) {
                   poolRun(id);
               }
           }
           end = + new Date; // end time of global test
           return Statics();
       }
       /**
        * Get count of tests left in the pool
        * 
        * @access public
        * @return {Number} count of tests unfinished yet
        */
       ,remains: function () {
           return pool.length;
       }

    });

})();
