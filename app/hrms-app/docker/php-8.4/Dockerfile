# ==============================================================================
# GLOBAL ARGUMENTS
# ==============================================================================
ARG ALPINE_VERSION=3.22
ARG WWWGROUP=1000
ARG WWWUSER=1000
ARG NODE_VERSION=22
ARG POSTGRES_VERSION=17

# ==============================================================================
# STAGE 1: BASE (Dependencies & System Setup)
# ==============================================================================
FROM alpine:${ALPINE_VERSION} AS base

LABEL maintainer="Fariz Allawi"
WORKDIR /var/www/html

# Re-declare ARGs needed in this stage
ARG POSTGRES_VERSION

ENV TZ=UTC

# 1. Install System Dependencies
RUN apk add --no-cache \
    bash \
    curl \
    ca-certificates \
    openssl \
    git \
    tzdata \
    supervisor \
    nginx \
    shadow \
    su-exec \
     # PHP Core & FPM
    php84 \
    php84-fpm \
    php84-cli \
    php84-dev \
    php84-opcache \
    php84-phar \
    php84-common \
    # PHP Extensions (FIX: Added iconv, sodium, simplexml)
    php84-session \
    php84-tokenizer \
    php84-ctype \
    php84-fileinfo \
    php84-dom \
    php84-curl \
    php84-zip \
    php84-gd \
    php84-intl \
    php84-mbstring \
    php84-mysqli \
    php84-pdo_mysql \
    php84-pgsql \
    php84-pdo_pgsql \
    php84-sqlite3 \
    php84-xml \
    php84-xmlreader \
    php84-xmlwriter \
    php84-soap \
    php84-bcmath \
    php84-ldap \
    php84-pecl-msgpack \
    php84-pecl-igbinary \
    php84-pecl-redis \
    php84-imap \
    php84-pecl-memcached \
    php84-pecl-pcov \
    php84-pecl-imagick \
    php84-iconv \
    php84-sodium \
    php84-simplexml \
    # Database Clients
    sqlite \
    "postgresql${POSTGRES_VERSION}-client" \
    # Utils
    ffmpeg \
    librsvg \
    libcap \
    bind-tools \
    nano \
    acl \
    && rm -rf /var/cache/apk/*

# 2. System Configuration
RUN ln -sf /usr/bin/php84 /usr/bin/php

# Install Composer globally
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configure Nginx & PHP directories
RUN mkdir -p /var/log/nginx /var/lib/nginx /run/nginx /run/php \
    && touch /var/log/nginx/access.log /var/log/nginx/error.log \
    && chmod -R 777 /var/log/nginx /var/lib/nginx /run/nginx /run/php

# Copy Configuration Files (Common)
COPY docker/php-8.4/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/php-8.4/php.ini /etc/php84/conf.d/99-custom.ini

# ==============================================================================
# STAGE 2: DEVELOPMENT (Local Dev / Sail Replacement)
# ==============================================================================
FROM base AS dev

ARG WWWGROUP
ARG WWWUSER
ARG NODE_VERSION

# Install Node.js & Dev Tools
RUN apk add --no-cache \
    php84-xdebug \
    nodejs \
    npm \
    && npm install -g pnpm

# Configure PHP-FPM Pool
COPY docker/php-8.4/fpm-pool.dev.conf /etc/php84/php-fpm.d/www.conf

# Configure Xdebug
COPY docker/php-8.4/xdebug.ini /etc/php84/conf.d/xdebug.ini

# --- NGINX DEV CONFIG ---
COPY docker/php-8.4/nginx/nginx.dev.conf /etc/nginx/http.d/default.conf
# ------------------------

# Setup the "sail" user
RUN addgroup -g ${WWWGROUP} sail || true \
    && adduser -D -u ${WWWUSER} -G sail -s /bin/bash sail \
    && chown -R sail:sail /var/www/html

COPY docker/php-8.4/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Copy Code & Install Dev Dependencies
COPY --chown=sail:sail . /var/www/html
# REMOVED: USER sail (Entrypoint will handle user switching)
# RUN su-exec sail composer install --no-interaction --prefer-dist

EXPOSE 80
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

# ==============================================================================
# STAGE 3: TEST (CI/CD)
# ==============================================================================
FROM dev AS test

USER root
# --- NGINX TEST CONFIG ---
COPY docker/php-8.4/nginx/nginx.test.conf /etc/nginx/http.d/default.conf
# -------------------------

USER sail
CMD ["php", "artisan", "test"]

# ==============================================================================
# STAGE 4: PRODUCTION (Lean & Secure)
# ==============================================================================
FROM base AS prod


# Configure PHP-FPM Pool
COPY docker/php-8.4/fpm-pool.prod.conf /etc/php84/php-fpm.d/www.conf

# --- NGINX PROD CONFIG ---
COPY docker/php-8.4/nginx/nginx.prod.conf /etc/nginx/http.d/default.conf
# -------------------------

# Copy Application Code
COPY --chown=nobody:nobody . /var/www/html

# Install Production Dependencies Only
USER nobody
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

EXPOSE 80
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
