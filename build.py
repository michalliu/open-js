#-*- coding: utf-8 -*-
import sys,os
import getopt,logging
import re

reload(sys)
sys.setdefaultencoding("utf-8")

_CWD = os.getcwd()
log = None

def usage():
    """Print the usage of this script"""
    print "Usage:\n"\
        +"python build.py [options] [module,[module,...]] filename\n\n"\
        +"options:\n"\
        +"-h --help     print this message\n"\
        +"-q --quiet    dont print out log\n"\
        +"-y --yes      dont ask for confirmation\n"\
        +"-l --log      generate log file\n"\
        +"-c --compress compress the final file\n"\
        +"-m --module   build with specific modules\n\n"\
        +"sample:\n"\
        +"browser,test,load were implied core.browser core.test core.load\n"\
        +"python build.py -c -m browser,base,test,load\n"\
        +"python build.py -c -m browser,auth.login,login,load\n"\
        +"python build.py -c -m browser,base,test,load mylib.js\n"\
        +"python build.py -c mylib.js\n"\
        +"python build.py mylib.js\n"\
        +"python build.py\n"

def initLogger():
    """Initialize logger"""
    global log
    log = logging.getLogger("JsSDKBuilder")
    console = logging.StreamHandler(sys.stdout)
    console.setFormatter(logging.Formatter('[%(levelname)s] %(message)s'))
    log.setLevel(logging.INFO)
    log.addHandler(console)

def scanJsFileInTree(root):
    """Scan directory for Javascript file"""
    return scanTree(root,re.compile(r'^.+\.js$'))

def scanTree(root, path_filter=None, scan_hidden=False):
    """Scan directory for files"""
    for dirpath,dirnames,filenames in os.walk(root):
        for dirname in dirnames[:]:
            if not scan_hidden and dirname.startswith('.'):
                dirnames.remove(dirname)#dont enter that dir

        for filename in filenames:
            if not scan_hidden and filename.startswith('.'):
                continue#dont list that file

            fullpath = os.path.join(dirpath, filename)

            if path_filter and not path_filter.match(fullpath):
                continue#dont list that file 2

            yield os.path.normpath(fullpath)

class DepsTree(object):

    """Represent the set of dependencies between source files"""

    def __init__(self,sources):
        self._sources = sources
        self._module_map = dict()

        log.info("Building dependency tree")

        #Module不允许重复定义
        for source in sources:
            #Auto correct to full namespace
            if source.package:
                moduleName = ".".join([source.package,source.module])
            else:
                moduleName = source.module

            if moduleName in self._module_map:
                raise Exception("Duplicated module %s provided at source %s" % (moduleName,source))

            log.info("Checking module %s" % moduleName)
            self._module_map[moduleName] = source
        
        #确定所有的依赖的包已存在
        log.info("Checking dependencies")
        for source in sources:
            for require in source.requires:
                if require in self._module_map:
                    pass
                elif ".".join([source.package,require]) in self._module_map:
                    source.requires.remove(require)
                    source.requires.add(".".join([source.package,require]))
                else:
                    raise Exception("Required module %s not found at source %s" % (require,source))

        log.info("Dependency check finished")

    def getDependenciesSource(self,requires=None):

        """Get source for dependencies"""

        allModule = self._module_map.keys()

        if not requires:

            requires = allModule

        else:

            requireSet = set()

            #if requires is str object convert it to iterable list
            if type(requires) is str:  
                requires = [requires]

            # load module smartly
            for require in requires:
                # require isn't a pattern
                if require in allModule:
                    requireSet.add(require)
                # require is a pattern
                else:
                    # enumerate all the modules and load the module matched the pattern
                    for _require in self._module_map.keys():
                        if re.match("^%s$" % require, _require):
                            log.info("Will load module %s according to pattern %s" % (_require,require))
                            requireSet.add(_require)

            requires = requireSet

        deps_sources = []

        for require in requires:
            for source in DepsTree._resolveDependencies(require, [], self._module_map, []):
                if source not in deps_sources:
                    deps_sources.append(source)

        return deps_sources

    @staticmethod
    def _resolveDependencies(require, dependencies, moduleMap, traversalPath):
        source = moduleMap.get(require)
        if not source:
            raise Exception ("Required module %s not found" % require)

        if require in traversalPath:
            traversalPath.append(require)
            raise Exception ("Encountered circular dependency %s" % require)

        traversalPath.append(require)

        if source.requires:
            for sourceRequire in source.requires:
                DepsTree._resolveDependencies(sourceRequire, dependencies, moduleMap, traversalPath)

        dependencies.append(source)

        traversalPath.pop()

        return dependencies

