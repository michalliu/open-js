@ECHO OFF
COLOR 0A
cmd.exe /k "python build.py -c -y -l  -m auth.*,event.*,core.*,compat.localStorage"
