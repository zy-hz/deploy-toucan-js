# 大嘴鸟 javascript 通用库

​	大嘴鸟常用的轮子，拼装起来完成一些有趣的工作。例如：分布式采集系统（类似搜索引擎的工作方法）。

**最新版本**

- 2019-12-12 发布1.0.17版本
- 2019-12-10 发布1.0.15版本

## 一、安装

### 服务器安装

1. 在安装前，请保证您的系统有以下软件

   - nodejs

     ```
     // 修改npm 的默认仓库位置
     npm config set registry http://registry.npm.taobao.org/
     
     // 安装pm2
     npm install pm2 -g
     ```

   - git

   - erlang

   - mysql

   - RabbitMQ

2. RabbitMQ配置

   - 整体修改RabbitMQ日志、数据、插件等的保存目录

   - 运行sysdm.cpl，启动系统设置

   - 系统环境变量中添加变量 RABBITMQ_BASE，变量值设置为您的目标目录。建议设置为D:\RabbitMQBase。

   - 删除RabbitMQ服务，然后再安装RabbitMQ服务。如果您的目标目录被建立，表示设置成功。

   - 启动RabbitMQ服务。

   - 在目录RabbitMQ Server\rabbitmq_server-3.7.17\sbin中打开命令窗口，运行

     ```
     rabbitmq-plugins enable rabbitmq_management
     ```

   - 在浏览器窗口访问127.0.0.1:15672，出现rabbitmq的登录界面，使用guest登录后，表示安装成功。（密码默认为gust）

3. mysql配置

   - 添加数据库tc_gather_cc和tc_gather_result
   - 添加用户weapp，赋予该用户以上两个数据库所有的操作权限

4. 初始化管理中心

   ```
   node init gsc
   node init gtc
   ```

5. 设置端口

   - 配置防火墙，开放 57701 端口（gsc）
   - 配置防火墙，开放5672端口（RabbitMQ）

### 情报站安装

1. 在开始安装前，请保证您的系统有以下软件

   - nodejs

     ```
     // 修改npm 的默认仓库位置
     npm config set registry http://registry.npm.taobao.org/
     ```

   - git

     windows 下载页面：<https://github.com/waylau/git-for-win> 

     centos 运行 yum install git，如果您的网络比较慢，或者按照过程有问题，可以先修改本地yum镜像

     ```
     // 备份本地镜像
     mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup
     
     // 下载新的CentOS-Base.repo 到/etc/yum.repos.d/
     wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
     
     // 运行以下命令生成缓存
     yum clean all
     yum makecache
     ```

     

2. 在目录<mydir>中运行

   ```
   git clone https://github.com/zy-hz/deploy-toucan-js.git ./
   ```

   从代码仓库拉取运行代码。安装成功后，<mydri>目录中有以下文件夹和文件

   ```
   libs
   init.js
   package.json
   ecosystem.config.js
   READEM.md
   start.js
   ```

   **注意：以下命令必须在<mydir>目录中运行**

3. 在<mydir>目录中打开命令窗口，运行 npm install -g cnpm --registry=https://registry.npm.taobao.org

4. 在<mydir>的命令窗口中运行 cnpm install (使用淘宝镜像安装速度快50%)

5. 在<mydir>的命令窗口中运行 cnpm i pm2 -g , 安装pm2管理工具

6. 在<mydir>的命令窗口中运行 pm2 install pm2-logrotate（日志管理插件，防止本地日志过大）

   **注意：是pm2 install 不是 npm install**

   pm2-logrotate是一款pm2的日志管理插件，可以防止本地日志文件过大。请用以下命令修改日志管理的配置：

   ```
   pm2 set pm2-logrotate:max_size 10M
   pm2 set pm2-logrotate:retain 7
   pm2 set pm2-logrotate:workerInterval 30 
   ```

