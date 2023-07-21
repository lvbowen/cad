import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import Icon from "../icon/Icon";
import { HttpResponse, ThemeConfig } from "@ctesi/core/type";

@Component( {
    name: 'ApplicationToProject',
    components: {
        Icon
    }
} )
export default class ApplicationToProject<T> extends Vue {

    @Prop() projectPath?: string;

    @Prop() uploadFunc?: ( formData: FormData ) => Promise<HttpResponse<T>>;

    @Prop() setFile?: Function;

    @Prop() messageHandle?: Function;

    @Prop() projectConfig?: ThemeConfig;

    private isSingleProject: boolean = false;

    private operationRef: string | null = null;

    private logoUploadActive: boolean = false;

    private backgroundUploadActive: boolean = false;

    private port: number = 9200;

    private projectLogo: string | null = null;

    private projectBackground: string | null = null;

    private projectPortBlackList: Array<number> = [];

    @Watch( 'projectConfig', { immediate: true } )
    projectConfigListener( value: ThemeConfig ) {
        this.projectPortBlackList = value?.portList;
        if ( value?.id ) {
            this.isSingleProject = true;
            this.port = value.port;
            this.projectLogo = value.logo;
            this.projectBackground = value.background;

        }
    }

    render() {
        const {
            isSingleProject,
            triggerUpload,
            fileUpload,
            projectLogo,
            projectBackground,
            portHandle,
            port,
            logoUploadActive,
            backgroundUploadActive
        } = this;
        return (
            <article class={ "ApplicationToProject_main" }>
                <aside>
                    <span>项目部署：</span>
                    <input onChange={ ( e ) => {
                        this.isSingleProject = (e?.currentTarget as HTMLInputElement).checked;
                        this.port = 9200;
                    } } type={ 'checkbox' } checked={ isSingleProject } disabled={ !!this.projectConfig?.id }/>
                    <span class={ "ApplicationToProject_tips" }>将应用作为一个项目进行部署</span>
                </aside>
                {
                    isSingleProject &&
                    <section class={ "ApplicationToProject_main_config" }>
                        <aside>
                            <span>项目端口：</span>
                            <input
                                value={ port }
                                onChange={ ( e ) => portHandle( (e?.currentTarget as HTMLInputElement).value ) }
                                min={ 9200 }
                                max={ 49151 }
                                type={ 'number' }
                                readonly={ !!this.projectConfig?.id }
                            />
                            <span class={ "ApplicationToProject_tips" }>项目部署的端口只能在9200 - 49151之间</span>
                        </aside>
                        { this.$slots.default }
                        <aside>
                            <span>logo图片：</span>
                            <section>
                                <div
                                    onClick={ ( e ) => triggerUpload( 'logoUpload' ) }
                                    class={ "ApplicationToProject_main_upload" }
                                    img-role={ 'logo' }
                                    onMouseover={ () => this.uploadMask( 'logo', true ) }
                                    onMouseleave={ () => this.uploadMask( 'logo', false ) }
                                >
                                    <div style={ {
                                        opacity: logoUploadActive ? 1 : 0,
                                        transition: 'all .3s',
                                        position: 'absolute'
                                    } }
                                         class={ "ApplicationToProject_mask" }
                                    >
                                        <div class={ "ApplicationToProject_mask_bg" } style={ {
                                            opacity: logoUploadActive ? 0.6 : 0,
                                            position: 'absolute',
                                            width: '100%',
                                            height: '100%'
                                        } }/>
                                        <span>上传项目Logo</span>
                                    </div>
                                    <icon
                                        ref={ 'logoIcon' }
                                        src={ projectLogo ?? 'uploadIcon' }
                                        external={ !!projectLogo }
                                        className={ projectLogo ?? 'ApplicationToProject_iconDefault' }
                                    />
                                </div>
                                <input
                                    onChange={ ( e ) => fileUpload( 'logo', e ) }
                                    ref={ 'logoUpload' }
                                    class={ "ApplicationToProject_main_config_upload" }
                                    type={ 'file' }
                                    accept={ '*' }
                                />
                                <span class={ "ApplicationToProject_tips" }>项目使用的Logo,大小不超过1MB</span>
                            </section>

                        </aside>
                        <aside>
                            <span>背景图片：</span>
                            <section>
                                <div
                                    onClick={ () => triggerUpload( 'backgroundUpload' ) }
                                    class={ "ApplicationToProject_main_upload" }
                                    img-role={ 'background' }
                                    onMouseover={ () => this.uploadMask( 'background', true ) }
                                    onMouseleave={ () => this.uploadMask( 'background', false ) }
                                >
                                    <div style={ {
                                        opacity: backgroundUploadActive ? 1 : 0,
                                        transition: 'all .3s',
                                        position: 'absolute'
                                    } }
                                         class={ "ApplicationToProject_mask" }
                                    >
                                        <div class={ "ApplicationToProject_mask_bg" } style={ {
                                            opacity: backgroundUploadActive ? 0.6 : 0,
                                            position: 'absolute',
                                            width: '100%',
                                            height: '100%'
                                        } }/>
                                        <span>上传登录背景</span>
                                    </div>
                                    <icon
                                        ref={ 'backgroundIcon' }
                                        src={ projectBackground ?? 'uploadIcon' }
                                        external={ !!projectBackground }
                                        className={ projectBackground ?? 'ApplicationToProject_iconDefault' }
                                    />
                                </div>
                                <input
                                    onChange={ ( e ) => fileUpload( 'background', e ) }
                                    ref={ 'backgroundUpload' }
                                    class={ "ApplicationToProject_main_config_upload" }
                                    type={ 'file' }
                                    accept={ '*' }
                                />
                                <span class={ "ApplicationToProject_tips" }>项目登录页使用的背景图片，大小不超过1MB</span>
                            </section>
                        </aside>

                    </section>
                }
            </article>
        );
    }

