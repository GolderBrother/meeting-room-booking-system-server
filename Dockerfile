# 基于 node:18.0-alpine3.14 这个镜像，加个别名，在生产阶段需要用到
FROM node:18.0-alpine3.14 as build-stage

# 切换工作目录
WORKDIR /app

# 1、编译 & 构建阶段

# 开始安装依赖
# COPY package.json .和COPY . .为什么要分两次COPY呢？直接COPY . .不行吗？
# Docker 在执行 COPY package.json . 指令时会比较本地的 package.json 文件与容器中的相应文件是否有更新。如果 package.json 文件没有发生变化，则 Docker 会使用缓存的镜像层来避免重复安装依赖项。而如果直接COPY . . Docker 就没办法利用缓存机制进行比较和重用。
COPY package.json .

RUN npm config set registry https://registry.npmmirror.com/

# RUN npm install
RUN npm install --force

COPY . .

# 开始构建，生成 dist 目录
RUN npm run build

# 2、生产阶段
FROM node:18.0-alpine3.14 as production-stage

# 第二个镜像复制第一个镜像的 dist 目录和 package.json 文件到工作目录
# 复制构建好的文件到工作目录
COPY --from=build-stage /app/dist /app
# 复制 package.json 到工作目录，这样可以
COPY --from=build-stage /app/package.json /app/package.json

# 切换工作目录
WORKDIR /app

RUN npm config set registry https://registry.npmmirror.com/

# 安装生产环境的依赖
# RUN npm install --production
RUN npm install --production --force

EXPOSE 3005

# 运行应用
CMD ["node", "/app/main.js"]