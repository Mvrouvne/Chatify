
COMPOSE_FILE := -f ./docker-compose.yml

all: 
	@docker compose $(COMPOSE_FILE) up --build

nocache:
	@docker compose $(COMPOSE_FILE) build --no-cache
	@docker compose $(COMPOSE_FILE) up

down: stop
	@docker compose $(COMPOSE_FILE) rm -f -v
	@docker compose $(COMPOSE_FILE) down --rmi local -v || true
	@docker ps -aq | xargs -r docker rm -f 
	@docker images -q | xargs -r docker rmi -f
	@docker volume ls -q | xargs -r docker volume rm

purge:
	@docker system prune --all --force

stop: 
	@docker compose $(COMPOSE_FILE) stop

start: 
	@docker compose $(COMPOSE_FILE) up

status: 
	@docker ps

clear:
	sudo rm -rf ./database/*

.PHONY: all nocache down purge stop start status clear

