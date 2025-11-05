# AI-HRIS Project Build Script for PowerShell
# Enhanced with progress bars and better error handling

# Helper Functions
function Show-Progress {
    param([string]$Activity, [string]$Status = "Processing...")
    
    Write-Host "`n$Activity" -ForegroundColor Cyan
    $progressChars = @('▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓', '▓')
    Write-Host "[" -NoNewline
    foreach ($char in $progressChars) {
        Write-Host $char -NoNewline -ForegroundColor Green
        Start-Sleep -Milliseconds 100
    }
    Write-Host "] " -NoNewline
    Write-Host "✓" -ForegroundColor Green
}

function Test-CommandExists {
    param([string]$Command)
    
    $exists = Get-Command $Command -ErrorAction SilentlyContinue
    if ($exists) {
        Write-Host "✓ $Command installed" -ForegroundColor Green
        return $true
    } else {
        Write-Host "✗ $Command not found" -ForegroundColor Red
        return $false
    }
}

function Show-Header {
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host "    AI-HRIS Project PowerShell Helper" -ForegroundColor Blue
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host ""
}

function Show-Help {
    Show-Header
    Write-Host "Available commands:" -ForegroundColor Green
    Write-Host ""
    Write-Host "📧 INSTALLATION:" -ForegroundColor Yellow
    Write-Host "  install-python    - Install Python from python.org"
    Write-Host "  install-php       - Install PHP 8.4"
    Write-Host "  install-uv        - Install uv package manager"
    Write-Host "  install-composer  - Install PHP Composer"
    Write-Host "  install-nvm       - Install NVM for Windows"
    Write-Host "  install-node      - Install Node.js via NVM"
    Write-Host "  install-pnpm      - Install pnpm"
    Write-Host "  install-docker    - Install Docker Desktop"
    Write-Host "  install-all       - Install all requirements"
    Write-Host ""
    Write-Host "🛠️  DEVELOPMENT:" -ForegroundColor Yellow
    Write-Host "  serve-hrms        - Start HRMS-APP locally"
    Write-Host "  serve-ai          - Start AI-SERVICE locally"
    Write-Host "  build-hrms        - Build HRMS-APP"
    Write-Host "  build-ai          - Build AI-SERVICE"
    Write-Host "  build-all         - Build both services"
    Write-Host ""
    Write-Host "🐳 DOCKER:" -ForegroundColor Yellow
    Write-Host "  docker-hrms       - Run HRMS-APP with Docker"
    Write-Host "  docker-ai         - Run AI-SERVICE with Docker"
    Write-Host "  docker-all        - Run both services with Docker"
    Write-Host ""
    Write-Host "🧹 UTILITIES:" -ForegroundColor Yellow
    Write-Host "  clean             - Clean build artifacts"
    Write-Host "  clean-all         - Clean everything including Docker"
    Write-Host "  status            - Check service status"
    Write-Host "  help              - Show this help"
    Write-Host ""
    Write-Host "🚀 QUICKSTART:" -ForegroundColor Yellow
    Write-Host "  quickstart        - Set up your development environment"
    Write-Host ""
    
    # Check if Git Bash is available
    if (Get-Command bash -ErrorAction SilentlyContinue) {
        Write-Host "Git Bash detected. Consider using: make help" -ForegroundColor Green
    } else {
        Write-Host "For full functionality, install Git Bash or WSL" -ForegroundColor Cyan
    }
}

function Install-Python {
    Write-Host "`n📦 Installing Python..." -ForegroundColor Blue
    
    # Check if already installed
    if (Get-Command python -ErrorAction SilentlyContinue) {
        $version = python --version
        Write-Host "Python already installed: $version" -ForegroundColor Green
        $response = Read-Host "Do you want to reinstall? (y/N)"
        if ($response -ne 'y') { return }
    }
    
    Show-Progress "Opening Python download page"
    Start-Process "https://www.python.org/downloads/"
    
    Write-Host "`nPlease follow these steps:" -ForegroundColor Yellow
    Write-Host "1. Download Python 3.12 or later"
    Write-Host "2. Run the installer"
    Write-Host "3. " -NoNewline
    Write-Host "IMPORTANT: Check 'Add Python to PATH'" -ForegroundColor Red
    Write-Host "4. Restart PowerShell after installation"
    Write-Host ""
    
    $null = Read-Host "Press Enter when installation is complete"
    
    if (Get-Command python -ErrorAction SilentlyContinue) {
        Write-Host "✓ Python installed successfully!" -ForegroundColor Green
        python --version
    } else {
        Write-Host "⚠️  Python not detected. Please restart PowerShell." -ForegroundColor Yellow
    }
}

