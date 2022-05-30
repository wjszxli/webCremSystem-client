/* eslint-disable comma-dangle */
import { isUrl } from "../utils/utils";

const menuData = [
  {
    name: "公众号资源库",
    icon: "dashboard",
    path: "resource",
    children: [
      {
        name: "公众号资源库",
        path: "resource"
      },
      {
        name: "公众号排期列表",
        path: "havaplan"
      },
      {
        name: "已作废排期限",
        path: "removeplan"
      }
    ]
  },
  {
    name: "直播资源库",
    icon: "notification",
    path: "notification",
    children: [
      {
        name: "直播资源库",
        path: "resource"
      },
      {
        name: "直播排期列表",
        path: "havaplan"
      },
      {
        name: "作废排期",
        path: "removeplan"
      }
    ]
  },
  {
    name: "短视频资源库",
    icon: "play-circle",
    path: "play",
    children: [
      {
        name: "短视频资源库",
        path: "resource"
      },
      {
        name: "短视频排期列表",
        path: "havaplan"
      }
    ]
  },
  {
    name: "团长纯佣资源库",
    icon: "area-chart",
    path: "colonel",
    children: [
      {
        name: "团长纯佣资源库",
        path: "resource"
      },
      {
        name: "团长纯佣排期列表",
        path: "havaplan"
      }
    ]
  },
  {
    name: "微博资源库",
    icon: "weibo",
    path: "weibo",
    children: [
      {
        name: "微博资源库",
        path: "resource"
      },
      {
        name: "微博排期列表",
        path: "havaplan"
      },
      {
        name: "作废排期",
        path: "removeplan"
      }
    ]
  },
  {
    name: "视频号资源库",
    icon: "camera",
    path: "camera",
    children: [
      {
        name: "视频号资源库",
        path: "resource"
      },
      {
        name: "视频号排期列表",
        path: "havaplan"
      }
    ]
  },
  {
    name: "客户资源",
    icon: "form",
    path: "customer",
    children: [
      {
        name: "客户录入",
        path: "customer"
      },
      {
        name: "公共资源库",
        path: "publicresource"
      }
    ]
  },
  {
    name: "系统设置",
    icon: "table",
    path: "system",
    children: [
      {
        name: "修改密码",
        path: "modifypassword"
      },
      {
        name: "部门管理",
        path: "dept"
      },
      {
        name: "账号管理",
        path: "account"
      },
      {
        name: "管理权限",
        path: "author"
      },
      {
        name: "数据迁移",
        path: "change"
      }
    ]
  }
];

function formatter(data, parentPath = "/", parentAuthority) {
  return data.map(item => {
    let { path } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result = {
      ...item,
      path,
      authority: item.authority || parentAuthority
    };
    if (item.children) {
      result.children = formatter(
        item.children,
        `${parentPath}${item.path}/`,
        item.authority
      );
    }
    return result;
  });
}

export const getMenuData = () => formatter(menuData);
