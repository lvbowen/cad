import { CreateElement, VNode } from 'vue';
import ComputeEditor from './compute-editor.vue';
import confirm from '@h3/report/basics/components/confirm';
import reportOptions from '@h3/report/dist/options';

export default (options: any) => {
  const formOptions: H3.ReportConfirm.Options = {
    title: '计算字段',
    width: 800,
    content: (h: CreateElement) => h(ComputeEditor, {
      props: {
        formula: options.formula,
        title: options.title,
        fields: options.fields
      }
    }),
    ok: async (e) => {
      const content = e.contentVNode as VNode;
      const ref = (content as any).checkValidate();
      if(ref.code === 'success') {
       const res = await options.complete({ title: (content as any).innerTitle, formula:(content as any).getValue() });
        if(!res){
         return res;
       }
      }else {
        reportOptions.message.error(ref.message);
        return false;
      }
    }
  };
  confirm(formOptions);
}