function Install-Php {
    Write-Host "`n📦 Installing PHP 8.4..." -ForegroundColor Blue
    Write-Host "Running PHP installation script..." -ForegroundColor Yellow
    
    Show-Progress "Downloading and installing PHP"
    sudo Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    sudo iex ((New-Object System.Net.WebClient).DownloadString('https://php.new/install/windows/8.4'))
    
    Write-Host "✓ PHP 8.4 installation complete!" -ForegroundColor Green
    Write-Host "Please restart your terminal to use PHP" -ForegroundColor Yellow
}

function Install-UV {
    Write-Host "`n📦 Installing uv package manager..." -ForegroundColor Blue
    
    if (-not (Test-CommandExists python)) {
        Write-Host "Error: Python not found. Please install Python first." -ForegroundColor Red
        Write-Host "Run: .\build.ps1 install-python" -ForegroundColor Yellow
        return
    }
    
    try {
        Show-Progress "Downloading uv installer"
        Invoke-WebRequest -Uri "https://astral.sh/uv/install.ps1" -OutFile "uv-install.ps1"
        
        Show-Progress "Installing uv"
        & .\uv-install.ps1
        Remove-Item "uv-install.ps1" -ErrorAction SilentlyContinue
        
        Write-Host "✓ uv installation complete!" -ForegroundColor Green
        Write-Host "⚠️  Please restart your PowerShell session" -ForegroundColor Yellow
        
        # Try to verify installation
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        if (Get-Command uv -ErrorAction SilentlyContinue) {
            uv --version
        }
    }
    catch {
        Write-Host "Failed to install uv: $_" -ForegroundColor Red
    }
}

function Install-Composer {
    Write-Host "`n📦 Installing PHP Composer..." -ForegroundColor Blue
    
    if (-not (Test-CommandExists php)) {
        Write-Host "Error: PHP not found. Please install PHP first." -ForegroundColor Red
        Write-Host "Opening PHP download page..." -ForegroundColor Yellow
        Start-Process "https://windows.php.net/download/"
        return
    }
    
    try {
        Show-Progress "Downloading Composer installer"
        Invoke-WebRequest -Uri "https://getcomposer.org/installer" -OutFile "composer-setup.php"
        
        Show-Progress "Installing Composer"
        php composer-setup.php
        Remove-Item "composer-setup.php" -ErrorAction SilentlyContinue
        
        if (Test-Path "composer.phar") {
            Write-Host "✓ Composer downloaded successfully!" -ForegroundColor Green
            Write-Host "`nTo complete installation:" -ForegroundColor Yellow
            Write-Host "1. Move composer.phar to a directory in your PATH"
            Write-Host "2. Or add its location to PATH"
            Write-Host "`nOpening Composer documentation..." -ForegroundColor Cyan
            Start-Process "https://getcomposer.org/download/"
        }
    }
    catch {
        Write-Host "Failed to install Composer: $_" -ForegroundColor Red
    }
}

function Install-NVM {
    Write-Host "`n📦 Installing NVM for Windows..." -ForegroundColor Blue
    
    Show-Progress "Opening NVM download page"
    Start-Process "https://github.com/coreybutler/nvm-windows/releases"
    
    Write-Host "`nPlease follow these steps:" -ForegroundColor Yellow
    Write-Host "1. Download nvm-setup.exe from the releases page"
    Write-Host "2. Run the installer with administrator privileges"
    Write-Host "3. Restart PowerShell after installation"
    Write-Host ""
    
    $null = Read-Host "Press Enter when installation is complete"
    
    if (Get-Command nvm -ErrorAction SilentlyContinue) {
        Write-Host "✓ NVM installed successfully!" -ForegroundColor Green
        nvm version
    } else {
        Write-Host "⚠️  NVM not detected. Please restart PowerShell." -ForegroundColor Yellow
    }
}

