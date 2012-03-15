/**
 * Tencent weibo javascript library
 *
 * Dynamic script loader
 *
 * @author michalliu
 * @version 1.0
 * @package compat
 * @module load
 * @requires base
 *           LAB
 *           
 */

(function (){

    var loader = window.$LAB,
        libFeed = {
            jquery: {
                aliases: {
                    "0": "1.6.2" // default loaded version
                   ,"1": "1.6.2"
                   ,"1.2": "1.2.6"
                   ,"1.3": "1.3.2"
                   ,"1.4": "1.4.4"
                   ,"1.5": "1.5.2"
                   ,"1.6": "1.6.2"
                }
               ,versions: {
                   compressed: {
                       "1.6.2": {
                           js: "jquery-1.6.2.min.js"
                          //,css:""
                          ,path: "jquery/1.6.2/"
                       }
                      ,"1.2.6": {
                          js: "jquery-1.2.6.min.js"
                         ,path: "jquery/1.2.6/"
                       }
                      ,"1.3.2": {
                          js: "jquery-1.3.2.min.js"
                         ,path: "jquery/1.3.2/"
                       }
                      ,"1.4.4": {
                          js: "jquery-1.4.4.min.js"
                         ,path: "jquery/1.4.4/"
                       }
                      ,"1.5.2": {
                          js: "jquery-1.5.2.min.js"
                         ,path: "jquery/1.5.2/"
                       }
                   }
                  ,uncompressed: {
                       "1.6.2": {
                           js: "jquery-1.6.2.js"
                          ,path: "jquery/1.6.2/"
                       }
                      ,"1.2.6": {
                          js: "jquery-1.2.6.js"
                         ,path: "jquery/1.2.6/"
                       }
                      ,"1.3.2": {
                          js: "jquery-1.3.2.js"
                         ,path: "jquery/1.3.2/"
                       }
                      ,"1.4.4": {
                          js: "jquery-1.4.4.js"
                         ,path: "jquery/1.4.4/"
                       }
                      ,"1.5.2": {
                          js: "jquery-1.5.2.js"
                         ,path: "jquery/1.5.2/"
                       }
                  }
               }
            }
           ,raphael: {
               aliases: {
                   "0": "1.5.2"
                  ,"1": "1.5.2"
                  ,"1.5": "1.5.2"
               }
              ,versions: {
                  compressed: {
                      "1.5.2": {
                          js: "raphael-min.js"
                         ,path: "raphael/1.5.2/"
                      }
                  }
                 ,uncompressed: {
                      "1.5.2": {
                          js: "raphael.js"
                         ,path: "raphael/1.5.2/"
                      }
                  }
               }
            }
    };

    loader.noConflict(); // rollback $LAB to its original value

    if (typeof window.$LAB === "undefined") { // if we introduce the $LAB variable then we don't need it anymore
        delete window.$LAB; // IE doesn't support delete
    }


    /**
     * Script loader
     *
     * Example Usage:
     *
     * 1). Load a library like jQuery
     *
     *     T.load("jquery") // load latest jquery
     *
     *     T.load("jquery","1.3") // load jquery version 1.3
     *
     *     T.load("jquery",callback) // load latest jquery if success callback is executed
     *
     *     T.load("jquery","1.3",callback) // load jquery version 1.3 if success then callback is executed
     *
     *     T.load("jquery","1.3","compressed",callback) // load jquery version 1.3 if success then callback is executed
     *
     *     T.load("jquery")
     *      .wait(callback) // same as above
     *
     * 2). Load script
     *
     *     T.load("http://path/to/your/script") // load a script
     *
     *     T.load("http://path/to/your/script",callback) // load a script if success then callback is executed
     *
     *     T.load("http://path/to/your/script")
     *      .load("http://path/to/your/another/script") // load two scripts parallelly regardless the execution order
     *
     * 3). Mixed
     *
     *     T.load("jquery")
     *      .wait()
     *      .load("http://path/to/your/script")
     *      .load("http://path/to/another/script") // load jquery first after jquery loaded then load other scripts
     * 
     * 4). Array like loading
     *
     *     T.load( ["jquery","1.3"]
     *            ,["myscripts",callback]
     *            ,["otherscript"] )
     *
     *     is equal to:
     *
     *     T.load("jquery","1.3")
     *      .load("myscript",callback)
     *      .load("otherscript")
     * 
     * Note:
     * Relative path support
     * If library name is not correct or not supported, will fallback to relative path load.
     * Like:
     *     T.load("juery"); // this library can't be found we will load http://yourdomain/juery instead
     *
     * More examples:
     * T.load("/your/script") // this will load http://yourdomain/your/script
     * T.load("your/script") // this will load http://yourdomain/currentpath/your/script
     *
     * More usage please refer to:
     * http://labjs.com/
     *
     * @access public
     * @param context {String}
     * @param version {String}
     * @param compress {String}
     * @param callback {Function}
     * @return {Object} QQWB
     * @throws {Error}
     */
    QQWB.provide("load", function (context, version, compress, callback) {
        var 
            script, // script path
            css, // css path due some library have css code
            lib, // temp lib
            http = /^https?:\/\//,
            absolute = /^\//;

        if (typeof version === "function") {
            callback = version;
            version = null;
        }

        if (typeof compress === "function") {
            callback = compress;
            compress = null;
        }
        
        compress = compress ? "compressed" : "uncompressed";

        if (http.exec(context)) { // load script from absolute url simplest situation
            script = context;
        } else if (absolute.exec(context)) { // absolute path 
            script = /^https?:\/\/[^\/]+/.exec(location.href)[0] + context;
        } else if (libFeed.hasOwnProperty(context)) { // load a lib
            if (version) { // request a specified version of library
                if (libFeed[context]["aliases"].hasOwnProperty(version)) { // maybe a aliased version name
                    version = libFeed[context]["aliases"][version]; // convert to full version name
                }
            } else {
                version = libFeed[context]["aliases"]["0"]; // use the latest library
            }

            lib = libFeed[context]["versions"][compress][version];
            if (lib) {
                script = this._domain.cdn + "jslibs" + "/" + context + "/" + version + "/" + lib.js;
                css = lib.css;
                //TODO:load css dynamiclly
            } else {
                throw new Error("Tencent weibo SDK: [ERROR] library " + lib + " not found or no such version");
            }
        } else { // does it really neccessary?
            script = location.href.replace(/[\?#].*$/,'').replace(/[^\/]+$/,'') + context; // the relative path
        }

        loader = callback ? loader.script(script).wait(callback) : loader.script(script);

        return this;
    });

    /**
     * Wait for previous script loaded then proceed
     *
     * @param callback {Function}
     * @access public
     * @return {Object} QQWB
     */
    QQWB.provide("wait", function (callback) {
        loader = callback ? loader.wait(callback) : loader.wait();
        return this;
    });
}());
