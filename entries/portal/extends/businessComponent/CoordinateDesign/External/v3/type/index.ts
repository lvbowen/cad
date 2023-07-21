// 路由菜单
export interface RouteMenuChild {
    path: string;
    name: string;
    icon?: string;
}
export interface RouteMenu {
    path: string;
    name: string;
    icon?: string;
    children?: RouteMenuChild[]
}