function Install-Node {
    Write-Host "`n📦 Installing Node.js..." -ForegroundColor Blue
    
    if (-not (Test-CommandExists nvm)) {
        Write-Host "Error: NVM not found. Please install NVM first." -ForegroundColor Red
        Write-Host "Run: .\build.ps1 install-nvm" -ForegroundColor Yellow
        return
    }
    
    try {
        Show-Progress "Installing latest Node.js via NVM"
        & nvm install latest
        
        Show-Progress "Setting Node.js as default"
        & nvm use latest
        
        Write-Host "✓ Node.js installation complete!" -ForegroundColor Green
        
        if (Get-Command node -ErrorAction SilentlyContinue) {
            node --version
            npm --version
        }
    }
    catch {
        Write-Host "Failed to install Node.js: $_" -ForegroundColor Red
    }
}

function Install-PNPM {
    Write-Host "`n📦 Installing pnpm..." -ForegroundColor Blue
    
    if (-not (Test-CommandExists npm)) {
        Write-Host "Error: npm not found. Please install Node.js first." -ForegroundColor Red
        Write-Host "Run: .\build.ps1 install-node" -ForegroundColor Yellow
        return
    }
    
    try {
        Show-Progress "Installing pnpm globally"
        & npm install -g pnpm
        
        Write-Host "✓ pnpm installation complete!" -ForegroundColor Green
        
        if (Get-Command pnpm -ErrorAction SilentlyContinue) {
            pnpm --version
        }
    }
    catch {
        Write-Host "Failed to install pnpm: $_" -ForegroundColor Red
    }
}

function Install-Docker {
    Write-Host "`n📦 Installing Docker Desktop..." -ForegroundColor Blue
    
    Show-Progress "Opening Docker Desktop download page"
    Start-Process "https://www.docker.com/products/docker-desktop/"
    
    Write-Host "`nPlease follow these steps:" -ForegroundColor Yellow
    Write-Host "1. Download Docker Desktop for Windows"
    Write-Host "2. Run the installer"
    Write-Host "3. Enable WSL 2 if prompted"
    Write-Host "4. Start Docker Desktop after installation"
    Write-Host ""
    
    $null = Read-Host "Press Enter when installation is complete"
    
    if (Get-Command docker -ErrorAction SilentlyContinue) {
        Write-Host "✓ Docker installed successfully!" -ForegroundColor Green
        docker --version
    } else {
        Write-Host "⚠️  Docker not detected. Please restart PowerShell." -ForegroundColor Yellow
    }
}

function Install-All {
    Write-Host "`n⚡ Installing all requirements..." -ForegroundColor Blue
    Write-Host ""
    
    Install-Python
    Start-Sleep -Seconds 1
    Install-UV
    Start-Sleep -Seconds 1
    Install-Composer
    Start-Sleep -Seconds 1
    Install-NVM
    Start-Sleep -Seconds 1
    Install-Node
    Start-Sleep -Seconds 1
    Install-PNPM
    
    Write-Host "`n✓ All installations initiated!" -ForegroundColor Green
    Write-Host "⚠️  Please restart PowerShell after all installations complete." -ForegroundColor Yellow
}

