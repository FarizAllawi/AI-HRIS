# ------------------------
# Base Image
# ------------------------
FROM php:8.4.1-fpm

WORKDIR /var/www/html

# ------------------------
# System dependencies
# ------------------------
RUN apt-get update && apt-get install -y \
    git \
    curl \
    zip \
    unzip \
    libzip-dev \
    libonig-dev \
    libxml2-dev \
    default-mysql-client \
    supervisor \
    tini \
    && docker-php-ext-install pdo_mysql mbstring xml zip bcmath pcntl \
    && php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
    && php composer-setup.php --install-dir=/usr/local/bin --filename=composer \
    && php -r "unlink('composer-setup.php');"

# ------------------------
# Install Node.js 22 + pnpm
# ------------------------
ENV CI=true
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g pnpm

# ------------------------
# Add user for Laravel
# ------------------------
RUN useradd -G www-data,root -u 1000 -d /home/laravel laravel \
    && mkdir -p /home/laravel/.composer \
    && chown -R laravel:laravel /var/www/html /home/laravel

# ------------------------
# Switch to laravel user
# ------------------------
USER laravel

# ------------------------
# Copy project files
# ------------------------
COPY --chown=laravel:laravel . .

# ------------------------
# Install Composer dependencies
# ------------------------
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

# ------------------------
# Install frontend dependencies & build (Vite)
# ------------------------
RUN pnpm install \
    && pnpm run build

# ------------------------
# Permissions
# ------------------------
RUN chmod -R 775 storage bootstrap/cache

# ------------------------
# Supervisor config for queues (optional)
# ------------------------
COPY ./docker/supervisor/laravel-worker.conf /etc/supervisor/conf.d/laravel-worker.conf

# ------------------------
# Expose port 80 for web
# ------------------------
EXPOSE 80

# ------------------------
# Entrypoint
# ------------------------
ENTRYPOINT ["/usr/bin/tini", "--"]

CMD ["php-fpm"]
