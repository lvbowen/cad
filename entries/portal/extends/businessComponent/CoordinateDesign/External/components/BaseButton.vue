<template>
    <a-button @click="handleClick" :class="[isPrimary ? 'base-button' : 'base-button-normal']">
        <slot></slot>
    </a-button>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';

@Component({
    name: "BaseButton",
    components: {
        AButton: Button
    }
})

export default class BaseModal extends Vue {
    @Prop({ required: false, type: String, default: "" }) title!: string;
    @Prop({ required: false, type: Boolean, default: false }) isPrimary: boolean;

    handleClick() {
        this.$emit('onClick')
    }
}
</script>
<style lang="less">
.base-button {
    background: #1473E6;
    border-radius: 16px;
    color: white;
    border: none;
}

.base-button-normal {
    font-weight: 400;
    color: #FFFFFF;
    border-radius: 16px;
    border: 2px solid #fff;
    background: transparent;
}
</style>
