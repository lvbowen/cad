import { Component, PropSync, ProvideReactive, Vue, Watch } from 'vue-property-decorator';
import { CAProviderAuthEnum } from '@ctesi/core/enum';
import { ProjectConfig } from "@ctesi/core/type";


/**
 * Config and Authorization Provider
 */
@Component( {
    name: 'CAProvider'
} )
export default class CAProvider extends Vue {

    @PropSync( 'config', { required: true } ) projectConfig!: ProjectConfig;

    @ProvideReactive( 'CAProvider' ) projectCAConfig = this.projectConfig;

    private AuthStatus: CAProviderAuthEnum = CAProviderAuthEnum.pass;

    @Watch( 'AuthStatus', { immediate: true } )
    AuthStateListener( status: CAProviderAuthEnum ) {
        const { projectConfig } = this;
        projectConfig?.AuthChange?.( status )
    }

    @Watch( 'projectConfig.authorized', { immediate: true } )
    AuthorizedListener( status: boolean ) {
        this.AuthStatus = status && CAProviderAuthEnum.pass || CAProviderAuthEnum.forbidden;
    }

    render() {
        const { continueRender, AuthStatus } = this;
        return (
            <article>
                { continueRender( AuthStatus ) }
            </article>
        );
    }

    private continueRender( access: string ) {
        //@ts-ignore
        const { AuthStatus, projectConfig, $slots, $route } = this;
        if ( projectConfig.whiteList.includes( ($route.name as string) ) ) {
            return $slots.default;
        } else {
            if ( AuthStatus === CAProviderAuthEnum.pass ) return $slots.default;
        }
    }

}