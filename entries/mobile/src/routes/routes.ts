import common from '@cloudpivot/common/mobile';
import homeWorkitems from '@/views/home/workitems.vue';

export default {

  home: {
    path: '/',
    redirect: 'business'
  },
  login: {
    path: '/login',
    name: 'login',
    meta: {
      hideFootbar: true,
    },
    component: () => import('@/views/login/login.vue')
  },
  apps: {
    path: '/apps',
    name: 'apps',
    //new Add
    isNav: false,
    locale:'languages.common.business',
    navIndex:4,
    //end
    meta: { title: '应用列表', titleKey: 'apps', hideFootbar: false},
    component: () => import('@/views/apps/index.vue'),
    children:[
      {
        path: 'workbench',
        name: 'workbench',
        component: () => import('../../extends/businessComponent/Workbench/Workbench')
      },
      {
        path: 'eachWorkbench',
        name: 'eachWorkbench',
        component: () => import('../../extends/businessComponent/Workbench/Workbench')
      }
    ]
  },
  'app-item': {
    path: '/app-item/:appCode',
    name: 'app-item',
    meta: { title: '应用详情', titleKey: 'app-item' },
    component: () => import('@/views/apps/app-item.vue')
  },
  'initial-item': {
    path: '/initial-item/:appCode',
    name: 'initial-item',
    meta: { title: '应用详情', titleKey: 'initial-item', hideFootbar: true },
    component: () => import('@/views/initial-instance/initial-item.vue')
  },
  'my-instances': {
    path: '/my-instances',
    name: 'my-instances',
    meta: {
      title: '我的流程',
      titleKey: 'workflows',
      hideFootbar: false,
    },
    component: () => import('@/views/my-instances/index.vue')
  },
  'form-detail': {
    path: '/form/detail',
    name: 'form-detail',
    props: true,
    meta: {
      hideFootbar: true,
    },
    component: () => import(/* webpackChunkName: "form-detail" */'@/views/form/form-detail.vue')
  },
  'form-empty': {
    path: '/form/empty',
    name: 'form-empty',
    props: true,
    meta: {
      hideFootbar: true,
    },
    component: () => import('@/views/form/empty.vue')
  },
  'custom-page': {
    path: '/custom-page',
    name: 'custom-page',
    props: true,
    meta: {
      hideFootbar: true,
    },
    component: () => import('@/views/customPage/index.vue')
  },
  formUnpublished: {
    path: '/form-unpublished',
    name: 'formUnpublished',
    props: true,
    meta: {
      hideFootbar: true,
    },
    component: common.components.FormUnpublished
  },
  permission: {
    path: '/permission',
    name: 'permission',
    props: true,
    meta: {
      hideFootbar: true,
      title: '无权限'
    },
    component: () => import('@/components/global/permission/permission.vue')
  },
  flowTrack: {
    path: '/form/workflow-track/:workflowInstanceId/:workItemId/',
    name: 'flowTrack',
    meta: {
      hideFootbar: true,
      title: '流程跟踪',
      titleKey: 'workflowTrack'
    },
    component: () => import('@/views/form/workflow-track.vue')
  },
  FormApproval: {
    path: '/form/approval/:workflowInstanceId',
    name: 'FormApproval',
    meta: {
      hideFootbar: true,
      title: '流程跟踪',
      titleKey: 'workflowTrack'
    },
    component: () => import('@/views/form/workflow-track.vue')
  },
  FormApprovalDetails: {
    path: '/form/approval-details',
    name: 'FormApprovalDetails',
    meta: {
      hideFootbar: true,
      title: '流程跟踪',
      titleKey: 'workflowTrack'
    },
    component: () => import('@/views/form/form-approval-details.vue')
  },
  FormReadDetails: {
    path: '/form/read-details',
    name: 'FormReadDetails',
    meta: {
      hideFootbar: true,
      title: '流程跟踪',
      titleKey: 'workflowTrack'
    },
    component: () => import('@/views/form/form-read-details.vue')
  },
  'initial-instance': {
    path: '/home/initial-instance',
    name: 'initial-instance',
    meta: {
      title: '发起流程',
      titleKey: 'startWorkflow',
    },
    component: () => import('@/views/initial-instance/index.vue')
  },
  'batch-opt':{
    path: '/home/batch-opt',// 待办项增加批量处理功能
    name: 'batch-opt',
    meta: {
      title: '批量处理',
      titleKey: 'batchOpt',
      hideFootbar: true
    },
    component: ()=> import('@/views/home/batch-opt.vue')
  },
  'apps-form-list': {
    path: '/apps/apps-form-list/:schemaCode',
    name: 'apps-form-list',
    meta: { hideFootbar: true, title: '应用列表', titleKey: 'apps' },
    component: () => import('@/views/apps/app-form-list.vue')
  },
  'apps-report': {
    path: '/apps/:appCode/report/:reportCode',
    name: 'apps-report',
    meta: { hideFootbar: true, title: '应用报表', titleKey: 'apps' },
    component: () => import('@/views/apps/app-report.vue')
  },
  custom: {
    path: '/apps/custom',
    name: 'custom',
    meta: { hideFootbar: true, title: 'test' },
    component: () => import('@/views/apps/custom-router-page/test.vue')
  },


  singleApp: {
    path: '/singleApp',
    name: 'singleApp',
    meta: { hideFootbar: true, title: '应用列表', titleKey: 'apps' },
    component: () => import('@/views/single-app/index.vue')
  },


  homepage: {
    root: {
      path: '/home',
      name: 'home',
      //new Add
      isNav:true,
      locale:'languages.common.homePage',
      navIndex:0,
      //end
      redirect: { name: 'workitems' },
      // component: homeIndex,
      component: () => import('@/views/home/index.vue'),
      // component: homeIndex,
    },
    workitems: {
      path: '/home/workitems',
      name: 'workitems',
      meta: {
        title: '待办',
        titleKey: 'todo'
      },
      component: homeWorkitems
      // component: () => import('@/views/home/workitems.vue')
    },
    circulates: {
      path: '/home/circulates',
      name: 'circulates',
      meta: {
        title: '待阅',
        titleKey: 'toread'
      },
      component: () => import('@/views/home/circulates.vue')
    },
    'finished-circulates': {
      path: '/home/finished-circulates',
      name: 'finished-circulates',
      meta: {
        title: '已阅',
        titleKey: 'read'
      },
      component: () => import('@/views/home/finished-circulates.vue')
    },
    'finished-workitems': {
      path: '/home/finished-workitems',
      name: 'finished-workitems',
      meta: {
        title: '已办',
        titleKey: 'done'
      },
      component: () => import('@/views/home/finished-workitems.vue')
    }

  },

  // meeting: {
  //     meetingsQRCode: {

  //     }
  // }

  // 设置页面
  setting: {
    path: '/setting',
    name: 'setting',
    meta: {
      hideFootbar: false,
      title: '设置',
      titleKey: 'settings'
    },
    component: () => import('@/views/setting/setting.vue')
  }
}