class ThirdPartySource(object):
    """Represent a module provide by third party"""
    def __init__(self, source, path=None):
        self.author = "Unknown"
        self.url = ""
        self.module = ""
        self.licence = "Unknown"
        self.requires = []
        self.package = None
        self._source = source
        self.path = path
        self._scanSource()

    def __str__(self):
        return "ThirdPartySource %s\nlicence:%s\nauthor:%s\npath:%s" % (self.module,self.licence,self.author,self.path)

    def getSource(self):
        return self._source

    def _scanSource(self):
        """Fill in fields for thirdparty source"""
        source = self.getSource()
        sourceDescPat = re.compile(r"/\*.*?\*/",re.S)
        sourceDesc = sourceDescPat.search(source)

        if sourceDesc:
            sourceDesc = sourceDesc.group()
        else:
           raise Exception("Source description not founded")
        
        temp = re.search(r"@author\s+(.+)",sourceDesc)
        if temp:
            self.author = temp.groups()[0]

        temp = re.search(r"@url\s+(.+)",sourceDesc)
        if temp:
            self.url = temp.groups()[0]

        temp = re.search(r"@module\s+(.+)",sourceDesc)
        if temp:
            self.module = temp.groups()[0]

        temp = re.search(r"@licence\s+(.+)",sourceDesc)
        if temp:
            self.licence = temp.groups()[0]


class Source(object):

    """Represent a module for javascript source"""

    def __init__(self, source, path=None):
        self.author = 'UnKnown'
        self.version = ''
        self.package = ''
        self.module = ''
        self.path = path
        self.requires = set() #unique sets
        self._source = source
        self._scanSource()

    def __str__(self):
        return "SDK source\nmodule:%s\npackage:%s\nrequires:%s\nauthor:%s\nversion:%s\npath:%s" % (self.module,self.package,','.join(self.requires),self.author,self.version,self.path)

    def getSource(self):
        return self._source

    def _scanSource(self):
        """Fill in requires by scanning the source"""
        source = self.getSource()
        sourceDescPat = re.compile(r"/\*.*?\*/",re.S)
        requiresPat = re.compile(r"@requires\s?(.+)[@\*]",re.S)
        sourceDesc = sourceDescPat.search(source)

        if sourceDesc:
            sourceDesc = sourceDesc.group()
        else:
           raise Exception("Source description not founded")
        
        temp = re.search(r"@author\s+(.+)",sourceDesc)
        if temp:
            self.author = temp.groups()[0]

        temp = re.search(r"@version\s+(.+)",sourceDesc)
        if temp:
            self.version = temp.groups()[0]

        temp = re.search(r"@package\s+(.+)",sourceDesc)
        if temp:
            self.package = temp.groups()[0]

        temp = re.search(r"@module\s+(.+)",sourceDesc)
        if temp:
            self.module = temp.groups()[0]

        temp = requiresPat.search(sourceDesc)

        if temp:
            for line in temp.groups()[0].splitlines():
                line = re.search(r"(\w.+)",line) 
                if line:
                    self.requires.add(line.groups()[0])