7. 如果是centos环境，请运行以下命令，安装puppeteer依赖库

   ```
   yum install -y alsa-lib.x86_64 atk.x86_64 cups-libs.x86_64 GConf2.x86_64 gtk3.x86_64 ipa-gothic-fonts libXcomposite.x86_64 libXcursor.x86_64 libXdamage.x86_64 libXext.x86_64 libXi.x86_64 libXrandr.x86_64 libXScrnSaver.x86_64 libXtst.x86_64 pango.x86_64 wqy-unibit-fonts.noarch wqy-zenhei-fonts.noarch xorg-x11-fonts-100dpi xorg-x11-fonts-75dpi xorg-x11-fonts-cyrillic xorg-x11-fonts-misc xorg-x11-fonts-Type1 xorg-x11-utils
   ```

8. 在<mydir>目录中运行以下命令测试puppeteer，如果没有任何错误信息，表示安装正确

   ```
   node_modules/puppeteer/.local-chromium/linux-686378/chrome-linux/chrome --no-sandbox --disable-setuid-sandbox --headless
   ```

   

## 二、快速上手

​	当您安装完成后，就可以直接使用以下应用和微服务。

- [应用] - 采集情报站，简称gs
- [微服务] - 采集站点管理中心，简称gsc
- [微服务] - 采集任务管理中心，简称gtc

### A. 采集情报站

​	采集情报站是分布式采集系统中的工作端。负责执行服务器（采集任务管理中心）分发给自己的采集各类信息。同时把采集结果报告给服务器。在一个环境中，只能有一个采集情报站。如果您希望充分利用机器资源，建议您可以用docker方式在一台物理机器上部署多个容器，在每个容器中安装一个采集情报站。

​	请注意，无论用哪种方式部署情报站。您要保证每个情报站的机器名是唯一的。因为在集群工作模式中，采集站点管理中心使用机器名来认识每个采集情报站的。如果有重名，将导致某台情报站不能工作。假如，您计划采集情报站是独立运行，也就是说是单机模式，则不受这个要求限制。

1. 集群工作模式

   在该工作模式下，采集情报站的工作参数从服务器获得。在<mydri>目录中执行启动命令

   ```
   pm2 start --only gs
   ```

   情报站将从服务器211.149.224.49:57701，获得自己的配置（按照机器名区分）。**注意：情报站的机器名要在采集站点管理中心预先登记。**如果您需要指定其他的采集站点管理中心。可以编辑ecosystem.config.js文件修改情报站的启动参数。

   ```
   args: 'gs --remote 211.149.224.49:57701 --port 57721'
   ```

2. 单机工作模式

   **目前处于内部开发测试阶段，暂时不建议使用**

   在工作模式下，采集情报站就是一个独立的采集应用。可以配置不依赖任何服务器或者依赖个别服务器。一般是在开发测试中使用。在<mydri>目录中执行启动命令

   ```
   node start gs --conf myconf
   ```

   myconf是采集情报站的配置文件，位置位于<mydir>/../config/myconf.json。**注意：必须有.json的后缀名**

3. 定时工作计划

   情报站工作过程中，启用一些定时器执行定时任务，这些定时器说明如下

   | 定时器名称     | 工作时间 | 备注                                                      |
   | -------------- | -------- | --------------------------------------------------------- |
   | 同步情报站配置 | 每5分钟  | 从服务器获取本情报的配置，发现变更，重启服务（app不重启） |
   | 检查更新包     | 每10分钟 | 从代码库查看检查最新更新，发现更新，自动安装，重启app     |

4. 

### B. 采集站点管理中心

1. 初始化

   ```
   node init gsc
   ```

   

2. 启动

   ```
   pm2 start gsc
   ```

   

### C. 采集任务管理中心

1. 初始化

   ```
   node init gtc
   ```

   

2. 启动

   ```
   pm2 start gtc
   ```

   

## 三、采集任务导入

​	采集任务管理中心的配置文件中（gather-task-center.config.json），可以指定任务导入的方式。目前支持从目录导入采集任务，配置如下：

```
    "taskSource":[
        {
            "dbType":"dir",
            "dbVisitor":"../taskUpload",
            "sourceName":"任务上传目录"
        }
    ]
```

​	采集任务管理中心会自动扫描dbVisitor指定的目录，当发现有新的采集任务文件时，执行自动导入。扫描的间隔周期，可以在采集任务管理中的配置文件中配置，例如：

