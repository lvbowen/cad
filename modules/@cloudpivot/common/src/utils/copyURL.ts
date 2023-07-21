export default function copyURL(query: any, status: string) {
    const oldToken = localStorage.getItem("token");
    let urls = window.location.pathname;
    if (query.access_token) {
    if (!oldToken || query.isFormDingTalk) {
        localStorage.setItem("token", query.access_token);
    }
    if (query.access_token) delete query.access_token;
    if (query.admin_token) delete query.admin_token
    if(query.isFormDingTalk) delete query.isFormDingTalk
    urls += "?";
    for (const item in query) {
        if (query[item] && item) {
            urls += item + "=" + query[item] + "&";
        }
    }
    window.open(urls, "_self");
    } else if (!query.access_token && !oldToken && status === 'portal') {
        if (!(urls.indexOf("login") > -1) && !(window.location.hash.endsWith("/oauth"))) {
            urls += "?";
            for (const item in query) {
                urls += item + "=" + query[item] + "&";
            }
            localStorage.setItem("copy_link_url_path", urls);
        }
    }
}
