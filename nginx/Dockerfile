# Bundle nginx.conf vào image — tránh bind mount `./nginx/...` lỗi trên một số môi trường Portainer/agent.
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/nginx.conf
