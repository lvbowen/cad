export default {
  parseQueryString: function(url:string) {
    const obj = {};
    const params = url.slice(1);
    const arr = (params.split('&'));
    arr.forEach((v, i) => {/*  */
      const str=v.split('=')[1];
      if(str.indexOf('%')===-1){
        obj[v.split("=")[0]] =v.split("=")[1];
      }else {
        obj[v.split("=")[0]] = JSON.parse(decodeURIComponent(v.split("=")[1]));
      }
    })
    console.log(obj)
    return obj;
  },
}
