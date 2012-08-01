@ECHO OFF
SET TOOLS=%cd%\..\..\tools
SET yuicompressor=%TOOLS%\yuicompressor.jar
SET htmlcompressor=%TOOLS%\htmlcompressor.jar
SET node=%TOOLS%\node.exe
SET utlifyjs=%TOOLS%\uflifyjs
IF EXIST build (
    RD /S /Q build
)
MKDIR build
CD build
MKDIR static
XCOPY ..\src\downloads .\static\downloads\ /S /Q /Y
XCOPY ..\src\css .\static\css\ /S /Q /Y
java -jar %yuicompressor% --type css --charset utf-8 -v -o .\static\css\index.css .\static\css\index.css
java -jar %yuicompressor% --type css --charset utf-8 -v -o .\static\css\snippet.css .\static\css\snippet.css
java -jar %yuicompressor% --type css --charset utf-8 -v -o .\static\css\webkitborder.css .\static\css\webkitborder.css
XCOPY ..\src\js .\static\js\ /S /Q /Y
%node% %uglifyjs% -nc -v -o .\static\js\index.js .\static\js\index.js
%node% %uglifyjs% -nc -v -o .\static\js\snippet.js .\static\js\snippet.js
XCOPY ..\src\images .\static\images\ /S /Q /Y
XCOPY ..\src\snippet .\snippet\ /S /Q /Y
XCOPY ..\src\showcase .\showcase\ /S /Q /Y
java -jar %htmlcompressor% --type html --compress-js -o .\snippet\snippet.html .\snippet\snippet.html
java -jar %htmlcompressor% --type html --compress-js -o .\showcase\follow.html .\showcase\follow.html
java -jar %htmlcompressor% --type html --compress-js -o .\index.html ..\src\index.html
java -jar %htmlcompressor% --type html --compress-js -o .\guidance.html ..\src\guidance.html
XCOPY ..\src\guess .\guess\ /S /Q /Y
