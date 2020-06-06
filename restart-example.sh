docker stop domestic-app
docker rm domestic-app
docker build -t domestic .
docker run -it -p 8080:8080 --restart=always --name domestic-app -d domestic
