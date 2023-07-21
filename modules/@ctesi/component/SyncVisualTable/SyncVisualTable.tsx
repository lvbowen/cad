///<reference path="../declarations.d.ts" />
///<reference path="../shims-tsx.ts" />
import { Component, Vue, Prop, Ref, Watch } from 'vue-property-decorator';
import Class from './SyncVisualTable.module.less';
import * as Type from '@ctesi/core/type';
import { Utils } from "@ctesi/core";
import { Table } from 'vxe-table';
import * as tsx from 'vue-tsx-support';


interface Locale {
    title: string;
}

interface CheckConfig<T> {
    checkField: string;
    checkStrictly?: boolean;
    halfField?: string;
    showHeader?: boolean;
    checkMethod?: ( { row }: { row: T } ) => boolean;
}

interface MainTableConfig<T> {
    size: 'mini' | 'normal' | 'large',
    align: 'left' | 'center' | 'right',
    stripe: boolean;
    border: boolean;
    resizable: boolean;
    showOverflow: boolean;
    rowKey: boolean;
    rowId: string;
    highlightCurrentRow: boolean;
    autoResize: boolean;
    currentChange?: ( { row }: { row: T } ) => void;
    checkboxChange?: ( { row }: { row: T } ) => void;
    checkboxAll?: ( { row }: { row: T } ) => void;
    cellDBClick?: ( { row }: { row: T } ) => void;
    cellClick?: ({row }: { row: T}) => void
}

interface TableConfig {
    loading: boolean;
    maxHeight: number;
}


interface SyncVisualTableConfig<T> {
    wrapperClass?: string;
    dataSource: Array<T>;
    expendAllNode: boolean;
    dontReloadExpandNode?: boolean;
    stopExpendCondition?: ( item: T ) => boolean;
    fileInput?: ( file, files ) => void;
    locale: Locale;
    loading?: boolean;
    navNodes: Array<JSX.Element>;
    articleNavWrapperClass?: string;
    articleNavNodes: Array<JSX.Element>;
    mainTableConfig: MainTableConfig<T>;
    columns: Array<Type.TableColumn<T>>;
    lazy: boolean;
    treeChildField?: string;
    hasChildField?: string;
    loadMethod?: Function;
    expandRowKeys?: Function;
    checkConfig?: CheckConfig<T>;
    cellClassName?: string | (( { row }: { row: T } ) => string);
    rowClassName?: string | (( { row }: { row: T } ) => string);
}

@Component( {
    name: 'SyncVisualTable'
} )
export default class SyncVisualTable<T> extends Vue {

    _tsx!: tsx.DeclareProps<Pick<SyncVisualTable<T>, 'config'>>

    @Prop()
    public config!: SyncVisualTableConfig<T>;

    @Ref()
    public MainContainer!: HTMLElement;

    @Ref()
    public MainTable!: Table;

    @Ref()
    public ContentNav!: HTMLElement;

    @Ref()
    public FileInput!: HTMLInputElement;

    private restHead: number = 0;

    @Watch( 'config.dataSource', { immediate: true } )
    dataSourceListener() {
        const { config } = this;
        if ( config.expendAllNode ) {
            this.$nextTick().then( () => {
                this.setAllTreeExpanded();
            } )
        }
    }

    public tableConfig: TableConfig = {
        loading: false,
        maxHeight: 0
    }

    public tableLoading( flag: boolean ) {
        this.tableConfig.loading = flag;
    }

    private fileUpload( e ) {
        const files = e.target.files, { config } = this;
        if ( files && files[0] ) {
            config.fileInput?.( files[0], files );
        }
    }

    public clearCurrentRow() {
        this.MainTable?.setCurrentRow( [] );
    }

    public setCurrentRow( row: T ) {
        this.MainTable?.setCurrentRow( row );
    }

    public getCurrentRow() {
        return this.MainTable?.getCurrentRecord();
    }

    public getCheckedRows( isFull?: boolean ) {
        return this.MainTable?.getCheckboxRecords( isFull );
    }

    public reloadRow( row, record? ) {
        return this.MainTable?.reloadRow( row, record );
    }

    public reloadTreeChilds( rows ) {
        return this.MainTable?.reloadTreeChilds( rows );
    }

    public getMaxHeight() {
        return this.tableConfig.maxHeight;
    }

    public setInitRestHead() {
        const
            Container = this.MainContainer,
            Full = document.querySelector( '.main-right' );
        if ( !Container || !Full ) return;
        const
            collection: HTMLCollection = Full.children,
            fullWithOutPadding = Full.getClientRects()[0].height,
            containerHeight = Container.getClientRects()[0].height;
        let restHead: number = 0;
        Array.from( collection ).forEach( node => {
            if ( node !== Container ) restHead += node.getClientRects()[0].height;
        } );
        if ( restHead === (fullWithOutPadding - 32) ) restHead = restHead - containerHeight;
        this.restHead = restHead;
    }

