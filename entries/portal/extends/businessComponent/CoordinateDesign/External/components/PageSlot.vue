<template>
    <div class="page-content">
        <div class="page-c-top">
            <div :class="['page-c-top-name', isBack && 'page-c-top-name-hover']" @click.stop="handleBack">
                <span v-if="isBack" class="back-icon">
                    <a-icon type="left" />
                </span>
                <span>{{ curPageName }}</span>
            </div>
            <div class="page-c-top-icon">
                <img :src="skinIcon">
            </div>
        </div>
        <div class="page-slot">
            <slot></slot>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import skinIcon from '../v3/images/left_icon_zs.png';

@Component({
    name: "PageSlot",
    components: {
        AIcon: Icon
    }
})

export default class PageSlot extends Vue {
    @Prop({ required: false, type: String, default: "" }) curPageName!: string;
    @Prop({ required: false, type: Boolean, default: false }) isBack!: boolean;

    skinIcon: string = skinIcon

    // 详情返回
    handleBack() {
        console.log('test', this.isBack, this.$router)
        if (this.isBack) {
            this.$router.back()
        }
    }
}
</script>
<style scoped>
.page-content {
    height: 100%;
    width: 100%;
    background: #313841;
}

.page-c-top {
    display: flex;
    height: 42px;
    align-items: center;
    justify-content: space-between;
    line-height: 42px;
}

.page-c-top-name {
    background: #424b56;
    display: inline-block;
    height: 100%;
    padding: 0 10px;
    color: white;
}

.page-c-top-name-hover:hover {
    cursor: pointer;
    color: #1874DC;
}

.back-icon {
    padding-right: 5px;
}

.page-c-top-icon {
    width: 50px;
    text-align: center;
}

.page-c-top-icon img {
    width: 70%;
    text-align: center;
}

.page-slot {
    width: 100%;
    height: auto;
    background: #424B56;
    color: white;
}
</style>
