import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
import Icon from '../icon/Icon';
import {EachAppMenu} from "./type";
import './shims-tsx';


@Component({
    name: 'FlatMenu',
    components: {
        icon: Icon
    }
})
export default class FlatMenu extends Vue {

    @Prop() wrapperClass?: string;
    @Prop() menuCardClass?: string;
    @Prop() cardClass?: string;

    @Prop() enableFirst?: any;
    @Prop() firstSize?: number;


    @Prop() menuData?: Array<EachAppMenu>;
    @Prop() expendKeys?: Array<string>;

    @Prop() go2Page?: Function;
    @Prop() go2Next?: Function;
    @Prop() onClick?: Function;
    @Prop() expendChange?: Function;

    private narrowMenu: Array<string> = [];

    private expendFirst: number = 1;

    private firstLevelLength: number = 0;

    @Watch('$props.firstSize', {immediate: true})
    firstSizeListener(num: number) {
        if (num) this.firstLevelLength = num;
    }

    private menuExpend(id) {
        const {narrowMenu} = this;
        const index = narrowMenu.findIndex(item => item === id);
        if (index !== -1) {
            narrowMenu.splice(index, 1);
        } else {
            narrowMenu.push(id);
        }
    }

    private loadMore() {
        const {firstSize} = this.$props;
        this.firstLevelLength += firstSize;
    }

    generateMultilevelMenus(menuItem: Array<EachAppMenu> | EachAppMenu): Array<JSX.Element> {
        const vDom: Array<JSX.Element | Array<Array<JSX.Element>> | Array<JSX.Element>> = [], {
            narrowMenu,
            menuCardClass,
            cardClass,
            menuExpend,
            go2Page
        } = this;
        if (!menuItem) return vDom as Array<JSX.Element>;
        if (menuItem instanceof Array) {
            const list: Array<JSX.Element | Array<JSX.Element>> = [];
            menuItem.forEach(item => {
                list.push(
                    this.generateMultilevelMenus(item)
                )
            });
            vDom.push(list as Array<JSX.Element>);
        } else {
            if ((menuItem.children as Array<EachAppMenu>)?.length) {
                switch (menuItem.type) {
                    case 'Folder':
                        vDom.push(
                            <div action-role={narrowMenu.includes(menuItem.id) && 'narrow'} class={menuCardClass}>
                                <nav onClick={() => menuExpend(menuItem.id)}>
                                    <aside class={"titleBarge"}/>
                                    {/*<aside class={Class.titleBarge}/>*/}
                                    <span>{menuItem.name}</span>
                                    <aside>
                                        <icon src={'arrow'}/>
                                    </aside>
                                </nav>
                                <article>
                                    {this.generateMultilevelMenus(menuItem.children as Array<EachAppMenu>)}
                                </article>
                            </div>
                        )
                        break;
                    default:
                        vDom.push(
                            <aside onClick={() => go2Page?.(menuItem as EachAppMenu)} card-role={'single'}
                                   color-role={1} class={cardClass}>
                                <icon src={'appIcon'}/>
                                <span>{menuItem.name}</span>
                                {/*<aside><Icon src={'menuPick'}/></aside>*/}
                            </aside>
                        )
                        break;
                }
            } else {
                vDom.push(
                    <aside onClick={() => go2Page?.(menuItem as EachAppMenu)} card-role={'single'} color-role={2}
                           class={cardClass}>
                        <icon src={'appIcon'}/>
                        <span>{menuItem.name}</span>
                        {/*<aside><icon src={'menuPick'}/></aside>*/}
                    </aside>
                )
            }
        }
        return vDom as Array<JSX.Element>;
    }

    generateFirstMenus(menuItem: Array<EachAppMenu> | EachAppMenu, maxLength: number): Array<JSX.Element> {
        const vNode: Array<JSX.Element> = [], {go2Page, go2Next} = this.$props, {loadMore} = this;
        if (!menuItem) return vNode;
        console.log('menuitem', menuItem, maxLength);
        if (!Array.isArray(menuItem)) return vNode;
        menuItem.forEach((menu, index) => {
            if (index < maxLength) {
                switch (menu.type) {
                    case 'Folder':
                        vNode.push(
                            <div onClick={() => go2Next?.(menu as EachAppMenu)} class="firstMenu">
                                <aside>
                                    <i>
                                        <img src={(menu.icon as string)} alt={''}/>
                                    </i>
                                </aside>
                                <span>{menu.name}</span>
                            </div>
                        )
                        break;
                    default:
                        vNode.push(
                            <div onClick={() => go2Page?.(menu as EachAppMenu)} class="firstMenu">
                                <aside>
                                    <i>
                                        <img src={(menu.icon as string)} alt={''}/>
                                    </i>
                                </aside>
                                <span>{menu.name}</span>
                            </div>
                        )
                        break;
                }
            } else if (index === maxLength) {
                vNode.push(
                    <div onClick={() => loadMore()} class="loadMore">
                        <aside>
                            <icon src={'loadMore'}/>
                        </aside>
                        <span>显示更多</span>
                    </div>
                )
            }
        });
        return vNode;
    }

    render() {
        const {wrapperClass, menuData, enableFirst} = this.$props, {
            generateMultilevelMenus,
            generateFirstMenus,
            firstLevelLength
        } = this;
        return (
            <article class={wrapperClass}>
                {
                    enableFirst &&
                    <nav class="workbench">
                        <span>工作台</span>
                    </nav>
                }
                {menuData && !enableFirst && generateMultilevelMenus(menuData)}
                {menuData && enableFirst && generateFirstMenus(menuData, firstLevelLength)}
            </article>
        );
    }
}