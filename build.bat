@echo off
setlocal EnableDelayedExpansion

REM AI-HRIS Project Build Script for Windows
REM Enhanced with progress bars and better error handling

REM Color codes
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "BLUE=[94m"
set "CYAN=[96m"
set "NC=[0m"

REM Progress bar function
goto :main

:show_progress
    echo %CYAN%⏳ %~1...%NC%
    echo [
    for /L %%i in (1,1,10) do (
        <nul set /p "=▓"
        timeout /t 0 /nobreak >nul
    )
    echo ] %GREEN%✓%NC%
    goto :eof

:check_command
    where %1 >nul 2>nul
    if %errorlevel% equ 0 (
        echo %GREEN%✓ %1 installed%NC%
    ) else (
        echo %RED%✗ %1 not found%NC%
    )
    goto :eof

:show_help
    echo %BLUE%========================================
    echo     AI-HRIS Project Windows Helper
    echo ========================================%NC%
    echo.
    echo Available commands:
    echo.
    echo %YELLOW%📧 INSTALLATION:%NC%
    echo   install-python    - Install Python from python.org
    echo   install-php       - Install PHP 8.4
    echo   install-uv        - Install uv package manager
    echo   install-composer  - Install PHP Composer
    echo   install-nvm       - Install NVM for Windows
    echo   install-node      - Install Node.js via NVM
    echo   install-pnpm      - Install pnpm
    echo   install-docker    - Install Docker Desktop
    echo   install-all       - Install all requirements
    echo.
    echo %YELLOW%🛠️  DEVELOPMENT:%NC%
    echo   serve-hrms        - Start HRMS-APP locally
    echo   serve-ai          - Start AI-SERVICE locally
    echo   build-hrms        - Build HRMS-APP
    echo   build-ai          - Build AI-SERVICE
    echo   build-all         - Build both services
    echo.
    echo %YELLOW%🐳 DOCKER:%NC%
    echo   docker-hrms       - Run HRMS-APP with Docker
    echo   docker-ai         - Run AI-SERVICE with Docker
    echo   docker-all        - Run both services with Docker
    echo.
    echo %YELLOW%🧹 UTILITIES:%NC%
    echo   clean             - Clean build artifacts
    echo   clean-all         - Clean everything including Docker
    echo   status            - Check service status
    echo   help              - Show this help
    echo.
    echo %YELLOW%🚀 QUICKSTART:%NC%
    echo   quickstart        - Set up your development environment
    echo.
    echo For better experience, use PowerShell: .\build.ps1
    echo.
    
    REM Check if Git Bash is available
    where bash >nul 2>nul
    if %errorlevel% equ 0 (
        echo %GREEN%Git Bash detected. Consider using: make help%NC%
    ) else (
        echo %YELLOW%Git Bash not found. Some features may be limited.%NC%
    )
    goto :eof

:main
REM Parse command line arguments
if "%1"=="" goto :show_help
if "%1"=="help" goto :show_help
if "%1"=="install-python" goto :install-python
if "%1"=="install-php" goto :install-php
if "%1"=="install-uv" goto :install-uv
if "%1"=="install-composer" goto :install-composer
if "%1"=="install-nvm" goto :install-nvm
if "%1"=="install-node" goto :install-node
if "%1"=="install-pnpm" goto :install-pnpm
if "%1"=="install-docker" goto :install-docker
if "%1"=="install-all" goto :install-all
if "%1"=="serve-hrms" goto :serve-hrms
if "%1"=="serve-ai" goto :serve-ai
if "%1"=="build-hrms" goto :build-hrms
if "%1"=="build-ai" goto :build-ai
if "%1"=="build-all" goto :build-all
if "%1"=="docker-hrms" goto :docker-hrms
if "%1"=="docker-ai" goto :docker-ai
if "%1"=="docker-all" goto :docker-all
if "%1"=="clean" goto :clean
if "%1"=="clean-all" goto :clean-all
if "%1"=="status" goto :status
if "%1"=="quickstart" goto :quickstart

echo %RED%Unknown command: %1%NC%
echo Use "help" to see available commands
goto :end

:install-python
    echo %BLUE%📦 Installing Python...%NC%
    echo %YELLOW%Opening Python download page...%NC%
    start https://www.python.org/downloads/
    call :show_progress "Waiting for download"
    echo.
    echo %GREEN%Please follow these steps:%NC%
    echo 1. Download Python 3.12 or later
    echo 2. Run the installer
    echo 3. %YELLOW%IMPORTANT: Check "Add Python to PATH"%NC%
    echo 4. Restart this terminal after installation
    echo.
    pause
    goto :end

