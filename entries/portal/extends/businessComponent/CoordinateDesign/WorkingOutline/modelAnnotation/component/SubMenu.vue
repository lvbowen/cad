<template>
  <a-sub-menu :key="menuInfo.id" v-bind="$props" v-on="$listeners">
    <span slot="title">
      <img v-if="menuInfo.iconFlag" src="../../../../../../src/assets/extends/coordinate/ModelAnnotation/认识专业拷贝3.png" alt="">
      <a-tooltip placement="top">
        <template slot="title">
          <span>{{ menuInfo.title }}</span>
        </template>
        <span :style="{fontSize:!menuInfo.iconFlag?'18px':'16px'}">{{ menuInfo.title }}</span>
      </a-tooltip>
    </span>
    <template v-for="item in menuInfo.designTasks">
      <a-menu-item v-if="!item.designTasks" :key="item.id" @click='clickMenuTitle(item)'>
        <span>{{ item.title }}</span>
      </a-menu-item>
      <sub-menu v-else :key="item.id" :menu-info="item" @clickMenuTitle='clickMenuTitle'/>
    </template>
  </a-sub-menu>
</template>

<script>
import { Menu ,Icon,Tooltip} from '@h3/antd-vue';
export default {
  name: 'SubMenu',
  // 必须添加
  isSubMenu: true,
  props:{
    ...Menu.SubMenu.props,
    menuInfo: {
      type: Object,
      default: () => ({}),
    },
  },
  components: {
    AMenu:Menu,
    AMenuItem: Menu.Item,
    ASubMenu:Menu.SubMenu,
    AIcon:Icon,
    ATooltip:Tooltip
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},

  methods: {
    clickMenuTitle(item) {
      this.$emit('clickMenuTitle',item);
    },
  },
  mounted() {
  }

}
</script>
