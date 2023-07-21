import RouterView from '@/views/common-view/index.vue';

import * as  applicationList from '@cloudpivot/list';

import * as flow from "@cloudpivot/flow";

import site from '@/config/site';

export default {
  home: {
    path: '/',
      // redirect: 'home'
    meta: {
      hideFootbar: true,
      title: ' '
    }
  },
  'form-detail': {
    path: '/form/external-link',
    name: 'form-detail',
    props: true,
    meta: {
      hideFootbar: true,
      title: ' '
    },
    component: () => import('@/views/form/form-detail.vue')
  },
  FormApproval: {
    path: '/form/approval/:workflowInstanceId',
    name: 'FormApproval',
    meta: {
      hideFootbar: true,
      title: ' ',
      titleKey: 'workflowTrack'
    },
    component: () => import('@/views/form/workflow-track.vue')
  },
  sharedSuccess: {
    path: '/shared/success/:shortCode',
    name: 'shared-success',
    props: true,
    meta: {
      hideFootbar: true,
      title: ' '
    },
    component: () => import('../components/success/success.vue')
  },
}
