<template>
    <PageSlot curPageName="批注详情" isBack>
        <div>
            <div class="detail-edit">
                <span>编辑</span>
            </div>
            <div class="detail-title">批注信息</div>
            <div class="info-box">
                <div class="info-box-item">
                    <span>成果名称 :</span>
                    <span>{{ dataInfo.designAnnotation.designFileName }}</span>
                </div>
                <div class="info-box-item">
                    <span>文件类型 :</span>
                    <span>{{ dataInfo.designAnnotation.designFileName }}</span>
                </div>
                <div class="info-box-item">
                    <span>当前节点 :</span>
                    <span>{{ dataInfo.designAnnotation.designFileName }}</span>
                </div>
                <div class="info-box-item">
                    <span>批注人 :</span>
                    <span>{{ dataInfo.designAnnotation.designFileName }}</span>
                </div>
                <div class="info-box-item">
                    <span>批注日期 :</span>
                    <span>{{ dataInfo.designAnnotation.designFileName }}</span>
                </div>
                <div class="info-box-item">
                    <span>批注标题 :</span>
                    <span>{{ dataInfo.designAnnotation.designFileName }}</span>
                </div>
                <div class="info-box-item">
                    <span>批注描述 :</span>
                    <span>{{ dataInfo.designAnnotation.designFileName }}</span>
                </div>
                <div class="info-box-item">
                    <span>批注截图 :</span>
                    <span>{{ dataInfo.designAnnotation.designFileName }}</span>
                </div>
            </div>
            <div class="detail-title">回复信息</div>
            <div class="info-box">
                <div class="info-box-item">
                    <span>批注人 :</span>
                    <span>{{ dataInfo.designAnnotationReply.replyName }}</span>
                </div>
                <div class="info-box-item">
                    <span>批注时间 :</span>
                    <span>{{ dataInfo.designAnnotationReply.replyName }}</span>
                </div>
                <div class="info-box-item">
                    <span>回复状态 :</span>
                    <span>{{ dataInfo.designAnnotationReply.replyName }}</span>
                </div>
                <div class="info-box-item">
                    <span>回复内容 :</span>
                    <span>{{ dataInfo.designAnnotationReply.replyName }}</span>
                </div>
            </div>
        </div>
    </PageSlot>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";

import PageSlot from '../../../../components/PageSlot.vue'


@Component({
    name: "textDetail",
    components: {
        PageSlot
    }
})

export default class textDetail extends Vue {

    dataInfo = {
        attachment: {},
        designAnnotation: {
            designFileName: '数据'
        },
        designAnnotationReply: {
            replyName: '数据'
        }
    }
    mounted() {
        // this.$store.registerModule('projectStore', projectStore);
    }
}
</script>

<style scoped lang="less">
a {
    margin: 0;
    padding: 0;
}

.detail-title {
    background: #313841;
    height: 30px;
    line-height: 30px;
    text-indent: 10px;
    font-weight: bold;
    color: inherit;
}

.info-box {
    padding: 10px;
    color: inherit;
    background: #424B56;
}

.info-box-item {
    display: grid;
    grid-template-columns: 74px 1fr;
    padding: 5px 0;
    min-height: 30px;
}

.detail-edit {
    padding: 10px;
}

.detail-edit span {
    color: inherit;
    background: #1874DC;
    border-radius: 4px;
    text-align: center;
    padding: 2px 8px;
}

.detail-edit:hover {
    cursor: pointer;
    opacity: 0.8;
}</style>