function Serve-HRMS {
    Write-Host "`n🚀 Starting HRMS-APP locally..." -ForegroundColor Blue
    
    if (-not (Test-Path "hrms-app")) {
        Write-Host "Error: hrms-app directory not found" -ForegroundColor Red
        return
    }
    
    Set-Location "hrms-app"
    
    try {
        Write-Host "`nInstalling PHP dependencies..." -ForegroundColor Cyan
        Show-Progress "Running composer install"
        & composer install
        if ($LASTEXITCODE -ne 0) { throw "Composer install failed" }
        
        Write-Host "`nInstalling Node.js dependencies..." -ForegroundColor Cyan
        Show-Progress "Running npm install"
        & npm install
        if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
        
        Write-Host "`nBuilding assets..." -ForegroundColor Cyan
        Show-Progress "Running npm build"
        & npm run build
        if ($LASTEXITCODE -ne 0) { throw "Build failed" }
        
        Write-Host "`n✓ Starting Laravel development server..." -ForegroundColor Green
        Write-Host "Access at: " -NoNewline
        Write-Host "http://localhost:8000" -ForegroundColor Cyan
        Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
        Write-Host ""
        
        & php artisan serve --port=8000
    }
    catch {
        Write-Host "Error: $_" -ForegroundColor Red
    }
    finally {
        Set-Location ..
    }
}

function Serve-AI {
    Write-Host "`n🚀 Starting AI-SERVICE locally..." -ForegroundColor Blue
    
    if (-not (Test-Path "ai-service")) {
        Write-Host "Error: ai-service directory not found" -ForegroundColor Red
        return
    }
    
    Set-Location "ai-service"
    
    try {
        Write-Host "`nInstalling Python dependencies..." -ForegroundColor Cyan
        Show-Progress "Running uv sync"
        & uv sync
        if ($LASTEXITCODE -ne 0) { throw "uv sync failed" }
        
        Write-Host "`n✓ Starting FastAPI development server..." -ForegroundColor Green
        Write-Host "API: " -NoNewline
        Write-Host "http://localhost:8100" -ForegroundColor Cyan
        Write-Host "Docs: " -NoNewline
        Write-Host "http://localhost:8100/docs" -ForegroundColor Cyan
        Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
        Write-Host ""
        
        & uv run uvicorn app.main:app --host 0.0.0.0 --port=8100 --reload
    }
    catch {
        Write-Host "Error: $_" -ForegroundColor Red
    }
    finally {
        Set-Location ..
    }
}

function Build-HRMS {
    Write-Host "`n🔨 Building HRMS-APP..." -ForegroundColor Blue
    
    if (-not (Test-Path "hrms-app")) {
        Write-Host "Error: hrms-app directory not found" -ForegroundColor Red
        return
    }
    
    Set-Location "hrms-app"
    
    try {
        Show-Progress "Installing PHP dependencies"
        & composer install --no-dev --optimize-autoloader
        if ($LASTEXITCODE -ne 0) { throw "Composer install failed" }
        
        Show-Progress "Installing Node.js dependencies"
        & npm install
        if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
        
        Show-Progress "Building assets"
        & npm run build
        if ($LASTEXITCODE -ne 0) { throw "Build failed" }
        
        Write-Host "✓ HRMS-APP build complete!" -ForegroundColor Green
    }
    catch {
        Write-Host "Build failed: $_" -ForegroundColor Red
    }
    finally {
        Set-Location ..
    }
}

function Build-AI {
    Write-Host "`n🔨 Building AI-SERVICE..." -ForegroundColor Blue
    
    if (-not (Test-Path "ai-service")) {
        Write-Host "Error: ai-service directory not found" -ForegroundColor Red
        return
    }
    
    Set-Location "ai-service"
    
    try {
        Show-Progress "Installing Python dependencies"
        & uv sync --frozen
        if ($LASTEXITCODE -ne 0) { throw "uv sync failed" }
        
        Write-Host "✓ AI-SERVICE build complete!" -ForegroundColor Green
    }
    catch {
        Write-Host "Build failed: $_" -ForegroundColor Red
    }
    finally {
        Set-Location ..
    }
}

function Build-All {
    Build-HRMS
    Build-AI
    Write-Host "`n✓ All services built successfully!" -ForegroundColor Green
}

