## To setup API feature to map application

1. Copy this file to `api_setup` directory with nginx configuration file
2. setup this tool using docker
```bash
docker pull openresty/openresty:alpine
docker pull redis
sudo docker run -d --name map-redis -p 6379:6379 redis
```
3. then start redis-cli using this docker command `sudo docker exec -it map-redis redis-cli`
4. then run the following command in redis-cli
```bash
SET api_key:myfirstkey "active"
SET usage:myfirstkey 0
EXIT
```
5. finally run openresty in docker pointing it to nginx.conf file
```bash
sudo docker run -d --name map-openresty -p 8080:80 --network host -v ~/map-api/nginx.conf:/usr/local/openresty/nginx/conf/nginx.conf openresty/openresty:alpine
```
6. then u can access the map server using url like this `http://34.100.203.205/styles/basic-preview/{z}/{x}/{y}.png?key=myfirstkey` 