```

```

​	采集任务文件是一个json格式的文件，但是扩展名必须为.tsk，例如：

```
{
    "batchInfo":{
        "batchName":"我的全站采集",
        "batchComment":"",
        "batchOwner":"zy",
        "batchGroup":"开发",
        "batchTag":"测试"
    },
    "batchFormat":{
        "lineSplitChar":";",
        "lineFields":[
            "productId",
            "memberId",
            "shopUrl"
        ],
        "targetUrl":"http://shop.ttall.com/offer/${productId}.html"
    },
    "partition":{
        "segmentCount":2,
        "taskCount":0,
    },
	"batchOptions":{
		"resultQueueName":"result.zy.ttall",
		"storeTableName":"zy_ttall"
	},
	"datas":[
        "1423564;cn1;https://shop1.ttall.com",
        "5371230;cn2;https://shop2.ttall.com"
	]
}
```











##项目说明

1. ###文件目录结构

| 目录名称 | 目录说明                                             |
| -------- | ---------------------------------------------------- |
| demo     | 一些使用示例，最好的上手指南                         |
| docs     | 开发中的设计文档，不看也罢。有蜘蛛配置指南，可以参考 |
| libs     | 库源码                                               |
| test     | 单元测试                                             |


2. ###功能
  
- 115 - 在载入任务时，指定结果消息通道和结果存储表名
- 114 - bodani全站采集
- 113 - 添加demo，19lou，bodani
- 112 - 采集结果可以按照指定存储方式存储，目前支持：dir | tc-mysql
- 111 - 蜘蛛可以指定采集结果队列
- 110 - 采集站点（情报站）报告自己的版本
- 109 - 自动更新
- 108 - 支持github部署
- 107 - 在采集结果中添加站点信息
- 106 - 采集任务管理中心数据库支持 
- 105 - 采集站点从管理中心获得运行配置
- 104 - 新增采集站管理中心
- 103 - 新增浏览器模式获得饿了么店铺信息
- 102 - 新增elm相关功能，饿了么店铺列表蜘蛛 （关闭：不能使用api访问）

3. ###问题

- 100 - 上传超大文件，大于100万记录的时候，大概率出现导入异常 
- 101 - [fixed]centos系统，情报站不能启动chrome
- 102 - [fixed]controllers目录不存在的时候，导致启动服务出现错误
- 103 - [fixed]在一些机器上git更新后，不会自动启动
- 104 - [fixed]centos系统的情报站，在自动更新重启后，提示stationKey不匹配
- 105 - [fixed]ER_TRUNCATED_WRONG_VALUE_FOR_FIELD，不支持utf8mb4格式
- 106 - [fixed]windows-1252 页面不能解码


## 测试方案

采用mock为测试框架，设置4类测试方案：

1. 临时测试方案，标记为 temp

   该方案是在开发过程中使用，在descript或者it中标题中添加temp标记。同时在启动时，选择“Temp 测试指定用例 ”。

2. 快速测试方法，标记为空

   该方案时默认方案。启动时，选择“Fast 测试 ”。一些必要的，基础的测试，一定需要覆盖的测试。如果发现错误，就立刻停止。

3. 长时间测试方案，标记为[long]

   该方案用来标记花费比较长时间的测试用例，在descript或者it中标题中添加long标记。同时在启动时，选择“Long 测试 ”。如果发现错误，还继续进行，直到所有标记为long的测试用例执行完毕。

4. 演示方案（忽略测试），标记为[demo]

   如果只希望在调试阶段使用，而在全面测试用不使用，可以在descript或者it中标题中添加demo标记。这样在其他测试中就会被忽略

5. 全面测试

   该方案时快速测试+长时间测试的方案总和。测试过程中会发现错误后，记录错误后跳过，最后给出一个综合报告

## 注意事项

1. mysql 编码错误：ER_TRUNCATED_WRONG_VALUE_FOR_FIELD: Incorrect string value

   MySQL的utf8编码只支持3字节的数据，而移动端的表情数据是4个字节的字符。如果直接往采用utf-8编码的数据库中插入表情数据，程序中将报SQL异常。

   