function Docker-HRMS {
    Write-Host "`n🐳 Running HRMS-APP with Docker..." -ForegroundColor Blue
    
    # Check if Docker is running
    try {
        $null = docker info 2>&1
    }
    catch {
        Write-Host "Error: Docker is not running" -ForegroundColor Red
        Write-Host "Please start Docker Desktop first" -ForegroundColor Yellow
        return
    }
    
    if (-not (Test-Path "hrms-app")) {
        Write-Host "Error: hrms-app directory not found" -ForegroundColor Red
        return
    }
    
    Set-Location "hrms-app"
    
    try {
        Show-Progress "Building Docker image"
        & docker build -t hrms-app .
        if ($LASTEXITCODE -ne 0) { throw "Docker build failed" }
        
        Show-Progress "Starting Docker container"
        & docker run -d -p 8000:8000 --name hrms-app-container hrms-app
        if ($LASTEXITCODE -ne 0) { throw "Docker run failed" }
        
        Write-Host "✓ HRMS-APP Docker container started!" -ForegroundColor Green
        Write-Host "Access at: " -NoNewline
        Write-Host "http://localhost:8000" -ForegroundColor Cyan
    }
    catch {
        Write-Host "Error: $_" -ForegroundColor Red
    }
    finally {
        Set-Location ..
    }
}

function Docker-AI {
    Write-Host "`n🐳 Running AI-SERVICE with Docker..." -ForegroundColor Blue
    
    try {
        $null = docker info 2>&1
    }
    catch {
        Write-Host "Error: Docker is not running" -ForegroundColor Red
        return
    }
    
    if (-not (Test-Path "ai-service")) {
        Write-Host "Error: ai-service directory not found" -ForegroundColor Red
        return
    }
    
    Set-Location "ai-service"
    
    try {
        Show-Progress "Starting Docker Compose"
        & docker-compose up -d
        if ($LASTEXITCODE -ne 0) { throw "Docker Compose failed" }
        
        Write-Host "✓ AI-SERVICE Docker containers started!" -ForegroundColor Green
        Write-Host "API: " -NoNewline
        Write-Host "http://localhost:8100" -ForegroundColor Cyan
        Write-Host "Docs: " -NoNewline
        Write-Host "http://localhost:8100/docs" -ForegroundColor Cyan
    }
    catch {
        Write-Host "Error: $_" -ForegroundColor Red
    }
    finally {
        Set-Location ..
    }
}

function Docker-All {
    Write-Host "`n🐳 Running both services with Docker..." -ForegroundColor Blue
    
    try {
        $null = docker info 2>&1
    }
    catch {
        Write-Host "Error: Docker is not running" -ForegroundColor Red
        return
    }
    
    Show-Progress "Starting AI-SERVICE"
    Set-Location "ai-service"
    & docker-compose up -d
    
    Show-Progress "Starting HRMS-APP"
    Set-Location "../hrms-app"
    & docker build -t hrms-app .
    & docker run -d -p 8000:8000 --name hrms-app-container hrms-app
    
    Set-Location ..
    
    Write-Host "`n✓ Both services started with Docker!" -ForegroundColor Green
    Write-Host "HRMS-APP: " -NoNewline
    Write-Host "http://localhost:8000" -ForegroundColor Cyan
    Write-Host "AI-SERVICE: " -NoNewline
    Write-Host "http://localhost:8100" -ForegroundColor Cyan
}

function Clean {
    Write-Host "`n🧹 Cleaning build artifacts..." -ForegroundColor Blue
    
    Show-Progress "Cleaning HRMS-APP"
    if (Test-Path "hrms-app") {
        Set-Location "hrms-app"
        Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "node_modules"
        Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "vendor"
        Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "dist"
        Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "build"
        Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "public/build"
        Set-Location ..
    }
    
    Show-Progress "Cleaning AI-SERVICE"
    if (Test-Path "ai-service") {
        Set-Location "ai-service"
        Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "__pycache__"
        Remove-Item -Recurse -Force -ErrorAction SilentlyContinue ".pytest_cache"
        Remove-Item -Force -ErrorAction SilentlyContinue ".coverage"
        Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "htmlcov"
        Set-Location ..
    }
    
    Write-Host "✓ Clean complete!" -ForegroundColor Green
}