def build(modulenames, targetfile, createlog=False, compress=False):

    """start build library"""

    jsfileRoot = os.path.join(_CWD,"src")

    sources = []
    for jsfile in scanJsFileInTree(jsfileRoot):
        fileContent = open(jsfile).read()
        sources.append(Source(fileContent, os.path.normpath(jsfile)))

    for jsfile in scanJsFileInTree(os.path.join(_CWD,"src",".third-party")):
        fileContent = open(jsfile).read()
        sources.append(ThirdPartySource(fileContent, os.path.normpath(jsfile)))

    # Build a full dependencies tree for all the sources
    tree = DepsTree(sources)

    log.info("Start build libaray")
    finalSource = []
    sources = tree.getDependenciesSource(modulenames)

    for source in sources:
        log.info("Loading source %s" % source)
        finalSource.append(source.getSource())

    finalSource = "".join(finalSource)

    open(targetfile,"w+").write(finalSource)

    if createlog:
        logfile = open("log.txt","w+")
        logfile.write("\n\n".join([str(source) for source in sources]))
        logfile.write("\n" * 2)
        logfile.write("\n".join(["<script src=\"" + source.path.replace(_CWD,"..").replace("\\","/") + "\"></script>" for source in sources]))
        logfile.close()

    if not compress:
        return

    # create minified file ?
    # packing javascript
    basefile,extension = os.path.splitext(targetfile)
    minifiedfile = "".join([basefile,".min",extension])

    log.info("Packing through uglifyjs")
    # pack javascript through uglifyjs
    nodejs = os.path.join(_CWD, "tools", "node.exe")
    uglifyjs = os.path.join(_CWD, "tools", "UglifyJS", "uglifyjs")
    uglifyOptions = "-nc -v -o %s" % minifiedfile

    uglified = os.system("%s %s %s %s" % (nodejs, uglifyjs, uglifyOptions,targetfile))

    #uglified success
    if uglified != 0:
        # pack javascript through python
        log.info("Packing through javascript packer")
        packer = JavaScriptPacker()
        open(minifiedfile,"w+").write(packer.pack(finalSource))

##
##
##
##
##
##
## Javascript Packer
## http://www.crowproductions.de/repos/main/public/packer/jspacker.py
##
##
##
##
##
##
##

##  ParseMaster, version 1.0 (pre-release) (2005/05/12) x6
##  Copyright 2005, Dean Edwards
##  Web: http://dean.edwards.name/
##
##  This software is licensed under the CC-GNU LGPL
##  Web: http://creativecommons.org/licenses/LGPL/2.1/
##
##  Ported to Python by Florian Schulze

# a multi-pattern parser

class Pattern:
    def __init__(self, expression, replacement, length):
        self.expression = expression
        self.replacement = replacement
        self.length = length

    def __str__(self):
        return "(" + self.expression + ")"

class Patterns(list):
    def __str__(self):
        return '|'.join([str(e) for e in self])

