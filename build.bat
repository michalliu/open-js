@ECHO OFF
COLOR 0A
cmd.exe /k "python build.py -y -l -m auth.*,event.*,core.*,compat.localStorage"
