/**
 * Tencent weibo javascript library
 *
 * Sizzle CSS selector engine with chained ablity
 * http://sizzlejs.com/
 *
 * @author michalliu
 * @version 1.0
 * @package compat
 * @module find
 * @requires base
 *           sizzle
 *           
 */

(function (){

    var $ = window.Sizzle;

    $.noConflict(); // rollback Sizzle to its original value

    if (typeof window.Sizzle === "undefined") { // if we introduce the Sizzle variable then we don't need it anymore 
        delete window.Sizzle; // IE doesn't support delete
    }

    /**
     * Continues to find nodes in results
     *
     * Note:
     * find("div > a") and find("div").find("a") is totally different
     * 1) The first rule means give me the node which
     *    1. nodeName is A
     *    2. its parent node nodename is div 
     * 2) The second rule means give me the node which
     *    1. nodeName is A
     *    2. (regardless its parentnode)it is wrapped by div
     *
     * @access private
     * @return {Array} the *modified* results
     */
    function find (selector) {
        var tempArr;
        if (toString.call(this) !== "[object Array]") {
            return this;
        }
        tempArr = [];
        for (var i=0,l=this.length; i<l; i++) {
            tempArr = tempArr.concat($(selector,this[i]));
        }
        return tempArr;
    }

    /**
     * Filter nodes contains the specific text
     *
     * @access private
     * @return {Array} the filtered results
     */
    function contains (text) {
        if (typeof text !== 'string') {
            return this;
        }
        if (text.length <= 0) {
            return this;
        }
        return $.matches(":contains(" + text + ")",this);
    }

    /**
     * Keep the node that match with the selector and remove the others
     *
     * @access private
     * @return {Array} the *modified* results
     */
    function keep (selector) {
        return $.matches(selector,this);
    }

    /**
     * Teardown the node that don't match with the selector and keep the others
     *
     * @access private
     * @return {Array} the *modified* results
     */
    function tear (selector) {
        return $.matches(":not(" + selector + ")",this);
    }

    /**
     * A beautiful way to enumerate the nodes
     *
     * @access private
     * @return {Array} the *same* nodes
     */
    function each (func) {
        if (!toString.call(this) === "[object Array]" || !func) {
            return this;
        }
        for (var i=0,l=this.length; i<l; i++) {
            if(func(this[i]) === false) {
                break;
            }
        }
        return this;
    }

    /**
     * Add chainability to Sizzle
     *
     * @access private
     * @return {Array} the *same* nodes
     */
    function create_chain(nodes) {
        !nodes.find && 
        (nodes.find = function (selector) {
            return create_chain(find.call(nodes,selector));
        });

        !nodes.contains && 
        (nodes.contains = function (text) {
            return create_chain(contains.call(nodes,text));
        });

        !nodes.keep &&
        (nodes.keep = function (selector) {
            return create_chain(keep.call(nodes,selector));
        });

        !nodes.tear &&
        (nodes.tear = function (selector) {
            return create_chain(tear.call(nodes,selector));
        });

        !nodes.each &&
        (nodes.each = function (func) {
            return each.call(nodes,func); // source object is not modified
        });

        return nodes;
    }

    // expose
    QQWB.provide('find', function (selector, context) {
        return create_chain($(selector, context));
    });

}());
