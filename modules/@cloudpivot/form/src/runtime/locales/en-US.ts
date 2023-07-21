import { FormAction } from "../form-action";

export default {

  action: {
    [FormAction.AdjustParticipant]: 'Add-approver',
    [FormAction.Agree]: 'Agree',
    [FormAction.DisAgree]: 'Disagree',
    [FormAction.Assist]: 'Assist',
    [FormAction.Cancel]: 'Cancel',
    [FormAction.Circulate]: 'Circulate',
    [FormAction.Delete]: 'Delete',
    [FormAction.Edit]: 'Edit',
    [FormAction.FinishInstance]: 'Completed',
    [FormAction.Forward]: 'Transfer',
    [FormAction.Print]: 'Print',
    [FormAction.Reject]: 'Reject',
    [FormAction.Retrieve]: 'Recall',
    [FormAction.Save]: 'Save',
    [FormAction.Submit]: 'Submit',
    [FormAction.Urge]: 'Urge',
    [FormAction.EditOwner]: 'EditOwner',
    more : 'More',
    save2 : 'Save',
    cancel2 : 'Cancel'
  },

  actionTip: {
    [FormAction.AdjustParticipant]: 'Add-approver succeeded!',
    [FormAction.Agree]: 'Operation succeeded!',
    [FormAction.DisAgree]: 'Operation succeeded!',
    [FormAction.Assist]: 'Assist succeeded!',
    [FormAction.Cancel]: 'Operation succeeded!',
    [FormAction.Circulate]: 'Circulate succeeded!',
    [FormAction.Delete]: 'Delete succeeded!',
    [FormAction.FinishInstance]: 'FinishInstance succeeded!',
    [FormAction.Forward]: 'Transfer succeeded!',
    [FormAction.Reject]: 'Reject succeeded!',
    [FormAction.Retrieve]: 'Recall succeeded!',
    [FormAction.Save]: 'Save succeeded!',
    [FormAction.Submit]: 'Submit succeeded!',
    [FormAction.Urge]: 'Send succeeded!',
    save2: 'Save succeeded!'
  },

  tip : {
    [FormAction.Cancel]: 'The workflow will be stuck after cancel,are you sure to cancel?',
    [FormAction.Delete]: "The item be restored after deletion. Are you sure you want to delete it?",
    [FormAction.FinishInstance]: 'End the Workflow ahead of schedule?',
    [FormAction.Retrieve]: 'Are you sure to withdraw the mission?',
    saveSuccess : 'Save success',
    deleteSuccess : 'Delete success',
    retrieveSuccess : 'Retrieve success',
    rejectSuccess : 'Reject success',
    errTips1: 'Not allowed to transfer it to yourself!',
    errTips2: 'Not allowed to sign for yourself!',
    errTips3: 'Can not assist to current activity handler',
    errTips4: 'Data model does not exist!',
    errTips5: 'Invalid data model code!',
    errTips6: '{msg}，please contact the administrator!',
    errTips7: 'Business object does not exist!',
    errTips8: 'Process instance has been deleted!',
    errTips9: 'The current task has been cancelled or processed!',
    errTips10: 'Current task cannot be recalled!',
    errTips11: 'Detected that some participants have participated in the current node, so the task can no longer be processed!',
    errTips12: 'Not allowed to adjust yourself!',
    errTips13: 'The data used for validation does not exist!',
    errTips14: 'Field does not exist in the model which in logical check on business rｕle!',
    errTips15: 'The field of the business rule logic node target model does not exist!',
    errTips16: 'Data which be check does not exist, please contact the administrator for processing',
    errTips17: 'Business rules execute exceptions!',
    errTips18:'[{propertyCode}] not exist which user in node name [{nodeName}] in business rules name [{businessRuleName}] on [{schemaName}] model,you can contact the administrator',
    errTips19: 'The business rule logic check failed, please contact the administrator to deal with!',
    errTips20: 'No validation data was found from target model name 【{targetSchemaName}】 in 【{nodeName}】',
    noDeptTips: 'The owner has no department and cannot submit the form',
    qrCodeError: 'Unable to recognize qr code!',
    qrCodeNoData: 'The corresponding data could not be found!',
    errTips21: 'Current task has been recalled!',
  },

  modal: {
    selectUser: 'Choose {text}',
    pleaseSelectUser: 'Choose {text}',
    explain: '{text} details',
    pleaseInputExplain: 'Please input {text} info',
    pleaseInput: 'Please input',
    pleaseChoose: 'Please Choose',
    reject: 'Reject to',
    rejectTips: "Please select Reject to",
    reSubmitTip: 'Recommit back to the current node',
    selectOrg: 'Choose department',
    pleaseInputOpinion: 'Please input opinion',
    pleaseAddSign: 'Please add sign',
    noRejectNode:'No reject node',
    selectIdentity: 'Choose identity',
    trustTips: 'You are helping [{name}] to initiate the [{workflowname}] process.',
    ownIdentity: 'Own identity',
    clientIdentity: 'Identity of client',
    depts: 'depts',
    client: 'client',
    clientDpets: 'epartment of client',
        rowEmpty: 'There is no data in the report, please add and submit'
  },

  biz: {
    systemValue: 'System Filling',
    index: 'NO.',
    add: 'add',
    delete: 'delete',
      edit: 'Batch editing',
    action: 'action',
    importData: 'Import data',
    importTips1: 'For make sure the data is legal,please ',
    importTips2: 'Download the sample file',
    importLocalFaile: 'Upload the local file',
    selectLocalFaile: 'Choose local file',
    importTips3: 'Only support .xlsx file,and limited to 500 lines data',
    cancel: 'Cancel',
    clear: 'Clear',
    startImport: 'start import',
    ok: 'OK',
    reImport: 'Import again',
    importing: 'Importing',
    importTips4: 'Please do not close the windows otherwise it will be interrupted',
    import: 'import',
    export: 'export',
    fullScreen: 'full',
    smallScreen: 'small',
    importFormRelevanceForm: 'Import from Relation Model',
    addMethod: 'Adding Method'
  },
  urge: {
    check: 'Check',
    urgeRecord: 'Urgent Records',
    urgeContent: 'Urgent Content',
    loadAll: 'All records loaded',
    plzInput: 'Please Input',
    urgeSuccess: 'urge succeed!',
    urgeFailed: 'urge failed,please try again!',
    cantUrgeSelf: 'You are the current approver,can\'t urge yourself.',
    netError: 'NetWork Error'
  }


};
