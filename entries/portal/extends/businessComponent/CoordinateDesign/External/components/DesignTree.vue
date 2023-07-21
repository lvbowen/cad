<template>
    <a-tree :tree-data="transformData(treeData)"></a-tree>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Tree from 'ant-design-vue/lib/tree';
import 'ant-design-vue/lib/tree/style/index.css';
import type { TreeProps } from 'ant-design-vue'
import { ItemNum } from 'extends/businessComponent/EquipmentStatistics/Components';

@Component({
    name: "DesignTree",
    components: {
        ATree: Tree
    }
})
export default class DesignTree extends Vue {
    @Prop({ required: true, type: Array, default: [] }) treeData: any;
    // 自定义

    transformData(data: any) {
        if(data.length > 0){
            return data.map((item: any) => this.transformNode(item))
        }
    }

    transformNode(node: any) {
        if(node.clientProfessionTaskList && node.clientProfessionTaskList.length >0){
            node.children = node.clientProfessionTaskList
        }
        console.log(node,'====')
        const { clientProfessionTaskList, engineeringName, id } = node
        const treeNode: any = {
            title: engineeringName,
            key: id
        }
        if (clientProfessionTaskList && clientProfessionTaskList.length > 0) {
            treeNode.children = clientProfessionTaskList.map(child => this.transformLastNode(child))
        }
    }

    transformLastNode(node: any) {
        const { professionOutlineTaskList, professionTaskName, id } = node
        const treeNode: any = {
            title: professionTaskName,
            key: id
        }
        console.log(node,'lastssssss',professionOutlineTaskList)
        if (professionOutlineTaskList && professionOutlineTaskList.length > 0) {
            treeNode.children = professionOutlineTaskList.map(child => this.transformLastNode(child))
        }
    }
}
</script>