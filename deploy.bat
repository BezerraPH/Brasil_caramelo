@echo off
setlocal
set MSG=%*
if "%MSG%"=="" (
    python nao_essenciais\scripts\deploy_to_server.py
) else (
    python nao_essenciais\scripts\deploy_to_server.py "%MSG%"
)

