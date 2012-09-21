@ECHO OFF
SET path=%path%;c:\Python27\;
python build.py -y -l log-openjs.txt -m builder.openjs openjs.js
