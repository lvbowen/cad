<template>
    <div class="menu-v3">
        <div v-for="menu in menuData" :key="menu.name" @click="handleMenu(menu)">
            <router-link :to="{ path: `/${menu.path}` }" class="menu-link">
                <div :class="[menu.name === activeMenu && 'active-menu', 'menu-link-icon']">
                    <img :src="menu.icon">
                </div>
                <span>{{ menu.name }}</span>
            </router-link>
            <div v-if="menu.children" class="menu-child">
                <div v-for="child in menu.children" :key="child.path"
                    :class="['menu-child-item', child.path === secondActiveMenu && 'active-child-item']"
                    @click="handleMenuChild(child)">
                    <span>{{ child.name }}</span>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";
import Modal from 'ant-design-vue/lib/modal';
import 'ant-design-vue/lib/modal/style/index.css';
import { RouteMenu } from '../../../../../type'
import taskIcon from '../images/left_icon_rw.png';
import projectIcon from '../images/left_icon_xm.png';
import workingIcon from '../images/left_icon_gzq.png';
import recycleIcon from '../images/left_icon_hsz.png';
import knowledgeIcon from '../images/left_icon_zs.png';

const menuStore = namespace("menuStore");

@Component({
    name: "Menu"
})

export default class Menu extends Vue {
    @menuStore.State("activeMenu") activeMenu: any; // 一级菜单
    @menuStore.State("secondActiveMenu") secondActiveMenu: any // 二级菜单

    menuData: RouteMenu[] = [
        {
            name: '任务',
            path: 'ProjectTaskList',
            icon: taskIcon
        },
        {
            name: '项目',
            path: 'ProjectItem',
            icon: projectIcon,
            children: [
                {
                    name: '设计',
                    path: '',
                    icon: taskIcon
                },
                {
                    name: '提资',
                    path: 'ProjectItem/WithdrawalFunds',
                    icon: taskIcon
                },
                {
                    name: '成品',
                    path: 'ProjectItem/FinishProduct',
                    icon: taskIcon
                },
                {
                    name: '出图',
                    path: 'ProjectItem/Plot',
                    icon: taskIcon
                },
                {
                    name: '资料',
                    path: 'ProjectItem/Information',
                    icon: taskIcon
                }
            ]
        },
        {
            name: '工作区',
            path: 'WorkingArea',
            icon: workingIcon
        },
        {
            name: '回收站',
            path: 'RecycleBin',
            icon: recycleIcon
        },
        {
            name: '知识',
            path: 'KnowledgeBase',
            icon: knowledgeIcon
        }
    ]

    // 点击一级菜单
    handleMenu(menu: RouteMenu) {
        this.$store.state.menuStore.secondActiveMenu = ''
        this.$store.state.menuStore.activeMenu = menu.name
    }

    // 点击二级菜单
    handleMenuChild(child: RouteMenu) {
        if (this.$store.state.projectStore.curProjectId) {
            this.$store.state.menuStore.secondActiveMenu = child.path
            this.$router.replace(`/${child.path}`)
        } else {
            // 在二级按钮跳转之前获取项目数据
            return Modal.confirm({
                title: '您当前未选择项目无法跳转， 请先单击选择项目！',
                okText: "确定",
                cancelText: "取消",
                centered: true,
            });
        }
    }
    // init
    mounted() {
        // this.$store.registerModule('menuStore', menuStore);
    }
}
</script>

<style scoped lang="less">
.menu-v3 {
    background: #404955;
    color: white;
    height: 100%;
    text-align: center;
}

.menu-link {
    min-height: 70px;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
    border-bottom: 2px solid #1d2730;
    color: #fff;
    align-items: center;
    justify-items: center;
    padding: 5px 0;
}

.menu-link-icon {
    width: 80%;
    height: 100%;
    overflow: hidden;
    text-align: center;

    img {
        width: 20px;
        margin: auto;
    }
}

.active-menu {
    background: #1d2730;
    border: 1px solid #666;
}

// 子菜单
.menu-child {
    background: #313944;
    width: 100%;

    .menu-child-item {
        height: 32px;
        line-height: 32px;
        margin: 0 4px;
    }
}

.active-child-item {
    background: #1d2730;
    border: 1px solid #666;
    border-radius: 4px;
}
</style>
