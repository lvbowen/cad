
import ReportOptions from '@h3/report/dist/options';

let inited = false;

import env from '@/config/env';

export function init() {

    if (inited) {
        return;
    }

    inited = true;

    ReportOptions.baseUrl = env.portalHost;
    ReportOptions.charts = { list: { dimension: 50 } };
    
    ReportOptions.download.list = true;
    ReportOptions.download.pivotTable = true;
    
    ReportOptions.requestHeader = () => {
        const token = localStorage.getItem('token');
        if(!token){
            return null;
        }

        return {
            Authorization : 'Bearer ' + token
        }
    }

}

init();