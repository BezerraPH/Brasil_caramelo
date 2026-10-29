param(
    [string]$Message = ""
)
if ($Message) {
    python nao_essenciais\scripts\deploy_to_server.py $Message
} else {
    python nao_essenciais\scripts\deploy_to_server.py
}

