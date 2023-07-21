<template>
    <a-dropdown :trigger="['click']">
        <a @click.prevent :style="{ width: width }">
            <span v-if="title !== ''">{{ title }}</span>
            <a-icon v-else type="dash" />
        </a>
        <template #overlay>
            <slot></slot>
        </template>
    </a-dropdown>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Dropdown from "ant-design-vue/lib/dropdown";
import "ant-design-vue/lib/dropdown/style/index.css";
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';

@Component({
    name: "BaseDropDown",
    components: {
        ADropdown: Dropdown,
        AIcon: Icon
    }
})

export default class BaseDropDown extends Vue {
    @Prop({ required: false, type: String, default: "" }) title!: string;
    @Prop({ required: false, type: String, default: "24px" }) width!: string;
}

</script>
<style>
.ant-dropdown-open {
    height: 24px;
    background: #222833;
    border: 1px solid #8B98A9;
    border-radius: 2px;
    text-align: center;
    color: white;
}

.ant-dropdown {
    background: #313841;
    border-radius: 1px;
    color: white;
}

.ant-dropdown-content p {
    padding: 10px 15px;
}

.ant-dropdown-content p:hover {
    background: #536780;
    cursor: pointer;
}
</style>