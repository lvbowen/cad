#配置处理
echo '是否是单项目===='"$Single"'===='
URL=$BASE_URL
BRANCH_NAME=$branch
PROJECT=${URL#/}
PROJECT_NAME=`echo $BRANCH_NAME | awk -F "/" '{print $2}'`
#homePath=/entries/homepage/dist/config.js
portalPath=/entries/portal/dist/config.js
mobilePath=/entries/mobile/dist/config.js
if [ "$Single" = "false" ]; then
    echo '多项目'
    sed -i 's/Path/'"$PROJECT"'/' "$(pwd)"$portalPath
    sed -i 's/Code/'"$PROJECT"'/' "$(pwd)"$portalPath
    sed -i 's/Path/'"$PROJECT"'/' "$(pwd)"$mobilePath
    sed -i 's/Code/'"$PROJECT"'/' "$(pwd)"$mobilePath
#    sed -i 's/Path/'"$PROJECT"'/' "$(pwd)"$homePath
#    sed -i 's/Code/'"$PROJECT"'/' "$(pwd)"$homePath
else
    echo '单项目'
    echo '项目编码====='"$PROJECT_NAME"'======'
    sed -i 's/Path/undefined/' "$(pwd)"$portalPath
    sed -i 's/Code/'"$PROJECT_NAME"'/' "$(pwd)"$portalPath
    sed -i 's/Path/undefined/' "$(pwd)"$mobilePath
    sed -i 's/Code/'"$PROJECT_NAME"'/' "$(pwd)"$mobilePath
#    sed -i 's/Path/undefined/' "$(pwd)"$homePath
#    sed -i 's/Code/'"$PROJECT_NAME"'/' "$(pwd)"$homePath
fi
#容器处理
docker stop $containerName
docker rm $containerName
for k in `docker images | grep $containerName|grep -v "grep"|awk '{print $3}'`
do
  docker rmi -f $k
done
docker build -f ./Dockerfile -t $containerName .
