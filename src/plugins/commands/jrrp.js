import { Command } from '../../decorators/plugin';
import QQService from '../../services/qq-service';

@Command({
  name: "jrrp",
  command: "jrrp",
  type: "all",
  info: "������Ʒ���",
  level: 1
})
class Jrrp {
  run(body, type) {
    var seed = body.user_id + getDate() + getMonth() + getFullYear();
    var result = "";
    var rp = myRand(seed);

    if (body.sender.card) {
      result += body.sender.card + "\n";
    } else {
      result += body.sender.nickname + "\n";
    }
    result += "��������ƷΪ��";
    result += rp.toString();
    if (rp <= 15) {
      result += "�����ס�";
    } else if (rp <= 30) {
      result += "���ס�";
    } else if (rp <= 50) {
      result += "��ĩ����";
    }
    else if (rp <= 60) {
      result += "��С����";
    }
    else if (rp <= 80) {
      result += "���м���";
    } else if(rp >=90) {
      result += "���󼪡�";
    }

    if (type === "group") {
      QQService.sendGroupMessage(body.group_id, result);
    }
    if (type === "private") {
      QQService.sendPrivateMessage(body.user_id, result);
    }
  }

  myRand (seed) {
    return Math.sin(seed) * 100;
  }
}