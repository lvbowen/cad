
<zgantvue
    :options="object"    //甘特图配置项
    :colums="array"      //数据表格配置项
    :dataList="array"    //数据
    :checked="array"     //接收选中数据的对象
    :timelines="array"   //时间轴配置
>
    <!--  slots 甘特图内留有插槽位置 自定义扩展内容  -->
</zgantvue>


甘特图配置option

option = {
    style: {                    //样式
        rowHeight: number,      //行高度
        borderColor: 'string'   //边框颜色
        titleBackgroundColor: 'string'    //标题行背景色
    },
    tableWidth: 50%,            //数据表宽度占比
    toolSlot: 'string'          //工具栏模版名称
    checkrow: boolen            //是否显示勾选框
    timeType: number            //1 时  2 天  3 月  4 年
    
}


数据表 列 配置结构

colums = [
    {
        title: 'string',          //数据表每列的标题
        dataIndex: 'string',      //数据对应的属性名称
        treeColum: boolen,       //是否是树控制列
        width: number,           //列宽
        textAlign : 'center' | 'left' | 'right',    //内容对其，树展开列默认做对其
        slot: 'string',          //自定义插槽组件
    }
]



数据固定字段

datas = [
    {
        zgant_show_child: boolen    //树节点是否展开，数据请不要占用此字段名称
    }
]


时间轴配置
timelines = [
    {
        start: 'string',    //开始时间
        end: 'string',      //结束时间
        color: 'string'     //时间轴颜色
    }

]