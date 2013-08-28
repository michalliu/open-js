/* See license.txt for terms of usage */

FBL.ns(function() { with (FBL) {
// ************************************************************************************************


// ************************************************************************************************
// Console

var ConsoleAPI = 
{
    firebuglite: Firebug.version,
    
    xxx: function(o)
    {
        var rep = Firebug.getRep(o);
        var className = "";
        
        var panel = Firebug.DOM.getPanel();
        var toggles = {};
        
        var row = Firebug.Console.getPanel().panelNode.ownerDocument.createElement("div");
        var target = row;
        var object = o;
        
        row.className = "logRow" + (className ? " logRow-"+className : "");
        //row.innerHTML = message.join("");
        
        rep.tag.replace({domPanel: panel, toggles: toggles, object: object}, target);
        
        Firebug.Console.appendRow(row);
    },

    log: function()
    {
        return Firebug.Console.logFormatted(arguments, "");
    },
    
    debug: function()
    {
        return Firebug.Console.logFormatted(arguments, "debug");
    },
    
    info: function()
    {
        return Firebug.Console.logFormatted(arguments, "info");
    },
    
    warn: function()
    {
        return Firebug.Console.logFormatted(arguments, "warning");
    },
    
    error: function()
    {
        return Firebug.Console.logFormatted(arguments, "error");
    },
    
    assert: function(truth, message)
    {
        if (!truth)
        {
            var args = [];
            for (var i = 1; i < arguments.length; ++i)
                args.push(arguments[i]);
            
            Firebug.Console.logFormatted(args.length ? args : ["Assertion Failure"], "error");
            throw message ? message : "Assertion Failure";
        }
        
        return Firebug.Console.LOG_COMMAND;        
    },
    
    dir: function(object)
    {
        var html = [];
                    
        var pairs = [];
        for (var name in object)
        {
            try
            {
                pairs.push([name, object[name]]);
            }
            catch (exc)
            {
            }
        }
        
        pairs.sort(function(a, b) { return a[0] < b[0] ? -1 : 1; });
        
        html.push('<div class="log-object">');
        for (var i = 0; i < pairs.length; ++i)
        {
            var name = pairs[i][0], value = pairs[i][1];
            
            html.push('<div class="property">', 
                '<div class="propertyValueCell"><span class="propertyValue">');
                
            Firebug.Reps.appendObject(value, html);
            
            html.push('</span></div><div class="propertyNameCell"><span class="propertyName">',
                escapeHTML(name), '</span></div>'); 
            
            html.push('</div>');
        }
        html.push('</div>');
        
        return Firebug.Console.logRow(html, "dir");
    },
    
    dirxml: function(node)
    {
        var html = [];
        
        Firebug.Reps.appendNode(node, html);
        
        return Firebug.Console.logRow(html, "dirxml");
    },
    
    group: function()
    {
        return Firebug.Console.logRow(arguments, "group", Firebug.Console.pushGroup);
    },
    
    groupEnd: function()
    {
        return Firebug.Console.logRow(arguments, "", Firebug.Console.popGroup);
    },
    
    time: function(name)
    {
        Firebug.Console.timeMap[name] = new Date().getTime();
        
        return Firebug.Console.LOG_COMMAND;
    },
    
    timeEnd: function(name)
    {
        var timeMap = Firebug.Console.timeMap;
        
        if (name in timeMap)
        {
            var delta = new Date().getTime() - timeMap[name];
            Firebug.Console.logFormatted([name+ ":", delta+"ms"]);
            delete timeMap[name];
        }
        
        return Firebug.Console.LOG_COMMAND;
    },
    
    count: function()
    {
        return this.warn(["count() not supported."]);
    },
    
    trace: function()
    {
        var getFuncName = function getFuncName (f)
        {
            if (f.getName instanceof Function)
                return f.getName();
            if (f.name) // in FireFox, Function objects have a name property...
                return f.name;
            
            var name = f.toString().match(/function\s*([_$\w\d]*)/)[1];
            return name || "anonymous";
        };
        
        var wasVisited = function(fn)
        {
            for (var i=0, l=stack.length; i<l; i++)
            {
                if (stack[i] == fn)
                    return true;
            }
            
            return false;
        };
    
        var stack = [];
        
        var traceLabel = "Stack Trace";
        
        this.group(traceLabel);
        
        for (var fn = arguments.callee.caller; fn; fn = fn.caller)
        {
            if (wasVisited(fn)) break;
            
            stack.push(fn);
            
            var html = [ 
                "<div class='objectBox-function'>",
                getFuncName(fn), 
                "(" 
            ];

            for (var i = 0, l = fn.arguments.length; i < l; ++i)
            {
                if (i)
                    html.push(", ");
                
                Firebug.Reps.appendObject(fn.arguments[i], html);
            }

            html.push(")</div>");
            Firebug.Console.logRow(html, "stackTrace");
            //Firebug.Console.log(html);
        }
        
        this.groupEnd(traceLabel);
        
        return Firebug.Console.LOG_COMMAND; 
    },
    
    profile: function()
    {
        return this.warn(["profile() not supported."]);
    },
    
    profileEnd: function()
    {
        return this.warn(["profileEnd() not supported."]);
    },
    
    clear: function()
    {
        Firebug.Console.getPanel().panelNode.innerHTML = "";
        
        return Firebug.Console.LOG_COMMAND;
    },

    open: function()
    {
        toggleConsole(true);
        
        return Firebug.Console.LOG_COMMAND;
    },
    
    close: function()
    {
        if (frameVisible)
            toggleConsole();
        
        return Firebug.Console.LOG_COMMAND;
    }
};


// ************************************************************************************************
// Console Module

var ConsoleModule = extend(Firebug.Module, ConsoleAPI);

Firebug.Console = extend(ConsoleModule,
{
    LOG_COMMAND: {},
    
    groupStack: [],
    timeMap: {},
        
    getPanel: function()
    {
        return Firebug.chrome ? Firebug.chrome.getPanel("Console") : null;
    },    

    flush: function()
    {
        var queue = FirebugChrome.consoleMessageQueue;
        FirebugChrome.consoleMessageQueue = [];
        
        for (var i = 0; i < queue.length; ++i)
            this.writeMessage(queue[i][0], queue[i][1], queue[i][2]);
    },
    
    // ********************************************************************************************
    
    logFormatted: function(objects, className)
    {
        var html = [];
    
        var format = objects[0];
        var objIndex = 0;
    
        if (typeof(format) != "string")
        {
            format = "";
            objIndex = -1;
        }
    
        var parts = this.parseFormat(format);
        for (var i = 0; i < parts.length; ++i)
        {
            var part = parts[i];
            if (part && typeof(part) == "object")
            {
                var object = objects[++objIndex];
                part.appender(object, html);
            }
            else
                Firebug.Reps.appendText(part, html);
        }
    
        for (var i = objIndex+1; i < objects.length; ++i)
        {
            Firebug.Reps.appendText(" ", html);
            
            var object = objects[i];
            if (typeof(object) == "string")
                Firebug.Reps.appendText(object, html);
            else
                Firebug.Reps.appendObject(object, html);
        }
        
        return this.logRow(html, className);    
    },
    
    parseFormat: function(format)
    {
        var parts = [];
    
        var reg = /((^%|[^\\]%)(\d+)?(\.)([a-zA-Z]))|((^%|[^\\]%)([a-zA-Z]))/;
        var Reps = Firebug.Reps;
        var appenderMap = {
                s: Reps.appendText, 
                d: Reps.appendInteger, 
                i: Reps.appendInteger, 
                f: Reps.appendFloat
            };
    
        for (var m = reg.exec(format); m; m = reg.exec(format))
        {
            var type = m[8] ? m[8] : m[5];
            var appender = type in appenderMap ? appenderMap[type] : Reps.appendObject;
            var precision = m[3] ? parseInt(m[3]) : (m[4] == "." ? -1 : 0);
    
            parts.push(format.substr(0, m[0][0] == "%" ? m.index : m.index+1));
            parts.push({appender: appender, precision: precision});
    
            format = format.substr(m.index+m[0].length);
        }
    
        parts.push(format);
    
        return parts;
    },
    
    // ********************************************************************************************
    
    logRow: function(message, className, handler)
    {
        var panel = this.getPanel();
        
        if (panel && panel.panelNode)
            this.writeMessage(message, className, handler);
        else
        {
            FirebugChrome.consoleMessageQueue.push([message, className, handler]);
        }
        
        return this.LOG_COMMAND;
    },
    
    writeMessage: function(message, className, handler)
    {
        var container = this.getPanel().containerNode;
        var isScrolledToBottom =
            container.scrollTop + container.offsetHeight >= container.scrollHeight;
    
        if (!handler)
            handler = this.writeRow;
        
        handler.call(this, message, className);
        
        if (isScrolledToBottom)
            container.scrollTop = container.scrollHeight - container.offsetHeight;
    },
    
    appendRow: function(row)
    {
        if (this.groupStack.length > 0)
            var container = this.groupStack[this.groupStack.length-1];
        else
            var container = this.getPanel().panelNode;
        
        container.appendChild(row);
    },
    
    writeRow: function(message, className)
    {
        var row = this.getPanel().panelNode.ownerDocument.createElement("div");
        row.className = "logRow" + (className ? " logRow-"+className : "");
        row.innerHTML = message.join("");
        this.appendRow(row);
    },
    
    pushGroup: function(message, className)
    {
        this.logFormatted(message, className);
    
        var groupRow = this.getPanel().panelNode.ownerDocument.createElement("div");
        groupRow.className = "logGroup";
        var groupRowBox = this.getPanel().panelNode.ownerDocument.createElement("div");
        groupRowBox.className = "logGroupBox";
        groupRow.appendChild(groupRowBox);
        this.appendRow(groupRowBox);
        this.groupStack.push(groupRowBox);
    },
    
    popGroup: function()
    {
        this.groupStack.pop();
    }

});

Firebug.registerModule(Firebug.Console);


// ************************************************************************************************
// Console Panel

function ConsolePanel(){};

ConsolePanel.prototype = extend(Firebug.Panel,
{
    name: "Console",
    title: "Console",
    
    options: 
    {
        hasCommandLine: true,
        hasToolButtons: true,
        isPreRendered: true,
        innerHTMLSync: true
    },

    create: function()
    {
        Firebug.Panel.create.apply(this, arguments);
        
        this.clearButton = new Button({
            element: $("fbConsole_btClear"),
            owner: Firebug.Console,
            onClick: Firebug.Console.clear
        });
    },
    
    initialize: function()
    {
        Firebug.Panel.initialize.apply(this, arguments);
        
        this.clearButton.initialize();
        
        // TODO: xxxpedro
        if (Firebug.HTML)
        {
            addEvent($("fbPanel1"), 'mousemove', Firebug.HTML.onListMouseMove);
            addEvent($("fbContent"), 'mouseout', Firebug.HTML.onListMouseMove);
            addEvent(Firebug.chrome.node, 'mouseout', Firebug.HTML.onListMouseMove);
        }
    },
    
    shutdown: function()
    {
        // TODO: xxxpedro
        if (Firebug.HTML)
        {
            removeEvent($("fbPanel1"), 'mousemove', Firebug.HTML.onListMouseMove);
            removeEvent($("fbContent"), 'mouseout', Firebug.HTML.onListMouseMove);
            removeEvent(Firebug.chrome.node, 'mouseout', Firebug.HTML.onListMouseMove);
        }
        
        this.clearButton.shutdown();
        
        Firebug.Panel.shutdown.apply(this, arguments);
    }    
    
});

Firebug.registerPanel(ConsolePanel);

// ************************************************************************************************

FBL.onError = function(msg, href, lineNo)
{
    var html = [];
    
    var lastSlash = href.lastIndexOf("/");
    var fileName = lastSlash == -1 ? href : href.substr(lastSlash+1);
    
    html.push(
        '<span class="errorMessage">', msg, '</span>', 
        '<div class="objectBox-sourceLink">', fileName, ' (line ', lineNo, ')</div>'
    );
    
    Firebug.Console.logRow(html, "error");
};

// ************************************************************************************************
// Register console namespace

FBL.registerConsole = function()
{
    if (Env.Options.overrideConsole)
    {
        var win = Env.browser.window;
        
        if (!isFirefox || isFirefox && !("console" in win))
            win.console = ConsoleAPI;
        else
            win.firebug = ConsoleAPI;
    }
};

registerConsole();

// ************************************************************************************************
}});