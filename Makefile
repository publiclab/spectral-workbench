redeploy-container:
	docker-compose up --force-recreate -d
	sleep 30
	docker-compose logs
