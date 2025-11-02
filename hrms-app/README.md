# Serving Application
## Development Mode
### 1. Install dependencies and generate laravel unique key
```bash
  composer install
  cp .env.example .env
  php artisan key:generate
```
### 2. Database Migrate and Generate Passport Key Locally
```bash
  php artisan migrate #1. Migrate database
  php artisan passport:install #2. Generate passport key
```
NOTE: 
```aiignore
* Before Run this command maybe you need to configure database connection in .env file
* Generated oauth-key from passport:install command is located:
    - storage/oauth-private.key
    - storage/oauth-public.key
```
### 2. Generate Secret Token For AI-SERVICE
```bash
  php artisan passport:client --client
```
Example Result:
```aiignore
php artisan passport:client --client

  What should we name the client? [Laravel]
❯ AI-SERVICE

   INFO  New client created successfully.  

  Client ID ......................... 019a462e-0517-7142-8a16-8f242747f41d  
  Client Secret ................. 3wffec4FvAC15n5YhdCoNNM0qiGjT1ulMjYk5Qh7
```
NOTE: Set the CLIENT SECRET in ai-service/.env file
```Bash
  # Run this command to copy public key to ai-service project
  cp storage/oauth-public.key ../ai-service/keys/oauth-public.key
```
### 3. Starting Server
```bash
    composer run dev
```
### 4. Starting Queue Process on another terminal
```bash
    php artisan queue:listen
```
