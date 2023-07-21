<template>
    <div class="search-temp">
        <a-input-search class="search-temp-input" v-model.trim="inputValue" @search="handleChange"
            :placeholder="placeholder" clearable />
        <div v-if="!isProject && !isDesign" class="search-right">
            <div class="search-temp-sort" v-if="!isDrag" @click="handleSort">
                <img :src="sortIcon">
            </div>
            <div v-else class="search-temp-sorc" :style="{ width: isDrag ? '100px' : '0px' }">
                <a-icon @click="saveSort" type="check-circle" />
                <a-icon @click="cancelSort" type="close-circle" />
            </div>
        </div>
        <div v-if="isProject" class="search-temp-sort" @click="handleSort">
            <img :src="sortIcon2">
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, PropSync } from 'vue-property-decorator';
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import sortIcon from '../v3/images/r_icon_px.png';
import sortIcon2 from '../v3/images/r_icon_sx.png';

@Component({
    name: "SearchTemp",
    components: {
        AInputSearch: Input.Search,
        AIcon: Icon
    }
})

export default class SearchTemp extends Vue {
    @Prop({ required: false, type: String, default: "搜索关键字" }) placeholder!: string;
    @Prop({ required: false, type: Boolean, default: false }) isProject!: boolean;
    @Prop({ required: false, type: Boolean, default: false }) isDesign!: boolean;
    @Prop({ required: false, type: Boolean, default: false }) isDrag!: boolean;
    // @Prop({ required: false, type: Boolean, default: false }) isTaskDrag!: boolean;

    inputValue = "";
    sortIcon: string = sortIcon
    sortIcon2: string = sortIcon2


    // 保存排序
    saveSort() {
        this.$emit('handleSave')
    }

    // 取消排序
    cancelSort() {
        this.$emit('handleCancel')
    }

    // 点击搜索
    handleChange(value: string) {
        // 查询调用父级 此处不进行过滤
        this.$emit("searchChange", value)
    }

    // 点击sort
    handleSort() {
        // 判断是否为项目
        if (this.isProject) {
            this.$emit('handleShowTip',true)
        } else {
            this.$emit('changeDrag', true)
        }
    }
}
</script>
<style scoped>
.search-temp {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px;
    background: #424b56;
    margin-top: 1px;
}

.search-temp-input {
    flex: 1;
}

.search-right {
    min-width: 40px;
    max-width: 100px;
}

.search-temp-sort {
    width: 40px;
    background: #333;
    border: 1px solid #ccc;
    color: white;
    margin-left: 10px;
    height: 30px;
    border-radius: 2px;
    text-align: center;
}

.search-temp-sort img {
    width: 70%;
}

.search-temp /deep/ .ant-input {
    background: transparent;
    border-radius: 2px;
}

.search-temp /deep/ .ant-input-search-icon {
    color: white;
}

.search-temp-sorc {
    display: grid;
    grid-template-columns: 32px 32px;
    align-items: center;
    grid-column-gap: 5px;
    justify-content: center;
    justify-items: center;
}

.search-temp-sorc i {
    height: 30px;
    color: #fff;
    border: 1px solid #ccc;
    line-height: 30px;
    width: 32px;
}

.search-temp-sorc i:hover {
    cursor: pointer;
    background: #333;
}
</style>
