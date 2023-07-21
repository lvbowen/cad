import Vue from 'vue';
import Router from 'vue-router';

import VueHtmlToPaper from 'vue-html-to-paper';

import App from './App.vue';
import store from './store';
import i18n from './config/i18n';
import axios from 'axios';

//局部引入存在声明冲突的组件
//@h3/antd-vue 和 ant-design-vue
import FormModel from 'ant-design-vue/lib/form-model';
import 'ant-design-vue/lib/form-model/style/index.less';

import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.less';

import Table from 'element-ui/lib/table';
import TableColumn from 'element-ui/lib/table-column';
import Scrollbar from 'element-ui/lib/scrollbar';
import Button from 'element-ui/lib/button';
import Dialog from 'element-ui/lib/dialog';
import "element-ui/lib/theme-chalk/index.css";
import echarts from 'echarts/lib/echarts';

//基础图表
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/radar';
//tools
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/legendScroll';

import XEUtils from "xe-utils";
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'
import VXETablePluginVirtualTree from 'vxe-table-plugin-virtual-tree'
import 'vxe-table-plugin-virtual-tree/dist/style.css'

Vue.prototype.$echarts = echarts
//register
Vue.use(FormModel);
Vue.use(Input);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Scrollbar);
Vue.use(Button);
Vue.use(Dialog);
Vue.use(VXETable);
VXETable.use(VXETablePluginVirtualTree);
/*Vue.use(Header).use(Column).use(List).use(XTable);*/

// // 引入自定义指令
// import directives from './directives';

import env from '@/config/env';

import routes from './routes';

import * as platform from '@cloudpivot/platform';


import './config/api';
import './config/antd';

import './styles/index.less';
import Utils from "../extends/utils";

let importReportService = false;

/**
 * 页面禁用拖拽上传时 浏览器默认打开图片
 */
document.addEventListener('drop', function (e) {
  e.preventDefault()
}, false)

document.addEventListener('dragover', function (e) {
  e.preventDefault()
}, false)


export async function startup(environment: any) {

  // 地址参数上携带access_token的，将token存在localstorage并清理地址上的参数
  if (environment && environment.access_token) {
    // 通过token获取refresh_token，实现token续期
    await axios.post(`${env.apiHost}/login/Authentication/get_refresh_token`, {access_token: environment.access_token}).then((res: any) => {
      if (res.errcode === 0 && res.data) {
        const refresh_tokens = (res as any).data.refresh_token;
        let expireTime = (res as any).data.expiration;

        // 时间戳如果为13位则单位是ms,把单位转为s
        if (expireTime.toString().length === 13) {
          expireTime = expireTime.toString().slice(0, -3);
        }

        localStorage.setItem('refresh_token', refresh_tokens);
        localStorage.setItem('expireTime', expireTime);
      }
    });
    //打开表单详情时不清理access_token, 原因为 解决钉钉打开流程表单点击同意后不关闭页面问题
    if (!window.location.href.includes('/form/detail?')) {
      const url = decodeURIComponent(window.location.href).replace('&access_token', 'access_token');
      window.location.href = url.replace(`access_token=${environment.access_token}`, '');
    }
  }

  window.Environment = environment;
  window.Environment.isIe = /Trident/.test(navigator.userAgent);

  Vue.config.productionTip = false;
  Vue.use(Router);

  Vue.use(VueHtmlToPaper);

  // 单应用路由
  if (window.Environment.appCode) {
    ((routes[0]) as any).redirect = '/app-home';
  } else if (window.Environment.messageId) {
    // 消息路由
  }

  const router = new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
  });

  Vue.prototype.router = router;

  router.beforeEach((to: any, from: any, next: any) => {
    if (window.location.href.indexOf('mobile')>-1 && window.location.href.indexOf('param')>-1) {
      next()
    }
    let title = window.localStorage.getItem('projectTitle') ?? '';
    if (to.meta && to.meta.title) {
      title = to.meta.title
    }
    platform.service.setTitle(title);
    if (to.name === 'appReport' && !importReportService) {
      importReportService = true;
      import('@/views/applications/report-service');
    }
    if (to.name === 'applicationReport' && !importReportService) {
      importReportService = true;
      import('@/views/applications/report-service');
    }

    if (to.name === 'applicationReport' && !importReportService) {
      importReportService = true;
      import('@/views/applications/report-service');
    }
    console.log(Utils.GetRequest(),'startUp',)
    const url:any = Utils.GetRequest();
    if(url.hasOwnProperty('accessToken')) {
      localStorage.setItem('token', url.accessToken);
    }
    const token = localStorage.getItem('token');
    if (Vue.prototype.$httpRequestList.length > 0) {        //强行中断时才向下执行
      Vue.prototype.$httpRequestList.forEach((item: any) => {
        // item('interrupt');//给个标志，中断请求
      })
    }
    if (env.enableProxy) {
      next();
    } else {
      // document.title = to.meta.title;
      if (!token && to.name !== 'login' && to.name !== 'oauth') {
        // alert(JSON.stringify(to));
        // window.location.href = '/login';
        if(to.name==="loginExternal"){
          next();
        }else if(window.location.href.indexOf('RelayRoute')>-1) {
          next()
        }else if(window.location.href.indexOf('administratorLogin')>-1) {
          next()
        }else{
          next({name: 'login'});
        }
      } else {
        next();
      }
    }
  });

  // 全局注册自定义指令
  // Object.entries(directives).forEach((directive: any) => {
  //     const directiveName = directive[0];
  //     const directiveFunc = directive[1];
  //     Vue.directive(directiveName, directiveFunc);
  // });

  new Vue({
    router,
    i18n,
    store,
    render: (h: any) => h(App),
  }).$mount('#app');

}
