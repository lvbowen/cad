import options from "@h3/report/dist/options";

let env: any;

if (options.baseUrl) {
  env = options.baseUrl;
} else if (window.location.origin.indexOf("h3yun.com") > -1) {
  env = window.location.origin + "/rx-report/webapi/";
} else {
  const local =
    window.localStorage.getItem("H3_DEV_GROUP") ||
    window.localStorage.getItem("H3_DEV_GROUP_MOBILE");
  env =
    process.env.NODE_ENV === "mock"
      ? window.location.origin + "/"
      : `https://${local}.h3yun.com/rx-report/webapi/`;
}
export default env;
