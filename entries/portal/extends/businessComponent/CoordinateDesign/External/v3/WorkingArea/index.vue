<template>

    <PageSlot curPageName="工作区">
        <SearchTemp></SearchTemp>
    </PageSlot>
<!-- ----------------------------- -->

</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
// 引入组件
import Spin from 'ant-design-vue/lib/spin';
import 'ant-design-vue/lib/spin/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import SearchTemp from '../../components/SearchTemp.vue'
import PageSlot from '../../components/PageSlot.vue'

@Component({
    name: "ProjectTask",
    components: {
        SearchTemp,
        PageSlot,
        ASpin:Spin,
        AIcon:Icon
    }
})
export default class WorkingArea extends Vue {

}
</script>