class ParseMaster:
    # constants
    EXPRESSION = 0
    REPLACEMENT = 1
    LENGTH = 2
    GROUPS = re.compile(r"""\(""", re.M)#g
    SUB_REPLACE = re.compile(r"""\$\d""", re.M)
    INDEXED = re.compile(r"""^\$\d+$""", re.M)
    TRIM = re.compile(r"""(['"])\1\+(.*)\+\1\1$""", re.M)
    ESCAPE = re.compile(r"""\\.""", re.M)#g
    #QUOTE = re.compile(r"""'""", re.M)
    DELETED = re.compile("""\x01[^\x01]*\x01""", re.M)#g

    def __init__(self):
        # private
        self._patterns = Patterns()   # patterns stored by index
        self._escaped = []
        self.ignoreCase = False
        self.escapeChar = None

    def DELETE(self, match, offset):
        return "\x01" + match.group(offset) + "\x01"

    def _repl(self, a, o, r, i):
        while (i):
            m = a.group(o+i-1)
            if m is None:
                s = ""
            else:
                s = m
            r = r.replace("$" + str(i), s)
            i = i - 1
        r = ParseMaster.TRIM.sub("$1", r)
        return r

    # public
    def add(self, expression="^$", replacement=None):
        if replacement is None:
            replacement = self.DELETE
        # count the number of sub-expressions
        #  - add one because each pattern is itself a sub-expression
        length = len(ParseMaster.GROUPS.findall(self._internalEscape(str(expression)))) + 1
        # does the pattern deal with sub-expressions?
        if (isinstance(replacement, str) and ParseMaster.SUB_REPLACE.match(replacement)):
            # a simple lookup? (e.g. "$2")
            if (ParseMaster.INDEXED.match(replacement)):
                # store the index (used for fast retrieval of matched strings)
                replacement = int(replacement[1:]) - 1
            else: # a complicated lookup (e.g. "Hello $2 $1")
                # build a function to do the lookup
                i = length
                r = replacement
                replacement = lambda a,o: self._repl(a,o,r,i)
        # pass the modified arguments
        self._patterns.append(Pattern(expression, replacement, length))

    # execute the global replacement
    def execute(self, string):
        if self.ignoreCase:
            r = re.compile(str(self._patterns), re.I | re.M)
        else:
            r = re.compile(str(self._patterns), re.M)
        string = self._escape(string, self.escapeChar)
        string = r.sub(self._replacement, string)
        string = self._unescape(string, self.escapeChar)
        string = ParseMaster.DELETED.sub("", string)
        return string

    # clear the patterns collections so that this object may be re-used
    def reset(self):
        self._patterns = Patterns()

    # this is the global replace function (it's quite complicated)
    def _replacement(self, match):
        i = 1
        # loop through the patterns
        for pattern in self._patterns:
            if match.group(i) is not None:
                replacement = pattern.replacement
                if callable(replacement):
                    return replacement(match, i)
                elif isinstance(replacement, (int, long)):
                    return match.group(replacement+i)
                else:
                    return replacement
            else:
                i = i+pattern.length

    # encode escaped characters
    def _escape(self, string, escapeChar=None):
        def repl(match):
            char = match.group(1)
            self._escaped.append(char)
            return escapeChar
        if escapeChar is None:
            return string
        r = re.compile("\\"+escapeChar+"(.)", re.M)
        result = r.sub(repl, string)
        return result

    # decode escaped characters
    def _unescape(self, string, escapeChar=None):
        def repl(match):
            try:
                #result = eval("'"+escapeChar + self._escaped.pop(0)+"'")
                result = escapeChar + self._escaped.pop(0)
                return result
            except IndexError:
                return escapeChar
        if escapeChar is None:
            return string
        r = re.compile("\\"+escapeChar, re.M)
        result = r.sub(repl, string)
        return result

    def _internalEscape(self, string):
        return ParseMaster.ESCAPE.sub("", string)


##   packer, version 2.0 (2005/04/20)
##   Copyright 2004-2005, Dean Edwards
##   License: http://creativecommons.org/licenses/LGPL/2.1/

##  Ported to Python by Florian Schulze

## http://dean.edwards.name/packer/

