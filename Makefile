all:
	docker-compose up --build

build:
	docker-compose build

up:
	docker-compose up --detach

down:
	docker-compose down

clean:
	docker-compose down -v --rmi all

fclean: clean
	docker system prune -af
	docker network prune -f
	docker image prune -f


re: fclean all

.PHONY: all build up down clean fclean re