function Clean-All {
    Clean
    
    Write-Host "`n🧹 Cleaning Docker resources..." -ForegroundColor Blue
    Show-Progress "Running Docker cleanup"
    & docker system prune -af 2>$null
    & docker volume prune -f 2>$null
    
    Write-Host "✓ Deep clean complete!" -ForegroundColor Green
}

function Show-Status {
    Write-Host "`n📊 Checking service status..." -ForegroundColor Blue
    Write-Host ""
    
    Write-Host "Docker Containers:" -ForegroundColor Yellow
    try {
        & docker ps --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}"
    }
    catch {
        Write-Host "Docker not running" -ForegroundColor Red
    }
    
    Write-Host "`nLocal Services:" -ForegroundColor Yellow
    $hrmsPort = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
    $aiPort = Get-NetTCPConnection -LocalPort 8100 -ErrorAction SilentlyContinue
    
    if ($hrmsPort) {
        Write-Host "HRMS-APP: Running on port 8000" -ForegroundColor Green
    } else {
        Write-Host "HRMS-APP: Not running" -ForegroundColor Red
    }
    
    if ($aiPort) {
        Write-Host "AI-SERVICE: Running on port 8100" -ForegroundColor Green
    } else {
        Write-Host "AI-SERVICE: Not running" -ForegroundColor Red
    }
    
    Write-Host "`nInstalled Tools:" -ForegroundColor Yellow
    Test-CommandExists "python"
    Test-CommandExists "uv"
    Test-CommandExists "php"
    Test-CommandExists "composer"
    Test-CommandExists "node"
    Test-CommandExists "npm"
    Test-CommandExists "pnpm"
    Test-CommandExists "docker"
}

function Quickstart {
    Show-Header
    Write-Host "⚡ AI-HRIS Quickstart" -ForegroundColor Blue
    Write-Host ""
    Write-Host "This will set up your development environment" -ForegroundColor Yellow
    Write-Host ""
    
    $response = Read-Host "Do you want to continue? (Y/n)"
    if ($response -eq 'n') { return }
    
    Install-All
    
    Write-Host "`n✓ Installation complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Copy environment files:"
    Write-Host "   Copy-Item -Path hrms-app/.env.example -Destination hrms-app/.env"
    Write-Host "   Copy-Item -Path ai-service/.env.example -Destination ai-service/.env"
    Write-Host ""
    Write-Host "2. Configure your .env files"
    Write-Host ""
    Write-Host "3. Start development servers (in separate terminals):"
    Write-Host "   .\build.ps1 serve-hrms"
    Write-Host "   .\build.ps1 serve-ai"
    Write-Host ""
    Write-Host "4. Or use Docker for both:"
    Write-Host "   .\build.ps1 docker-all"
    Write-Host ""
    Write-Host "Happy coding! 🚀" -ForegroundColor Green
}

# Main script execution
if ($args.Count -eq 0) {
    Show-Help
    exit
}

$command = $args[0].ToLower()

switch ($command) {
    "help" { Show-Help }
    "install-python" { Install-Python }
    "install-php" { Install-Php }
    "install-uv" { Install-UV }
    "install-composer" { Install-Composer }
    "install-nvm" { Install-NVM }
    "install-node" { Install-Node }
    "install-pnpm" { Install-PNPM }
    "install-docker" { Install-Docker }
    "install-all" { Install-All }
    "serve-hrms" { Serve-HRMS }
    "serve-ai" { Serve-AI }
    "build-hrms" { Build-HRMS }
    "build-ai" { Build-AI }
    "build-all" { Build-All }
    "docker-hrms" { Docker-HRMS }
    "docker-ai" { Docker-AI }
    "docker-all" { Docker-All }
    "clean" { Clean }
    "clean-all" { Clean-All }
    "status" { Show-Status }
    "quickstart" { Quickstart }
    default {
        Write-Host "Unknown command: $command" -ForegroundColor Red
        Write-Host "Use 'help' to see available commands" -ForegroundColor Yellow
        Show-Help
    }
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green