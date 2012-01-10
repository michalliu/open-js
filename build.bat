REM openjs main version
python build.py -y -l -c -m builder.openjsForWeiboBuilder openjs.js
REM openjs serverside proxy version(remove unneccssary code, just as postmessage proxy)
python build.py -y -l -c -m builder.openjsServerSideProxyBuilder proxy.js
REM openjs serverside demo version(for api.html and performance.html these two application need to unumerate all the apis)
python build.py -y -l -c -m builder.openjsServerSideDemoBuilder demo.js
REM python build.py -y -l -c -m builder.baseToolBuilder tool.js
