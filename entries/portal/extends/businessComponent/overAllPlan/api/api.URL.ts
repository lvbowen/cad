interface ApiMap {
  [name: string]: {
    [key: string]: string;
  };
}

const original: ApiMap = {

  overAll:{
    scheduleList: '/api/schedule_plan/list',
    deleteHandle:'/api/schedule_plan/deleteById',
    switchover:'/api/schedule_plan/switch',
    addlist:'/api/schedule_plan/add',
    save:'/api/schedule_plan/update',
    showModal:'/api/schedule_contract/list',
  },
  compileMinute:{
    tableAmend:'/api/schedule_plan_detail/refesh_list',
    countAll:'/api/schedule_plan/direct_sum_plan',
    demand:'/api/schedule_plan/queryById',

    tableGet:'/api/schedule_plan_detail/tree_list',
    formSave:'/api/schedule_plan/update',
    handleMenuClick:'/api/template_file/query_file',
    submitAudit:'/api/schedule_plan/start_work_flow',
    deleteHandle:'/api/schedule_plan_detail/refesh_list',
  },
  Relevance:{
    // dblClickList:'/api/code_mbs/child_mbs_tree_list',
    dblClickList:'/api/code_mbs/getLeafs',
    coding:'/api/schedule_plan_wbs_mbs/list',
    leftCoding:'/api/code_mbs/top_mbs_tree_list',
    expandClick:'/api/code_mbs/child_mbs_tree_list',
    deleteCoding:'/api/schedule_plan_wbs_mbs/del_list',
    AddCoding:'/api/schedule_plan_wbs_mbs/refesh_list',
  }

};

export default original;
