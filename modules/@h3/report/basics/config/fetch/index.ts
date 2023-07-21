import options from "@h3/report/dist/options";
import axios from "axios";
import env from "../env";
const CancelToken = axios.CancelToken;

export const Instance = axios.create({
  headers: Object.assign(
    {},
    options.requestHeader instanceof Function ? options.requestHeader() : options.requestHeader,
    {
      "Content-Type": "application/json"
    }
  )
});
// 兼容氚云移动端
Instance.defaults.transformRequest = [
  function transform(data) {
    return JSON.stringify(data);
  }
];
// 请求拦截器
Instance.interceptors.request.use(
  (config: any) => {
    if (config.method === "get" && config.custom.autoGetParams) {
      config.url +=
        "?" +
        Object.keys(config.data)
          .map(
            (key: any) =>
              `${key}=${typeof config.data[key] ? JSON.stringify(config.data[key]) : key}`
          )
          .join("&");
    }
    // config.data = qs.stringify(config.data);
    return config;
  },
  (error: any) => console.log(error)
);

// 响应拦截器
Instance.interceptors.response.use(
  (response: any) => {
    let responseData = response.data;
    if (typeof responseData !== "object") {
      responseData = JSON.parse(responseData);
      response.data = responseData;
    }
    return response.data;
  },
  (error: any) => {
    let res: any;
    if (error.name === "Error") {
      switch (error.message) {
        case "Network Error":
          res = { code: "network.error", msg: "网络异常，请稍后再试" };
          break;
        default:
          break;
      }
    }
    return res;
  }
);

/**
 * fetch 函数
 * @param url
 * @param method
 * @param data
 * @param responseType
 * @param host
 * @param need
 */
export default function fetch<T>({
  url,
  method = "get",
  data,
  responseType,
  host,
  autoGet = true
}: H3.ReportFetch.Params): H3.ReportFetch.Result<T> {
  // todo 优化
  const realUrl = options.baseUrl || host || env;
  if (realUrl) {
    url = realUrl + "/" + url;
  }
  const source = CancelToken.source();
  const requestConfig = {
    url,
    data,
    method: method.toUpperCase(),
    cancelToken: source.token,
    custom: {
      autoGetParams: autoGet
    },
    headers: Object.assign(
      {},
      options.requestHeader instanceof Function ? options.requestHeader() : options.requestHeader,
      {
        "Content-Type": "application/json"
      }
    )
  };
  if (responseType) {
    requestConfig["responseType"] = responseType;
  }
  return {
    promise: new Promise<T>(resolve => {
      //@ts-ignore
      Instance.request(requestConfig).then((response: H3.ReportAPI.Response) => {
        resolve(response as any);
      });
    }),
    source
  };
}
