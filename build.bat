REM openjs main version
python build.py -y -l  -m builder.openjsForWeiboBuilder openjs.js
REM openjs serverside proxy version(remove unneccssary code, just as postmessage proxy)
python build.py -y -l  -m builder.openjsServerSideProxyBuilder proxy.js
REM openjs serverside demo version(for api.html and performance.html these two application need to unumerate all the apis)
python build.py -y -l  -m builder.openjsServerSideDemoBuilder demo.js
