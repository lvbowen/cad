/**
 * 判断手机系统
 */
export function judgeMobile() {
  const u = navigator.userAgent, app = navigator.appVersion;
  const isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //g
  const isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
  if (isAndroid) {
    return 'android';
  }else if (isIOS) {
    return 'ios';
  } else {
    return 'pc';
  }
}

/**
 * 判断是移动端还是PC端
 */

export const isMobile = /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)
