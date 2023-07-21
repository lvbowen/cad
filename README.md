# 多项目目录结构

<span style="background-color:#d7951f;padding:1pt 4pt;border-radius:3pt;color:black;font-size:10pt">修改注意</span>
<span style="background-color:#d84f4f;padding:1pt 4pt;border-radius:3pt;color:black;font-size:10pt;color:#eae5e5;">
废弃</span>
<pre style="font-family:'Cascadia Code'">
bin<span style="color: rgba(255,255,255,0.26)"> —-- 处理脚本</span>
<span style="background-color:#d7951f;padding:1pt 4pt;border-radius:3pt;color:black;" >conf.d</span><span style="color: rgba(255,255,255,0.26)"> —-- 容器Nginx配置</span> 
entries<span style="color: rgba(255,255,255,0.26)"> —-- 项目文件</span>     
 |—— <span style="background-color:#d84f4f;padding:1pt 4pt;border-radius:3pt;color:#eae5e5;" >admin</span><span style="color: rgba(255,255,255,0.26)"> —-- 后台管理 !废弃! 使用admin独立项目开发</span>   
 |—— mobile<span style="color: rgba(255,255,255,0.26)"> —-- 移动端门户</span>     
 |—— portal<span style="color: rgba(255,255,255,0.26)"> —-- PC端门户</span>     
modules<span style="color: rgba(255,255,255,0.26)"> —-- 本地模块</span> 
 |—— @cloudpviot <span style="color: rgba(255,255,255,0.26)"> —-- 云枢官方模块</span> 
 |—— ctesi <span style="color: rgba(255,255,255,0.26)"> —-- CTESI模块</span>
 |—— @h3 <span style="color: rgba(255,255,255,0.26)"> —-- 云枢官方模块</span> 
 |—— h3-forms<span style="color: rgba(255,255,255,0.26)"> —-- 云枢官方模块</span> 
<span style="background-color:#d7951f;padding:1pt 4pt;border-radius:3pt;color:black;" >deploy.sh</span><span style="color: rgba(255,255,255,0.26)"> —-- 部署脚本</span> 
declarations.d.ts<span style="color: rgba(255,255,255,0.26)"> —-- TypeScript模块声明文件</span>
<span style="background-color:#d7951f;padding:1pt 4pt;border-radius:3pt;color:black;" >Dockerfile</span><span style="color: rgba(255,255,255,0.26)"> —-- DockerImage配置文件</span>
tsconfig.json<span style="color: rgba(255,255,255,0.26)"> —-- Typescript配置文件</span> 
<span style="background-color:#d7951f;padding:1pt 4pt;border-radius:3pt;color:black;" >ngxin.conf</span><span style="color: rgba(255,255,255,0.26)"> —-- 容器Nginx配置</span> 
</pre>


---

### 开发准备工作

> ### 1.设置私库
>`npm set registry http://nexus.wisdombimsite.com/repository/npm/`





> ### 2.登录到私库
>`npm login -registry=http://nexus.wisdombimsite.com/repository/npm/`
>
>1. 输入用户名密码以及邮箱
><pre style="font-family:'Cascadia Code'">
>Username: ctesi_dev
>Password: 密码见环境账号密码
>Email: (this IS public) ctesi_dev@ctesi.com
></pre>
>
>2. 确认登录结果
>
>&emsp;<font color=008000 >登录成功</font> <span>&rArr;</span> `Logged in as ctesi_dev on http://nexus.wisdombimsite.com/repository/npm/.`
>
>&emsp;<font color=FF0000 >登录失败</font> <span>&rArr;</span> `401 Unauthorized - PUT http://nexus.wisdombimsite.com/repository/npm/-/user/org.couchdb.user:ctesi_dev - Bad username or password`

> ### 3.安装依赖
>`npm run installs`
---

### 本地开发切换项目

> 修改对应项目文件目录下的`.env.debug`
> <pre style="font-family:'Cascadia Code'">
> VUE_APP_BASE_URL = '/对应项目应用编码'
> 重新 npm run portal or mobile
> </pre>
---

### 更新项目代码及代码合并

> 第一步先将远程库的项目主干代码合并进你的开发分支 例：`将CH分支合并到XXX_dev`
> <pre style="font-family:'Cascadia Code'">
> 主干代码为项目容器部署的代码
> </pre>
> <pre style="font-family:'Cascadia Code'">
> VUE_APP_BASE_URL = '/对应项目应用编码'
> 重新 npm run portal or mobile
> </pre>