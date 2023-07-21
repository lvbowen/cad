
export default {
    WorkflowInfo: () => import('./workflow-info.vue'),
    WorkflowTrack: () => import('./workflow-track.vue'),
    WorkflowTrackActions: () => import('./workflow-track-actions.vue'),
    WorkflowChart: () => import('./chart.vue'),
    WorkflowLogs: () => import('./logs.vue'),
    Approval :() => import('./approval/approval.vue'),
    OperationLogs: () => import('./operation-logs.vue'),
  }