    /*@Watch('isSingleProject', {immediate: true})
    isSingleProjectListener(boolean: boolean) {
        if (boolean) this.portHandle(`9200`);
    }*/

    private fileUpload( key: string, e ) {
        const files = e.target.files, { messageHandle, setFile } = this.$props, { operationRef } = this,
            fileReader = new FileReader();
        if ( files && files[0] ) {
            console.log( 'files', files );
            const file = files[0];
            const fileFormat = file.name.slice( file.name.lastIndexOf( '.' ) + 1 ).toLowerCase();
            if ( [ 'png', 'jpg', 'jpeg' ].indexOf( fileFormat ) === -1 ) return messageHandle?.()?.error?.( '只能上传*.png/*.jpg/*.jpeg的图片文件!' );
            if ( file.size > 1024 * 1024 * 5 ) return messageHandle?.()?.error?.( '图片大小不能超过5MB!' );
            const formData = new FormData();
            !setFile && formData.append( 'path', (this.projectPath as string) );
            formData.append( `${ key }`, file );
            setFile?.( formData );
            if ( operationRef ) {
                fileReader.onloadend = ( readerEvent ) => {
                    this[operationRef] = (readerEvent.target?.result as string);
                }
                fileReader.readAsDataURL( file );
            }
            /*this.uploadFunc?.(formData).then(res => {
                if (res.errcode !== 0) return messageHandle?.error?.(res.errmsg as string);
                // this.$message.success('icon上传成功',1);
                messageHandle?.success?.('图片上传成功');
            });*/
        }

    }

    private triggerUpload( type: string ) {
        switch ( type ) {
            case 'logoUpload':
                (this.$refs['logoUpload'] as HTMLInputElement)?.click();
                this.operationRef = 'projectLogo';
                break;
            case 'backgroundUpload':
                (this.$refs['backgroundUpload'] as HTMLInputElement)?.click();
                this.operationRef = 'projectBackground';
                break;
        }
    }

    private portHandle( value: string ) {
        const num = Number( value ), { setFile, messageHandle } = this.$props, { projectPortBlackList } = this,
            formData = new FormData();
        if ( isNaN( num ) ) return;
        if ( projectPortBlackList.find( item => item === num ) ) return messageHandle?.()?.error?.( '已被占用的端口!' );
        if ( num < 9200 ) {
            this.port = 9200;
        } else if ( num > 49151 ) {
            this.port = 49151;
        } else {
            this.port = num;
        }
        formData.set( 'port', `${ this.port }` );
        setFile?.( formData );
    }

    private uploadMask( value: string, active: boolean ) {
        switch ( value ) {
            case 'logo':
                this.logoUploadActive = active;
                break;
            case 'background':
                this.backgroundUploadActive = active;
                break;
            default:
                break;
        }
    }
}