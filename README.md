Development Setup AI SERVICE:
1. Ensure HRMS-APP is Runing
2. Make the .env file from .env.example
3. Check is PASSPORT CLIENT for AI-SERVICE exists:
	if exists set API_CLIENT_ID and API_CLIENT_SECRET in ai-service/.env file
	if not create passport client in hrms-app service:
		command to generate passport client: 
		
			php artisan passport:client --client

  			What should we name the client? [Laravel]
			❯ AI-SERVICE
			  INFO  New client created successfully.  

  			 Client ID ......................... 019a462e-0517-7142-8a16-8f242747f41d  
  			 Client Secret ................. 3wffec4FvAC15n5YhdCoNNM0qiGjT1ulMjYk5Qh7
		
		and then set the client ID to be API_CLIENT_ID and client secret to be API_CLIENT_SECRET
4. execute docker-compose --watch in ai-service