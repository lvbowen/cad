<template>
    <PageSlot curPageName="知识">
        <div class="tab-box">
            <div v-for="tab in tabName" :key="tab" @click="handleTab(tab)"
                :class="['tab-item', tabActive === tab && 'active-tab']">{{ tab }}
            </div>
        </div>
        <SearchTemp @searchChange="searchChange"></SearchTemp>
    </PageSlot>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
// 引入组件
import Spin from 'ant-design-vue/lib/spin';
import 'ant-design-vue/lib/spin/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import SearchTemp from '../../components/SearchTemp.vue';
import PageSlot from '../../components/PageSlot.vue'

@Component({
    name: "KnowledgeBase",
    components: {
        SearchTemp,
        PageSlot,
        ASpin:Spin,
        AIcon:Icon
    }
})
export default class KnowledgeBase extends Vue {

}
</script>