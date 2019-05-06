import Config from '../../config';
import { Command } from '../../decorators/plugin';
import QQService from '../../services/qq-service';

@Command({
  name: '帮助',
  command: 'help',
  type: 'all',
  info: "用来查看所有指令或者某特定指令的使用方法的指令, '!help 指令名' 来调用",
  default: true,
  level: 1
})
class Help {
  getCommandInstance(commandName, body, commandMap) {
    const isAdmin = Config.ADMINS.indexOf(body.user_id) > -1;
    const commandInstance = commandMap[commandName];
    if (commandInstance.level === 3) {
      return isAdmin ? commandInstance : null;
    }
    return commandInstance;
  }

  showOne(commandName, body, commandMap) {
    const instance = this.getCommandInstance(commandName, body, commandMap);
    if (instance) {
      const { name, command, info } = instance;
      return `指令名: ${name}\ncommand: ${command}\n描述: ${info || '无描述'}`;
    }
    return `指令'${commandName}'不存在或被隐藏`;
  }

  showAll(body, commandMap) {
    let content = "可用指令: (使用'!help 指令名'可查看详细用法)";
    Object.keys(commandMap).forEach((name) => {
      const instance = this.getCommandInstance(name, body, commandMap);
      if (instance) {
        content += `\n!${instance.command}  ${instance.info || ''}`;
      }
    });
    return content;
  }

  trigger(params, body, type, commandMap) {
    const commandName = params;
    let content;
    if (commandName) {
      content = this.showOne(commandName, body, commandMap);
    } else {
      content = this.showAll(body, commandMap);
    }
    if (type === 'group') {
      QQService.sendGroupMessage(body.group_id, content);
    } else if (type === 'private') {
      QQService.sendPrivateMessage(body.user_id, content);
    }
  }
}

export default Help;