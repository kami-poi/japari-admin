<h1 align="center">
  <br>
  <br>
  加帕里动物管理员
  <h4 align="center">
    一个简单的基于coolq-http-api的: 会复读, 可响应指令, OSU!信息查询 qqbot. 插件化开发
  </h4>
  <!-- <h5 align="center">
    <a href="#license">开源条款</a>
  </h5> -->
  <br>
  <br>
  <br>
</h1>

### 目前支持的功能(插件)
1. 连续复读: 当某一群组中出现连续三次相同的内容时, 复读内容
2. 随机复读: 对某一群组内的聊天内容进行随机复读, 可为每个群设置不同的复读概率
3. 指令识别: 对 __!xxx__ 格式的指令进行识别, 并做出响应
4. 入群提示: 新人入群时提醒
...完善中

#### 支持的指令(指令识别插件的插件)
1. auth: 查看你的权限
2. help: 查看所有指令或者某特定指令的使用方法
3. pr: prprprpr
4. fd: 设置随机复读概率
5. roll: 同OSU中的roll
6. save: 固化群聊配置到数据库(目前仅支持储存随机复读概率)
7. newNotice 配置入群提醒模板

...完善中

##### osu特有指令

1. bp: 查询osu! bp
2. bpme: 查看osu!所绑定账号的bp
3. recent: 查询osu!最近游玩记录
4. unbind: 解绑osu!账号

...完善中


### 插件模组设计思路

与1.0版本不同, 2.0引入了插件可配置方案

从路由顶部开始分类上报事件, group:群聊, private:私聊, notice:通知, request 暂时不支持响应

PluginService 为插件服务类, 负责所有插件的获取/加载/分类/运行 操作

(如果要做成群聊插件可配置, 举个例子, 入群提醒属于notice事件插件, 但是对于群聊来说是不可配置的, 因为没设计相关逻辑, 如果要可配置, 需要在添加一种配置项, 为通知类插件配置, 违背了只让群管理维护一套插件列表的设计初衷, 放弃方案, 以下为原先设计)

~~服务启动时, 服务类会从 plugins 文件夹内读取并初始化(如果存在则 sync 执行插件的 createTable 和 init 方法), 根据插件的 type 所属事件类型, 以 { plugin.name: plugin } 的形式, 维护在 PluginService.plugins.group/private/notice 中~~


~~之后服务会 load 并根据权重排序个性化插件配置信息, 为最大限度的节省内存占用和提高运行速度, 存储群配置信息只存插件名~~

~~群聊插件配置信息从数据库一次性读取, 维护在 PluginService.pluginConfigs.group 中, Map 结构, key 为 group_id, value 为按权重 plugin.weight 排序过的 Array, 内容是插件名称~~

~~私聊插件配置信息维护在 PluginService.pluginConfigs.private 中, 数组形式保存, 值同理为权重排序过的 Array (第一版可设计为不可配置, 直接从 PluginService.plugins.private 中获取全部插件名)~~

~~通知只有群聊会接受到, 所以通知插件因为配置信息数据结构与群聊相同, 维护在 PluginService.pluginConfigs.event 中~~

#### 群可配置插件新方案:

服务启动时, 服务类会从 plugins 文件夹内读取并初始化(如果存在则 sync 执行插件的 createTable 和 init 方法), 根据插件的 type 所属事件类型, 以数组形式, 维护在 PluginService.plugins.group/private/notice 中

服务器启动时会加载所有插件, 收到消息会按照上报类型里的插件列表按权重依次执行, 为了实现可配置, 在执行插件外包装是否执行的逻辑, 根据群所配置的插件名, 如果当前执行到的插件名称没有出现在群配置列表里, 则直接跳过

群配置信息一次性从数据库读取, 存储在 PluginService.groupConfigs 中, { group_id: { plugin.name: true } } 形式, 因为从数据库读出来的群插件配置是数组形式的, 为了保证响应速度, 改成Map的形式存储, hash比Array查找快得多

此方案相比作废的方案更好理解, 但存在些许性能问题, 如果启动的插件过多, 会导致循环列表过长, 时间效率较低, 相当于一种用时间换空间的方案, 但考虑到, 如指令响应之类的插件有阻断后续插件执行的功能, 日常操作操作时几乎不会走完全部插件列表, 估计对性能影响并不会太大


#### 实际情况分析

新加入的群, 群插件配置查找不到, 使用 config.js 中的默认配置, 直接拍在 PluginService.groupConfig 中, 同时异步添加群默认配置至数据库, 

预测可能会出现响应过频繁, 导致数据库重复创建新字段的情况, 思考后发现只会在单机集群时才会出现, 可暂时放一放

#### 权限管理相关:

私聊插件

1. 由管理员配置, 管理员列表在 config.js 配置, ADMIN字段
2. 分级别, 管理员展示的列表和普通用户的列表不同

群聊插件

1. 群管理和群主有权配置, 配置完成后写入数据库
2. 暂时设计只能通过群指令配置, 后续可能有专门的配置页


### 指令插件模组设计思路

指令结构和1.0版本相同, 都是 !x y (x 为长度大于2的英文单词, y 为指令参数)

新指令分为三种类型(type): 通用=all, 私聊=private, 群聊=group

有三种权限等级(level): 普通=1, 群管理员=2, 系统管理员=3, 群管理员指令权限在私聊模式下不存在, 默认识别为普通模式

初始化时, 会将所有的指令对象引用以{ command.command: command } (指令名: 对象) 的形式维护在 CommandRunner.command.private/group 中, type=all的指令, 两个里面都放

CommandRunner 执行时, 按照数据类型, 分别走私聊和群聊不同的逻辑, 直接在 CommandRunner 层判断指令是否存在, 如不存在直接响应不存在并 break 插件循环

Command类构造时, 如果为私聊且 level=2, 则先将 level 置为1, 因为私聊没有群管理级别