    public calcContentHeight() {
        const
            Container = this.MainContainer,
            MainTable = this.MainTable,
            ContentNav = this.ContentNav,
            { articleNavNodes } = this.config,
            { restHead } = this;
        if ( !Container || !MainTable || !ContentNav ) return;
        const { height } = Container.getClientRects()[0];
        const block = document.querySelector( '.main-right' );
        if ( !block ) return;
        const rightContainerHeight = block.getClientRects()[0].height;
        const navHeight = ContentNav.getClientRects()[0].height;
        // console.log( 'innerContainerHeight', height, navHeight, rightContainerHeight );
        //this.tableConfig.maxHeight = height - 45 - 42 - ((articleNavNodes.length ?? 0) * 45);
        //console.log( rightContainerHeight - 82 - 45 - 42 - navHeight - 12 );
        //console.log( rightContainerHeight - 36 - restHead - 42 - 44 - navHeight - 2 );
        this.tableConfig.maxHeight = rightContainerHeight - 36 - restHead - 42 - 44 - navHeight - 2;
    }

    private setAllTreeExpanded() {
        const { config, MainTable } = this;
        MainTable?.setAllTreeExpand( true );
        this.$nextTick().then( () => {
            Utils.deepFind( config?.dataSource ?? [], item => {
                if ( config.stopExpendCondition?.( item ) ) {
                    item._X_EXPAND = false;
                } else {
                    item._X_EXPAND = true;
                }
                return false;
            }, config.treeChildField ?? 'children' );
        } );
    }

    public mounted() {
        const { calcContentHeight, setInitRestHead, config } = this;
        setInitRestHead();
        calcContentHeight();
        window.addEventListener( 'resize', calcContentHeight );
    }

    public destroyed() {
        const { calcContentHeight } = this;
        window.removeEventListener( 'resize', calcContentHeight );
    }

    private removeLoadedNode( { expanded, row }: { expanded: boolean, row: T } ) {
        const { dataSource, treeChildField, dontReloadExpandNode } = this.config;
        if ( !expanded && !dontReloadExpandNode ) {
            const resultArray = Utils.deepFind( dataSource, item => item.id === row['id'], treeChildField as string );
            if ( resultArray.length ) {
                const parentNode = resultArray[resultArray.length - 1];
                if ( parentNode ) {
                    parentNode[treeChildField as string] = [];
                    parentNode['_X_LOADED'] = false;
                }
            }
        }
    }

    render() {
        const { config, tableConfig } = this, { locale, mainTableConfig } = config;
        return (
            <article class={ `${ Class.main } ${ config.wrapperClass }` } ref={ 'MainContainer' }>
                <input ref={ 'FileInput' } style={ { display: 'none' } } type={ 'file' }
                       onChange={ e => this.fileUpload( e ) }
                />
                <main class={ Class.mainContainer }>
                    <section class={ Class.container }>
                        <nav>
                            <span>{ locale.title }</span>
                        </nav>
                        <article>
                            <nav ref={ 'ContentNav' } class={ `${ Class.optNav } ${ config.articleNavWrapperClass }` }>
                                { config.articleNavNodes ?? [] }
                                { config.navNodes ?? [] }
                            </nav>
                            <vxe-virtual-tree
                                ref={ 'MainTable' }
                                size={ mainTableConfig.size }
                                align={ mainTableConfig.align }
                                stripe={ mainTableConfig.stripe ?? true }
                                border={ mainTableConfig.border ?? true }
                                resizable={ mainTableConfig.resizable ?? true }
                                showOverflow={ mainTableConfig.showOverflow ?? true }
                                rowKey={ mainTableConfig.rowKey ?? 'id' }
                                rowId={ mainTableConfig.rowId ?? 'id' }
                                highlightCurrentRow={ mainTableConfig.highlightCurrentRow ?? false }
                                autoResize={ mainTableConfig.autoResize ?? true }
                                checkboxConfig={ config.checkConfig }
                                // loading={ tableConfig.loading }
                                loading={ config.loading }
                                height={ tableConfig.maxHeight }
                                data={ config.dataSource }
                                columns={ Utils.generateXTableColumns( config.columns ) }
                                cellClassName={ config.cellClassName }
                                rowClassName={ config.rowClassName }
                                treeConfig={ {
                                    lazy: config.lazy,
                                    children: config.treeChildField,
                                    hasChild: config.hasChildField,
                                    loadMethod: config.loadMethod,
                                    expandRowKeys: config.expandRowKeys ?? []
                                } }
                                { ...{
                                    on: {
                                        'current-change': mainTableConfig.currentChange ?? function () {
                                        },
                                        'checkbox-change': mainTableConfig.checkboxChange ?? function () {
                                        },
                                        'checkbox-all': mainTableConfig.checkboxAll ?? function () {
                                        },
                                        'cell-dblclick': mainTableConfig.cellDBClick ?? function () {
                                        },
                                        'toggle-tree-expand': this.removeLoadedNode,
                                        'cell-click': mainTableConfig.cellClick?? function() {}
                                    }
                                } }
                            />
                        </article>
                    </section>
                </main>
            </article>
        );
    }
}
