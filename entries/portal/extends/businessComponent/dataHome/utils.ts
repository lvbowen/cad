/**
 * 根据路由name拿到对应配置
 */
export default {
  getRoute(routes,name:string) {
    let rou = {};
    if(routes.hasOwnProperty('name')) {
      if(routes.name && routes.name.search(new RegExp(name, 'i')) !== -1) {
        rou = Object.assign(rou,routes)
      }else if(routes.children){
        (routes.children || []).map((r) => {
          const q = this.getRoute(r,name);
          rou = Object.assign(rou,q)
        });
      }
    }else {
      const keys = Object.keys(routes);
      keys.map((key)=> {
        if(routes[key] && routes[key].hasOwnProperty('name')) {
          if(routes[key].name && routes[key].name.search(new RegExp(name, 'i')) !== -1) {
            rou = routes[key]
          }else if(routes[key].children){
            (routes[key].children || []).map((r) => {
              const q = this.getRoute(r,name);
              rou = Object.assign(rou,q)
            });
          }
        }else {
          const chils_key = Object.keys(routes[key]);
          chils_key.map((c_key)=> {
            if(routes[key][c_key] && routes[key][c_key].hasOwnProperty('name')) {
              if(routes[key][c_key].name && routes[key][c_key].name.search(new RegExp(name, 'i')) !== -1) {
                rou = routes[key][c_key]
              }else if(routes[key][c_key].children){
                (routes[key][c_key].children || []).map((r) => {
                  const q = this.getRoute(r,name);
                  rou = Object.assign(rou,q)
                });
              }
            }
          })
        }
      })
    }
    return rou
  }
}
