declare namespace H3 {
  namespace ReportFetch {
    interface Params {
      url: string; // 请求地址
      method: "get" | "post"; // 请求方式
      data: any; // 请求参数
      responseType?: XMLHttpRequestResponseType; // 响应的数据类型
      host?: string;
      autoGet; // 拦截器会把‘get’请求参数遍历到host后面
    }

    interface Result<T> {
      promise: Promise<T | boolean>; // 响应的Promise对象
      source: any; // axios source对象 类似 ajax源对象 可以使用abort等等
    }
  }
}
