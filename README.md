Development And Production Setup:
1. Create .env file in `config` folder
```bash
cd config
cp .env.example .env
 ```
2. Create .env file in HRMS-APP
```bash
cd app/hrms-app
cp .env.example .env
```
3. Create .env file in AI-SERVICE
```bash
cd app/ai-service
cp .env.example .env
```
4. Start the container
```bash
docker compose up -d
```
