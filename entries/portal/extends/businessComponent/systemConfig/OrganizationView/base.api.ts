import Axios from 'axios';
import * as Type from "../../../type";

export default {
  uploadFile(params: {file: File}): Promise<Type.HttpRes<any>> {
    const formData: FormData = new FormData();
    Object.entries(params).forEach(([k,v]) => {
      formData.append(k,v);
    })
    return Axios.post('/api/aliyun/upload', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  },
}
