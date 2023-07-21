import Vue from 'vue';
import VueAMap from 'vue-amap';

Vue.use(VueAMap);

VueAMap.initAMapApiLoader({
  key: 'a99e76b049842471913fd61c023dfd95',
  plugin: ['Geocoder', 'AMap.Geolocation', 'AMap.Autocomplete', 'AMap.PlaceSearch', 'AMap.Scale', 'AMap.OverView', 'AMap.ToolBar', 'AMap.MapType', 'AMap.PolyEditor', 'AMap.CircleEditor', 'AMap.Map'],
  // 默认高德 sdk 版本为 1.4.4
  v: '1.4.14',
  uiVersion: '1.0.11'
});
