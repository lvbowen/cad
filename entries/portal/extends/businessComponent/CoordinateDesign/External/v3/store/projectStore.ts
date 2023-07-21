// 项目 projectStore
// 状态 已驳回 已通过 审核中 设计中 已提交 待接收
const state: any = {
    curProjectId: '', // 选中的当前项目id
    taskId:'', // 任务id
    isReject: false, // 已驳回 true
    isPass: false, // 已通过
    inReview: false, // 审核中
    inCheck: false, // 校核中
    inDesign: false, // 设计中
    inSubmit: false, // 已提交
    toBeReceived: false, // 待接收
}
const mutations = {
    setCurProJectId(state: any, data: string) {
        state.curProjectId = data
    }
}
const actions = {

}
export default {
    namespaced: true,
    state,
    mutations,
    actions
};