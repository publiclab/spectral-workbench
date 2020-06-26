redeploy-container:
	# docker-compose down --remove-orphans
	docker-compose up --force-recreate -d
	sleep 30
	docker-compose logs -f
