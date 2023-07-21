export interface Cockpit {
  name: string,
  routeName: string,
  icon: string,
  iconName?: string,
}

// @ts-ignore
const assetsPath: (fileName: string) => string = (fileName) => require(`../../src/assets/extends/${fileName}`);

export const CockPitConfig: Map<number, Cockpit> = new Map([
  [
    0,
    {
      name: '信息门户',
      routeName: 'InformationPortal',
      icon: assetsPath('informationPortal2.png'),
      iconName: 'infoHeader',
    }
  ],
  [
    1,
    {
      name: '数据中心',
      routeName: 'DataHome',
      icon: assetsPath('dataCenter.png'),
      iconName: 'manageHeader',
    }
  ],
  [
    2,
    {
      name: '业务平台',
      routeName: 'workbench',
      icon: assetsPath('businessPlatform.png'),
      iconName: 'busHeader',
    }
  ],
  [
    3,
    {
      name: '管理平台',
      routeName: 'ManageViews',
      icon: assetsPath('dataCenter.png'),
      iconName: 'manageHeader',
    }
  ],
  [
    4,
    {
      name: 'BIM平台',
      /*routeName: 'BIMPlatform',*/
      routeName: 'BIMView',
      icon: assetsPath('modeBIM.png'),
      iconName: 'bimHeader',
    }
  ],
  [
    5,
    {
      name: '视频监控',
      routeName: 'MonitorPlatform',
      icon: assetsPath('monitor.png'),
      iconName: 'monitorHeader',
    }
  ],
  [
   6,
    {
      name: '数字孪生',
      routeName: 'multiProject',
      icon: assetsPath('monitor.png'),
      iconName: 'monitorHeader',
    }
  ]
]);