:install-php
    echo %BLUE%📦 Installing PHP 8.4...%NC%
    echo %YELLOW%Running PHP installation script...%NC%
    
    call :show_progress "Downloading and installing PHP"
    sudo powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://php.new/install/windows/8.4'))"
    
    echo %GREEN%✓ PHP 8.4 installation complete!%NC%
    echo %YELLOW%Please restart your terminal to use PHP%NC%
    goto :end

:install-uv
    echo %BLUE%📦 Installing uv package manager...%NC%
    
    REM Check if Python is installed
    where python >nul 2>nul
    if %errorlevel% neq 0 (
        echo %RED%Error: Python not found. Please install Python first.%NC%
        goto :end
    )
    
    call :show_progress "Downloading uv installer"
    powershell -NoProfile -ExecutionPolicy ByPass -Command "& {Invoke-WebRequest -Uri 'https://astral.sh/uv/install.ps1' -OutFile 'uv-install.ps1'}"
    
    call :show_progress "Installing uv"
    powershell -NoProfile -ExecutionPolicy ByPass -File uv-install.ps1
    del uv-install.ps1
    
    echo %GREEN%✓ uv installation complete!%NC%
    echo %YELLOW%⚠️  Please restart your command prompt%NC%
    goto :end

:install-composer
    echo %BLUE%📦 Installing PHP Composer...%NC%
    
    REM Check if PHP is installed
    where php >nul 2>nul
    if %errorlevel% neq 0 (
        echo %RED%Error: PHP not found. Please install PHP first.%NC%
        echo Opening PHP download page...
        start https://windows.php.net/download/
        goto :end
    )
    
    call :show_progress "Downloading Composer installer"
    powershell -Command "Invoke-WebRequest -Uri 'https://getcomposer.org/installer' -OutFile 'composer-setup.php'"
    
    call :show_progress "Installing Composer"
    php composer-setup.php
    
    if exist composer.phar (
        echo %GREEN%✓ Composer downloaded successfully!%NC%
        echo %YELLOW%To complete installation:%NC%
        echo 1. Move composer.phar to a directory in your PATH
        echo 2. Rename it to composer.bat or add it to PATH
        del composer-setup.php
    ) else (
        echo %RED%Error: Composer installation failed%NC%
    )
    
    start https://getcomposer.org/download/
    goto :end

:install-nvm
    echo %BLUE%📦 Installing NVM for Windows...%NC%
    call :show_progress "Opening NVM download page"
    start https://github.com/coreybutler/nvm-windows/releases
    echo.
    echo %GREEN%Please follow these steps:%NC%
    echo 1. Download nvm-setup.exe from the releases page
    echo 2. Run the installer
    echo 3. Restart this terminal after installation
    echo.
    pause
    goto :end

:install-node
    echo %BLUE%📦 Installing Node.js...%NC%
    
    where nvm >nul 2>nul
    if %errorlevel% neq 0 (
        echo %RED%Error: NVM not found. Please install NVM first.%NC%
        echo Run: build.bat install-nvm
        goto :end
    )
    
    call :show_progress "Installing latest Node.js"
    nvm install latest
    
    call :show_progress "Setting Node.js as default"
    nvm use latest
    
    echo %GREEN%✓ Node.js installation complete!%NC%
    node --version
    npm --version
    goto :end

:install-pnpm
    echo %BLUE%📦 Installing pnpm...%NC%
    
    where npm >nul 2>nul
    if %errorlevel% neq 0 (
        echo %RED%Error: npm not found. Please install Node.js first.%NC%
        echo Run: build.bat install-node
        goto :end
    )
    
    call :show_progress "Installing pnpm globally"
    npm install -g pnpm
    
    echo %GREEN%✓ pnpm installation complete!%NC%
    pnpm --version
    goto :end

:install-docker
    echo %BLUE%📦 Installing Docker Desktop...%NC%
    call :show_progress "Opening Docker Desktop download page"
    start https://www.docker.com/products/docker-desktop/
    echo.
    echo %GREEN%Please follow these steps:%NC%
    echo 1. Download Docker Desktop for Windows
    echo 2. Run the installer
    echo 3. Enable WSL 2 if prompted
    echo 4. Start Docker Desktop after installation
    echo.
    pause
    goto :end

:install-all
    echo %BLUE%⚡ Installing all requirements...%NC%
    echo.
    call :install-python
    timeout /t 2 >nul
    call :install-uv
    timeout /t 2 >nul
    call :install-composer
    timeout /t 2 >nul
    call :install-nvm
    timeout /t 2 >nul
    call :install-node
    timeout /t 2 >nul
    call :install-pnpm
    echo.
    echo %GREEN%✓ All installations initiated!%NC%
    echo %YELLOW%Please restart your terminal after all installations complete.%NC%
    goto :end

