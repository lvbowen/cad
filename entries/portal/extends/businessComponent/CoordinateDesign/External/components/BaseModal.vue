<template>
    <a-modal :title="title" :width="width" @cancel="handleClose" :visible="visible" destroyOnClose
        wrap-class-name="base-modal" :footer="null" :maskClosable="false">
        <slot></slot>
    </a-modal>
</template>
<script lang="ts">
import { Component, Vue, Prop, PropSync } from 'vue-property-decorator';
import Modal from 'ant-design-vue/lib/modal';
import 'ant-design-vue/lib/modal/style/index.css';

@Component({
    name: "BaseModal",
    components: {
        AModal: Modal
    }
})

export default class BaseModal extends Vue {
    @Prop({ required: true, type: String, default: "" }) title!: string;
    @Prop({ required: false, type: String, default: "520px" }) width!: string;
    @Prop({ required: true, type: Boolean, default: false }) visible!: boolean;

    handleClose() {
        this.$emit('handleCancel')
    }
}
</script>
<style lang="less">
.base-modal {
    border: 1px solid #0098FF;
    color: white;

    .ant-modal-content {
        border-radius: 0;
    }

    .ant-modal-header {
        padding: 0 10px;
        height: 34px;
        display: flex;
        align-items: center;
        color: #0B0253;
        font-size: 14px;
    }

    .ant-modal-title {
        color: inherit;
        font-size: inherit;
    }

    .ant-modal-close-x {
        width: 34px;
        height: 34px;
        line-height: 34px;
        color: inherit;
        font-size: inherit;
    }

    .ant-modal-body {
        background: #424B56;
        color: white;
    }

    .modal-right-btn {
        display: flex;
        justify-content: right;
    }
}

.base-modal .ant-radio-group,
.base-modal .ant-radio-wrapper {
    color: inherit;
}

.base-modal .ant-input {
    background: #313841;
    border: 1px solid #666666;
    border-radius: 2px;
    color: inherit;
}

.base-modal .ant-select-selection {
    background-color: #313841;
    border: 1px solid #666666;
    border-radius: 2px;
    color: inherit;
}

.ant-select-dropdown {
    background-color: #313841;
    border: 1px solid #666666;
    border-radius: 2px;
    color: inherit;
}

.ant-select-dropdown .ant-empty-small {
    color: white;
}

.base-modal .ant-select-arrow {
    color: #ddd;
}
</style>