class JavaScriptPacker:
    def __init__(self):
        self._basicCompressionParseMaster = self.getCompressionParseMaster(False)
        self._specialCompressionParseMaster = self.getCompressionParseMaster(True)

    def basicCompression(self, script):
        return self._basicCompressionParseMaster.execute(script)

    def specialCompression(self, script):
        return self._specialCompressionParseMaster.execute(script)

    def getCompressionParseMaster(self, specialChars):
        IGNORE = "$1"
        parser = ParseMaster()
        parser.escapeChar = '\\'
        # protect strings
        parser.add(r"""'[^']*?'""", IGNORE)
        parser.add(r'"[^"]*?"', IGNORE)
        # remove comments
        parser.add(r"""//[^\n\r]*?[\n\r]""")
        parser.add(r"""/\*[^*]*?\*+([^/][^*]*?\*+)*?/""")
        # protect regular expressions
        parser.add(r"""\s+(\/[^\/\n\r\*][^\/\n\r]*\/g?i?)""", "$2")
        parser.add(r"""[^\w\$\/'"*)\?:]\/[^\/\n\r\*][^\/\n\r]*\/g?i?""", IGNORE)
        # remove: ;;; doSomething();
        if specialChars:
            parser.add(""";;;[^\n\r]+[\n\r]""")
        # remove redundant semi-colons
        parser.add(r""";+\s*([};])""", "$2")
        # remove white-space
        parser.add(r"""(\b|\$)\s+(\b|\$)""", "$2 $3")
        parser.add(r"""([+\-])\s+([+\-])""", "$2 $3")
        parser.add(r"""\s+""", "")
        return parser

    def getEncoder(self, ascii):
        mapping = {}
        base = ord('0')
        mapping.update(dict([(i, chr(i+base)) for i in range(10)]))
        base = ord('a')
        mapping.update(dict([(i+10, chr(i+base)) for i in range(26)]))
        base = ord('A')
        mapping.update(dict([(i+36, chr(i+base)) for i in range(26)]))
        base = 161
        mapping.update(dict([(i+62, chr(i+base)) for i in range(95)]))

        # zero encoding
        # characters: 0123456789
        def encode10(charCode):
            return str(charCode)

        # inherent base36 support
        # characters: 0123456789abcdefghijklmnopqrstuvwxyz
        def encode36(charCode):
            l = []
            remainder = charCode
            while 1:
                result, remainder = divmod(remainder, 36)
                l.append(mapping[remainder])
                if not result:
                    break
                remainder = result
            l.reverse()
            return "".join(l)

        # hitch a ride on base36 and add the upper case alpha characters
        # characters: 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
        def encode62(charCode):
            l = []
            remainder = charCode
            while 1:
                result, remainder = divmod(remainder, 62)
                l.append(mapping[remainder])
                if not result:
                    break
                remainder = result
            l.reverse()
            return "".join(l)

        # use high-ascii values
        def encode95(charCode):
            l = []
            remainder = charCode
            while 1:
                result, remainder = divmod(remainder, 95)
                l.append(mapping[remainder+62])
                if not result:
                    break
                remainder = result
            l.reverse()
            return "".join(l)

        if ascii <= 10:
            return encode10
        elif ascii <= 36:
            return encode36
        elif ascii <= 62:
            return encode62
        return encode95

    def escape(self, script):
        script = script.replace("\\","\\\\")
        script = script.replace("'","\\'")
        script = script.replace('\n','\\n')
        #return re.sub(r"""([\\'](?!\n))""", "\\$1", script)
        return script

    def escape95(self, script):
        result = []
        for x in script:
            if x>'\xa1':
                x = "\\x%0x" % ord(x)
            result.append(x)
        return "".join(result)

    def encodeKeywords(self, script, encoding, fastDecode):
        # escape high-ascii values already in the script (i.e. in strings)
        if (encoding > 62):
            script = self.escape95(script)
        # create the parser
        parser = ParseMaster()
        encode = self.getEncoder(encoding)
        # for high-ascii, don't encode single character low-ascii
        if encoding > 62:
            regexp = r"""\w\w+"""
        else:
            regexp = r"""\w+"""
        # build the word list
        keywords = self.analyze(script, regexp, encode)
        encoded = keywords['encoded']
        # encode
        def repl(match, offset):
            return encoded.get(match.group(offset), "")
        parser.add(regexp, repl)
        # if encoded, wrap the script in a decoding function
        script = parser.execute(script)
        script = self.bootStrap(script, keywords, encoding, fastDecode)
        return script

    def analyze(self, script, regexp, encode):
        # analyse
        # retreive all words in the script
        regexp = re.compile(regexp, re.M)
        all = regexp.findall(script)
        sorted = [] # list of words sorted by frequency
        encoded = {} # dictionary of word->encoding
        protected = {} # instances of "protected" words
        if all:
            unsorted = []
            _protected = {}
            values = {}
            count = {}
            all.reverse()
            for word in all:
                word = "$"+word
                if word not in count:
                    count[word] = 0
                    j = len(unsorted)
                    unsorted.append(word)
                    # make a dictionary of all of the protected words in this script
                    #  these are words that might be mistaken for encoding
                    values[j] = encode(j)
                    _protected["$"+values[j]] = j
                count[word] = count[word] + 1
            # prepare to sort the word list, first we must protect
            #  words that are also used as codes. we assign them a code
            #  equivalent to the word itself.
            # e.g. if "do" falls within our encoding range
            #      then we store keywords["do"] = "do";
            # this avoids problems when decoding
            sorted = [None] * len(unsorted)
            for word in unsorted:
                if word in _protected and isinstance(_protected[word], int):
                    sorted[_protected[word]] = word[1:]
                    protected[_protected[word]] = True
                    count[word] = 0
            unsorted.sort(lambda a,b: count[b]-count[a])
            j = 0
            for i in range(len(sorted)):
                if sorted[i] is None:
                    sorted[i]  = unsorted[j][1:]
                    j = j + 1
                encoded[sorted[i]] = values[i]
        return {'sorted': sorted, 'encoded': encoded, 'protected': protected}

    def encodePrivate(self, charCode):
        return "_"+str(charCode)

    def encodeSpecialChars(self, script):
        parser = ParseMaster()
        # replace: $name -> n, $$name -> $$na
        def repl(match, offset):
            #print offset, match.groups()
            length = len(match.group(offset + 2))
            start = length - max(length - len(match.group(offset + 3)), 0)
            return match.group(offset + 1)[start:start+length] + match.group(offset + 4)
        parser.add(r"""((\$+)([a-zA-Z\$_]+))(\d*)""", repl)
        # replace: _name -> _0, double-underscore (__name) is ignored
        regexp = r"""\b_[A-Za-z\d]\w*"""
        # build the word list
        keywords = self.analyze(script, regexp, self.encodePrivate)
        # quick ref
        encoded = keywords['encoded']
        def repl(match, offset):
            return encoded.get(match.group(offset), "")
        parser.add(regexp, repl)
        return parser.execute(script)

    # build the boot function used for loading and decoding
    def bootStrap(self, packed, keywords, encoding, fastDecode):
        ENCODE = re.compile(r"""\$encode\(\$count\)""")
        # $packed: the packed script
        #packed = self.escape(packed)
        #packed = [packed[x*10000:(x+1)*10000] for x in range((len(packed)/10000)+1)]
        #packed = "'" + "'+\n'".join(packed) + "'\n"
        packed = "'" + self.escape(packed) + "'"

        # $count: number of words contained in the script
        count = len(keywords['sorted'])

        # $ascii: base for encoding
        ascii = min(count, encoding) or 1

        # $keywords: list of words contained in the script
        for i in keywords['protected']:
            keywords['sorted'][i] = ""
        # convert from a string to an array
        keywords = "'" + "|".join(keywords['sorted']) + "'.split('|')"

        encoding_functions = {
            10: """ function($charCode) {
                        return $charCode;
                    }""",
            36: """ function($charCode) {
                        return $charCode.toString(36);
                    }""",
            62: """ function($charCode) {
                        return ($charCode < _encoding ? "" : arguments.callee(parseInt($charCode / _encoding))) +
                            (($charCode = $charCode % _encoding) > 35 ? String.fromCharCode($charCode + 29) : $charCode.toString(36));
                    }""",
            95: """ function($charCode) {
                        return ($charCode < _encoding ? "" : arguments.callee($charCode / _encoding)) +
                            String.fromCharCode($charCode % _encoding + 161);
                    }"""
        }

        # $encode: encoding function (used for decoding the script)
        encode = encoding_functions[encoding]
        encode = encode.replace('_encoding',"$ascii")
        encode = encode.replace('arguments.callee', "$encode")
        if ascii > 10:
            inline = "$count.toString($ascii)"
        else:
            inline = "$count"
        # $decode: code snippet to speed up decoding
        if fastDecode:
            # create the decoder
            decode = r"""// does the browser support String.replace where the
                        //  replacement value is a function?
                        if (!''.replace(/^/, String)) {
                            // decode all the values we need
                            while ($count--) $decode[$encode($count)] = $keywords[$count] || $encode($count);
                            // global replacement function
                            $keywords = [function($encoded){return $decode[$encoded]}];
                            // generic match
                            $encode = function(){return'\\w+'};
                            // reset the loop counter -  we are now doing a global replace
                            $count = 1;
                        }"""
            if encoding > 62:
                decode = decode.replace('\\\\w', "[\\xa1-\\xff]")
            else:
                # perform the encoding inline for lower ascii values
                if ascii < 36:
                    decode = ENCODE.sub(inline, decode)
            # special case: when $count==0 there ar no keywords. i want to keep
            #  the basic shape of the unpacking funcion so i'll frig the code...
            if not count:
                raise NotImplemented
                #) $decode = $decode.replace(/(\$count)\s*=\s*1/, "$1=0");


        # boot function
        unpack = r"""function($packed, $ascii, $count, $keywords, $encode, $decode) {
                        while ($count--)
                            if ($keywords[$count])
                                $packed = $packed.replace(new RegExp("\\b" + $encode($count) + "\\b", "g"), $keywords[$count]);
                        return $packed;
                    }"""
        if fastDecode:
            # insert the decoder
            #unpack = re.sub(r"""\{""", "{" + decode + ";", unpack)
            unpack = unpack.replace('{', "{" + decode + ";", 1)

        if encoding > 62: # high-ascii
            # get rid of the word-boundaries for regexp matches
            unpack = re.sub(r"""'\\\\b'\s*\+|\+\s*'\\\\b'""", "", unpack)
        if ascii > 36 or encoding > 62 or fastDecode:
            # insert the encode function
            #unpack = re.sub(r"""\{""", "{$encode=" + encode + ";", unpack)
            unpack = unpack.replace('{', "{$encode=" + encode + ";", 1)
        else:
            # perform the encoding inline
            unpack = ENCODE.sub(inline, unpack)
        # pack the boot function too
        unpack = self.pack(unpack, 0, False, True)

        # arguments
        params = [packed, str(ascii), str(count), keywords]
        if fastDecode:
            # insert placeholders for the decoder
            params.extend(['0', "{}"])

        # the whole thing
        return "eval(" + unpack + "(" + ",".join(params) + "))\n";

    def pack(self, script, encoding=0, fastDecode=False, specialChars=False, compaction=True):
        script = script+"\n"
        self._encoding = encoding
        self._fastDecode = fastDecode
        if specialChars:
            script = self.specialCompression(script)
            script = self.encodeSpecialChars(script)
        else:
            if compaction:
                script = self.basicCompression(script)
        if encoding:
            script = self.encodeKeywords(script, encoding, fastDecode)
        return script
