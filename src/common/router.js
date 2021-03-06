import React, { createElement } from "react";
import { Spin } from "antd";
import pathToRegexp from "path-to-regexp";
import Loadable from "react-loadable";
import { getMenuData } from "./menu";
import ExportAll from "../routes/ExportAll";

let routerDataCache;

const modelNotExisted = (app, model) =>
  // eslint-disable-next-line
  !app._models.some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf("/") + 1);
  });

// wrapper of dynamic
const dynamicWrapper = (app, models, component) => {
  // register models
  models.forEach(model => {
    if (modelNotExisted(app, model)) {
      // eslint-disable-next-line
      app.model(require(`../models/${model}`).default);
    }
  });

  // () => require('module')
  // transformed by babel-plugin-dynamic-import-node-sync
  if (component.toString().indexOf(".then(") < 0) {
    return props => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return createElement(component().default, {
        ...props,
        routerData: routerDataCache
      });
    };
  }
  // () => import('module')
  return Loadable({
    loader: () => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return component().then(raw => {
        const Component = raw.default || raw;
        return props =>
          createElement(Component, {
            ...props,
            routerData: routerDataCache
          });
      });
    },
    loading: () => {
      return <Spin size="large" className="global-spin" />;
    }
  });
};

function getFlatMenuData(menus) {
  let keys = {};
  menus.forEach(item => {
    if (item.children) {
      keys[item.path] = { ...item };
      keys = { ...keys, ...getFlatMenuData(item.children) };
    } else {
      keys[item.path] = { ...item };
    }
  });
  return keys;
}

export const getRouterData = app => {
  const routerConfig = {
    "/": {
      component: dynamicWrapper(app, ["user", "login"], () =>
        import("../layouts/BasicLayout")
      )
    },
    "/resource/resource": {
      component: dynamicWrapper(app, [], () =>
        import("../routes/Resource/resource")
      )
    },
    "/resource/havaplan": {
      component: dynamicWrapper(app, ["customer"], () =>
        import("../routes/havePlan/havePlan")
      )
    },
    "/resource/removeplan": {
      component: dynamicWrapper(app, ["customer"], () =>
        import("../routes/removePlan/removePlan")
      )
    },
    "/notification/resource": {
      component: dynamicWrapper(app, [], () =>
        import("../routes/Notification/Resource")
      )
    },
    "/notification/havaplan": {
      component: dynamicWrapper(app, ["customer"], () =>
        import("../routes/Notification/HavaPlan")
      )
    },
    "/notification/removeplan": {
      component: dynamicWrapper(app, ["customer"], () =>
        import("../routes/Notification/RemovePlan")
      )
    },
    "/weibo/resource": {
      component: dynamicWrapper(app, [], () =>
        import("../routes/Weibo/Resource")
      )
    },
    "/weibo/havaplan": {
      component: dynamicWrapper(app, ["customer"], () =>
        import("../routes/Weibo/HavaPlan")
      )
    },
    "/weibo/removeplan": {
      component: dynamicWrapper(app, ["customer"], () =>
        import("../routes/Weibo/RemovePlan")
      )
    },
    "/play/resource": {
      component: dynamicWrapper(app, [], () =>
        import("../routes/Play/Resource")
      )
    },
    "/play/havaplan": {
      component: dynamicWrapper(app, ["customer"], () =>
        import("../routes/Play/HavaPlan")
      )
    },
    "/play/removeplan": {
      component: dynamicWrapper(app, ["customer"], () =>
        import("../routes/Play/RemovePlan")
      )
    },
    "/colonel/resource": {
      component: dynamicWrapper(app, [], () =>
        import("../routes/Colonel/Resource")
      )
    },
    "/colonel/havaplan": {
      component: dynamicWrapper(app, ["customer"], () =>
        import("../routes/Colonel/HavaPlan")
      )
    },
    "/colonel/removeplan": {
      component: dynamicWrapper(app, ["customer"], () =>
        import("../routes/Colonel/RemovePlan")
      )
    },
    "/camera/resource": {
      component: dynamicWrapper(app, [], () =>
        import("../routes/Camera/Resource")
      )
    },
    "/camera/havaplan": {
      component: dynamicWrapper(app, ["customer"], () =>
        import("../routes/Camera/HavaPlan")
      )
    },
    "/camera/removeplan": {
      component: dynamicWrapper(app, ["customer"], () =>
        import("../routes/Camera/RemovePlan")
      )
    },
    "/customer/customer": {
      component: dynamicWrapper(app, ["customer"], () =>
        import("../routes/Customer/customer")
      )
    },
    "/customer/publicresource": {
      component: dynamicWrapper(app, ["customer"], () =>
        import("../routes/PublicResource/PublicResource")
      )
    },
    "/system/modifypassword": {
      component: dynamicWrapper(app, ["customer"], () =>
        import("../routes/ModifyPassword/ModifyPassword")
      )
    },
    "/system/account": {
      component: dynamicWrapper(app, ["customer"], () =>
        import("../routes/Account/Account")
      )
    },
    "/exportAll": {
      component: ExportAll
    },
    "/exception/403": {
      component: dynamicWrapper(app, [], () =>
        import("../routes/Exception/403")
      )
    },
    "/exception/404": {
      component: dynamicWrapper(app, [], () =>
        import("../routes/Exception/404")
      )
    },
    "/exception/500": {
      component: dynamicWrapper(app, [], () =>
        import("../routes/Exception/500")
      )
    },
    "/exception/trigger": {
      component: dynamicWrapper(app, ["error"], () =>
        import("../routes/Exception/triggerException")
      )
    },
    "/user": {
      component: dynamicWrapper(app, [], () => import("../layouts/UserLayout"))
    },
    "/user/login": {
      component: dynamicWrapper(app, ["login"], () =>
        import("../routes/User/Login")
      )
    },
    "/upload": {
      component: dynamicWrapper(app, ["login"], () =>
        import("../routes/upload")
      )
    },
    "/system/author": {
      component: dynamicWrapper(app, ["login"], () =>
        import("../routes/Author/author")
      )
    },
    "/system/dept": {
      component: dynamicWrapper(app, ["login"], () =>
        import("../routes/Dept/dept")
      )
    },
    "/system/change": {
      component: dynamicWrapper(app, ["login"], () =>
        import("../routes/Change/index")
      )
    }
  };
  // Get name from ./menu.js or just set it in the router data.
  const menuData = getFlatMenuData(getMenuData());

  // Route configuration data
  // eg. {name,authority ...routerConfig }
  const routerData = {};
  // The route matches the menu
  Object.keys(routerConfig).forEach(path => {
    // Regular match item name
    // eg.  router /user/:id === /user/chen
    const pathRegexp = pathToRegexp(path);
    const menuKey = Object.keys(menuData).find(key =>
      pathRegexp.test(`${key}`)
    );
    let menuItem = {};
    // If menuKey is not empty
    if (menuKey) {
      menuItem = menuData[menuKey];
    }
    let router = routerConfig[path];
    // If you need to configure complex parameter routing,
    // https://github.com/ant-design/ant-design-pro-site/blob/master/docs/router-and-nav.md#%E5%B8%A6%E5%8F%82%E6%95%B0%E7%9A%84%E8%B7%AF%E7%94%B1%E8%8F%9C%E5%8D%95
    // eg . /list/:type/user/info/:id
    router = {
      ...router,
      name: router.name || menuItem.name,
      authority: router.authority || menuItem.authority,
      hideInBreadcrumb: router.hideInBreadcrumb || menuItem.hideInBreadcrumb
    };
    routerData[path] = router;
  });
  return routerData;
};
