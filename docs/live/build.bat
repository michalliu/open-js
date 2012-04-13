@ECHO OFF
IF EXIST build (
    RD /S /Q build
)
MKDIR build
CD build
MKDIR static
XCOPY ..\src\css .\static\css\ /S /Q /Y
java -jar D:\Works\Git\open-js\tools\yuicompressor.jar --type css --charset utf-8 -v -o .\static\css\index.css .\static\css\index.css
java -jar D:\Works\Git\open-js\tools\yuicompressor.jar --type css --charset utf-8 -v -o .\static\css\snippet.css .\static\css\snippet.css
java -jar D:\Works\Git\open-js\tools\yuicompressor.jar --type css --charset utf-8 -v -o .\static\css\webkitborder.css .\static\css\webkitborder.css
XCOPY ..\src\js .\static\js\ /S /Q /Y
D:\Works\Git\open-js\tools\node.exe D:\Works\Git\open-js\tools\UglifyJS\uglifyjs -nc -v -o .\static\js\index.js .\static\js\index.js
D:\Works\Git\open-js\tools\node.exe D:\Works\Git\open-js\tools\UglifyJS\uglifyjs -nc -v -o .\static\js\snippet.js .\static\js\snippet.js
XCOPY ..\src\images .\static\images\ /S /Q /Y
XCOPY ..\src\snippet .\snippet\ /S /Q /Y
java -jar D:\Works\Git\open-js\tools\htmlcompressor.jar --type html --compress-js -o .\snippet\snippet.html .\snippet\snippet.html
java -jar D:\Works\Git\open-js\tools\htmlcompressor.jar --type html --compress-js -o .\index.html ..\src\index.html
REM XCOPY ..\build ..\..\..\deployment\docs\ /S /Q /Y