:serve-hrms
    echo %BLUE%🚀 Starting HRMS-APP locally...%NC%
    
    if not exist "hrms-app" (
        echo %RED%Error: hrms-app directory not found%NC%
        goto :end
    )
    
    cd hrms-app
    
    echo %CYAN%Installing PHP dependencies...%NC%
    call :show_progress "Running composer install"
    composer install || (echo %RED%Composer install failed%NC% && goto :end)
    
    echo %CYAN%Installing Node.js dependencies...%NC%
    call :show_progress "Running npm install"
    npm install || (echo %RED%npm install failed%NC% && goto :end)
    
    echo %CYAN%Building assets...%NC%
    call :show_progress "Running npm build"
    npm run build || (echo %RED%Build failed%NC% && goto :end)
    
    echo.
    echo %GREEN%✓ Starting Laravel development server...%NC%
    echo %CYAN%Access at: http://localhost:8000%NC%
    echo %YELLOW%Press Ctrl+C to stop the server%NC%
    echo.
    php artisan serve --port=8000
    goto :end

:serve-ai
    echo %BLUE%🚀 Starting AI-SERVICE locally...%NC%
    
    if not exist "ai-service" (
        echo %RED%Error: ai-service directory not found%NC%
        goto :end
    )
    
    cd ai-service
    
    echo %CYAN%Installing Python dependencies...%NC%
    call :show_progress "Running uv sync"
    uv sync || (echo %RED%uv sync failed%NC% && goto :end)
    
    echo.
    echo %GREEN%✓ Starting FastAPI development server...%NC%
    echo %CYAN%API: http://localhost:8100%NC%
    echo %CYAN%Docs: http://localhost:8100/docs%NC%
    echo %YELLOW%Press Ctrl+C to stop the server%NC%
    echo.
    uv run uvicorn app.main:app --host 0.0.0.0 --port=8100 --reload
    goto :end

:build-hrms
    echo %BLUE%🔨 Building HRMS-APP...%NC%
    
    if not exist "hrms-app" (
        echo %RED%Error: hrms-app directory not found%NC%
        goto :end
    )
    
    cd hrms-app
    
    call :show_progress "Installing PHP dependencies"
    composer install --no-dev --optimize-autoloader || goto :build_error
    
    call :show_progress "Installing Node.js dependencies"
    npm install || goto :build_error
    
    call :show_progress "Building assets"
    npm run build || goto :build_error
    
    echo %GREEN%✓ HRMS-APP build complete!%NC%
    goto :end
    
    :build_error
    echo %RED%Build failed!%NC%
    goto :end

:build-ai
    echo %BLUE%🔨 Building AI-SERVICE...%NC%
    
    if not exist "ai-service" (
        echo %RED%Error: ai-service directory not found%NC%
        goto :end
    )
    
    cd ai-service
    
    call :show_progress "Installing Python dependencies"
    uv sync --frozen || (echo %RED%Build failed!%NC% && goto :end)
    
    echo %GREEN%✓ AI-SERVICE build complete!%NC%
    goto :end

:build-all
    call :build-hrms
    cd ..
    call :build-ai
    echo.
    echo %GREEN%✓ All services built successfully!%NC%
    goto :end

:docker-hrms
    echo %BLUE%🐳 Running HRMS-APP with Docker...%NC%
    
    REM Check if Docker is running
    docker info >nul 2>nul
    if %errorlevel% neq 0 (
        echo %RED%Error: Docker is not running%NC%
        echo Please start Docker Desktop first
        goto :end
    )
    
    if not exist "hrms-app" (
        echo %RED%Error: hrms-app directory not found%NC%
        goto :end
    )
    
    cd hrms-app
    
    call :show_progress "Building Docker image"
    docker build -t hrms-app . || (echo %RED%Docker build failed%NC% && goto :end)
    
    call :show_progress "Starting Docker container"
    docker run -d -p 8000:8000 --name hrms-app-container hrms-app || (echo %RED%Docker run failed%NC% && goto :end)
    
    echo %GREEN%✓ HRMS-APP Docker container started!%NC%
    echo %CYAN%Access at: http://localhost:8000%NC%
    goto :end

