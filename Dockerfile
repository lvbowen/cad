FROM nginx
RUN mkdir -p /dist/mobile
RUN mkdir /dist/homepage
COPY entries/portal/dist/. dist/
COPY entries/mobile/dist/. dist/mobile
#COPY entries/homepage/dist/. dist/homepage
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/. /etc/nginx/conf.d/
RUN cp -rf /dist/* /usr/share/nginx/html