##
##
##
##
##
##
## End Javascript Packer
##
##
##
##
##
##
##

def main(argv):

    """Preprocessing"""

    initLogger()
    modules=set() #需要打包的模块
    quietMode=False # 安静模式
    executeDirectly=False # 直接执行不再询问
    fileList=False # 创建文件列表清单文件
    savedDirectory=os.path.join(_CWD,"build")
    savedFileName="all.js" #默认目标文件名
    compress=False #创建压缩版本的JS

    try:
        opts,args = getopt.getopt(argv, "hqylcm:",["help","quiet","yes","log","compress","module="])
    except getopt.GetoptError,err:
        log.error(str(err))
        usage()
        sys.exit(2)
    for opt, arg in opts:
        if opt in ("-h", "--help"):
            usage()
            sys.exit()
        elif opt in ("-q","--quiet"):
            quietMode = True
        elif opt in ("-y","--yes"):
            executeDirectly = True
        elif opt in ("-l","--log"):
            fileList = True
        elif opt in ("-c","--compress"):
            compress = True
        elif opt in ("-m","--module"):
            opt = arg.split(",")
            for m in opt:
                modules.add(m)

    if len(args) > 0:
        savedFileName = args[0]

    savedFilePath = os.path.join(savedDirectory,savedFileName)

    if quietMode:
        log.setLevel(logging.FATAL)

    if executeDirectly:
        build(modules,savedFilePath,fileList,compress)
        return

    #询问是否继续
    log.info("you are about to do the following actions:")
    if len(modules) > 0:
        log.info("use modules %s" % ",".join(modules))
    else:
        log.info("use all the module available")
    if fileList:
        log.info("generate log file")
    else:
        log.info("don't generate the filelist")

    log.info("save to %s" % savedFilePath)
    log.info("is it the operation you expected? please type yes or no")
   
    while True:
        confirm = raw_input(">>>")
        if confirm.lower() == "yes":
            build(modules,savedFilePath,fileList,compress)
            break
        elif confirm.lower() == "no":
            sys.exit(0)
            break
        else:
            log.warning("%s is invalid,please enter yes or no" % confirm)

if __name__ == "__main__":
    main(sys.argv[1:])