:docker-ai
    echo %BLUE%🐳 Running AI-SERVICE with Docker...%NC%
    
    docker info >nul 2>nul
    if %errorlevel% neq 0 (
        echo %RED%Error: Docker is not running%NC%
        goto :end
    )
    
    if not exist "ai-service" (
        echo %RED%Error: ai-service directory not found%NC%
        goto :end
    )
    
    cd ai-service
    
    call :show_progress "Starting Docker Compose"
    docker-compose up -d || (echo %RED%Docker Compose failed%NC% && goto :end)
    
    echo %GREEN%✓ AI-SERVICE Docker containers started!%NC%
    echo %CYAN%API: http://localhost:8100%NC%
    echo %CYAN%Docs: http://localhost:8100/docs%NC%
    goto :end

:docker-all
    echo %BLUE%🐳 Running both services with Docker...%NC%
    
    docker info >nul 2>nul
    if %errorlevel% neq 0 (
        echo %RED%Error: Docker is not running%NC%
        goto :end
    )
    
    call :show_progress "Starting AI-SERVICE"
    cd ai-service
    docker-compose up -d
    
    call :show_progress "Starting HRMS-APP"
    cd ..\hrms-app
    docker build -t hrms-app .
    docker run -d -p 8000:8000 --name hrms-app-container hrms-app
    
    echo %GREEN%✓ Both services started with Docker!%NC%
    echo %CYAN%HRMS-APP: http://localhost:8000%NC%
    echo %CYAN%AI-SERVICE: http://localhost:8100%NC%
    goto :end

:clean
    echo %BLUE%🧹 Cleaning build artifacts...%NC%
    
    call :show_progress "Cleaning HRMS-APP"
    if exist "hrms-app" (
        cd hrms-app
        if exist node_modules rmdir /s /q node_modules 2>nul
        if exist vendor rmdir /s /q vendor 2>nul
        if exist dist rmdir /s /q dist 2>nul
        if exist build rmdir /s /q build 2>nul
        if exist public\build rmdir /s /q public\build 2>nul
        cd ..
    )
    
    call :show_progress "Cleaning AI-SERVICE"
    if exist "ai-service" (
        cd ai-service
        if exist __pycache__ rmdir /s /q __pycache__ 2>nul
        if exist .pytest_cache rmdir /s /q .pytest_cache 2>nul
        if exist .coverage del .coverage 2>nul
        if exist htmlcov rmdir /s /q htmlcov 2>nul
        cd ..
    )
    
    echo %GREEN%✓ Clean complete!%NC%
    goto :end

:clean-all
    call :clean
    
    echo %BLUE%🧹 Cleaning Docker resources...%NC%
    call :show_progress "Running Docker cleanup"
    docker system prune -af 2>nul
    docker volume prune -f 2>nul
    
    echo %GREEN%✓ Deep clean complete!%NC%
    goto :end

:status
    echo %BLUE%📊 Checking service status...%NC%
    echo.
    echo %YELLOW%Docker Containers:%NC%
    docker ps --format "table {{.Names}}	{{.Status}}	{{.Ports}}" 2>nul || echo %RED%Docker not running%NC%
    echo.
    echo %YELLOW%Local Services:%NC%
    netstat -ano | findstr :8000 >nul 2>nul && echo %GREEN%HRMS-APP: Running on port 8000%NC% || echo %RED%HRMS-APP: Not running%NC%
    netstat -ano | findstr :8100 >nul 2>nul && echo %GREEN%AI-SERVICE: Running on port 8100%NC% || echo %RED%AI-SERVICE: Not running%NC%
    echo.
    echo %YELLOW%Installed Tools:%NC%
    call :check_command python
    call :check_command uv
    call :check_command php
    call :check_command composer
    call :check_command node
    call :check_command npm
    call :check_command pnpm
    call :check_command docker
    goto :end

:quickstart
    echo %BLUE%⚡ AI-HRIS Quickstart%NC%
    echo.
    echo %YELLOW%This will set up your development environment%NC%
    echo.
    pause
    
    call :install-all
    
    echo.
    echo %GREEN%✓ Installation complete!%NC%
    echo.
    echo %YELLOW%Next steps:%NC%
    echo 1. Copy environment files:
    echo    copy hrms-app\.env.example hrms-app\.env
    echo    copy ai-service\.env.example ai-service\.env
    echo.
    echo 2. Configure your .env files
    echo.
    echo 3. Start development servers (in separate terminals):
    echo    build.bat serve-hrms
    echo    build.bat serve-ai
    echo.
    echo 4. Or use Docker:
    echo    build.bat docker-all
    echo.
    echo %GREEN%Happy coding! 🚀%NC%
    goto :end

:end
    echo.
    echo %GREEN%Done!%NC%
    endlocal