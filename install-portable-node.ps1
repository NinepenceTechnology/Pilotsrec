# ==============================================================================
# Pilot's Records - Instalador e Executor Portável do Ambiente Node.js (Windows)
# Desenvolvido para ambientes restritos sem privilégios de Administrador
# ==============================================================================
[CmdletBinding()]
param(
    [string]$NodeVersion = "v22.14.0",
    [switch]$StartDev,
    [switch]$BuildDist
)

$ErrorActionPreference = "Stop"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "   PILOT'S RECORDS - AMBIENTE PORTÁVEL DE PILOTAGEM PORTUÁRIA   " -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "[INFO] Modo sem privilégios de Administrador (Local Process Isolation)" -ForegroundColor Gray

$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$PortableDir = Join-Path $ScriptRoot ".portable-node"
$NodeZipPath = Join-Path $ScriptRoot "node-portable.zip"
$NodeExtractDir = Join-Path $PortableDir "node-$NodeVersion-win-x64"

# 1. Verificar se Node.js já existe no sistema global
$SystemNode = Get-Command "node" -ErrorAction SilentlyContinue
$UseSystemNode = $false

if ($SystemNode) {
    try {
        $Ver = & node -v
        Write-Host "[OK] Node.js detectado no sistema: $Ver ($($SystemNode.Source))" -ForegroundColor Green
        $UseSystemNode = $true
    } catch {
        $UseSystemNode = $false
    }
}

if (-not $UseSystemNode) {
    Write-Host "[INFO] Verificando instalação portável local em: $PortableDir" -ForegroundColor Cyan

    if (-not (Test-Path (Join-Path $NodeExtractDir "node.exe"))) {
        Write-Host "[DOWNLOAD] Descarregando Node.js $NodeVersion portátil oficial (nodejs.org)..." -ForegroundColor Yellow
        $DownloadUrl = "https://nodejs.org/dist/$NodeVersion/node-$NodeVersion-win-x64.zip"
        
        if (-not (Test-Path $PortableDir)) {
            New-Item -ItemType Directory -Path $PortableDir | Out-Null
        }

        # Descarregar com WebClient para máxima compatibilidade sem módulos extras
        $WebClient = New-Object System.Net.WebClient
        $WebClient.Headers.Add("User-Agent", "PilotsRecordsPortableInstaller/1.0")
        $WebClient.DownloadFile($DownloadUrl, $NodeZipPath)
        
        Write-Host "[EXTRAIR] Descompactando binários no diretório de utilizador..." -ForegroundColor Yellow
        Expand-Archive -Path $NodeZipPath -DestinationPath $PortableDir -Force
        Remove-Item -Path $NodeZipPath -Force -ErrorAction SilentlyContinue
        Write-Host "[OK] Node.js portátil instalado com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "[OK] Node.js portátil já existente em cache local." -ForegroundColor Green
    }

    # Injetar no PATH apenas do processo atual (não requer privilégios de Admin nem edita o registro global)
    $env:PATH = "$NodeExtractDir;$env:PATH"
}

# 2. Validar execução do Node e NPM no processo
$ActiveNodeVer = & node -v
$ActiveNpmVer = & npm -v
Write-Host "[SUCESSO] Runtime Ativo: Node.js $ActiveNodeVer | NPM $ActiveNpmVer" -ForegroundColor Green

# 3. Instalar dependências locais se node_modules não existir
$NodeModules = Join-Path $ScriptRoot "node_modules"
if (-not (Test-Path $NodeModules)) {
    Write-Host "[INSTALAR] A instalar pacotes do Pilot's Records (incluindo SheetJS xlsx)..." -ForegroundColor Yellow
    Push-Location $ScriptRoot
    & npm install --no-audit --prefer-offline
    Pop-Location
    Write-Host "[OK] Dependências instaladas com sucesso!" -ForegroundColor Green
} else {
    Write-Host "[OK] Dependências do projeto já presentes." -ForegroundColor Green
}

# 4. Execução de comandos conforme parâmetros
Push-Location $ScriptRoot

if ($BuildDist) {
    Write-Host "[BUILD] A gerar compilação estática de produção (dist)..." -ForegroundColor Cyan
    & npm run build
    Write-Host "[OK] Compilação concluída em /dist!" -ForegroundColor Green
} elseif ($StartDev) {
    Write-Host "[INICIAR] A arrancar servidor de desenvolvimento na porta 3000..." -ForegroundColor Cyan
    & npm run dev
} else {
    Write-Host "-----------------------------------------------------------------" -ForegroundColor Gray
    Write-Host "Ambiente preparado! Escolha uma opção:" -ForegroundColor White
    Write-Host "  1. Iniciar servidor local (npm run dev)"
    Write-Host "  2. Compilar versão de produção (npm run build)"
    Write-Host "  3. Sincronizar Capacitor Android (npm run mobile:sync)"
    Write-Host "  4. Executar versão Desktop Electron (npm run desktop:dev)"
    Write-Host "  5. Sair"
    Write-Host "-----------------------------------------------------------------" -ForegroundColor Gray
    
    $Choice = Read-Host "Digite a opção desejada (1-5) [Padrão: 1]"
    if ([string]::IsNullOrWhiteSpace($Choice) -or $Choice -eq "1") {
        & npm run dev
    } elseif ($Choice -eq "2") {
        & npm run build
    } elseif ($Choice -eq "3") {
        & npm run mobile:sync
    } elseif ($Choice -eq "4") {
        & npm run desktop:dev
    } else {
        Write-Host "Sessão finalizada." -ForegroundColor Gray
    }
}

Pop-Location
