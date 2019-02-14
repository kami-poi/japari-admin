# 加帕里动物管理员

## 一个简单的基于coolq-http-api的: 会复读, 可响应指令, OSU!信息查询 qqbot. 插件化开发

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