

import { FormControlLike } from '../control-like';


// eslint-disable-next-line no-shadow
export enum TimeUnit {

    Year = 'y',

    Month = 'M',

    Day = 'd',

    Hour = 'h',

    Minute = 'm',

    Second = 's',

    Week = 'w',

    Quarter = 'q',
    
    Days = 'dd',

    Hours = 'hh',

}


const time_unit_zh: { [key: string]: string } = {

    [TimeUnit.Year]: '年',

    [TimeUnit.Month]: '月',
    
    [TimeUnit.Days]: '日',

    [TimeUnit.Day]: '天',

    [TimeUnit.Hour]: '小时',

    [TimeUnit.Hours]: '时',

    [TimeUnit.Minute]: '分',

    [TimeUnit.Second]: '秒',

    [TimeUnit.Week]: '周',

    [TimeUnit.Quarter]: '季度',
}


export function timespan(d1: Date | null, d2: Date | null, unit: TimeUnit, precision = 0.5) {

    if (!d1 || !d2) {
        return null;
    }

    const ms = d1.getTime() - d2.getTime();

    const p = precision * 10;
    let divisor = 0;

    switch (unit) {

        case TimeUnit.Second:
            divisor = 1000;
            break;

        case TimeUnit.Minute:
            divisor += 60 * 1000;
            break;

        case TimeUnit.Hour:
            divisor += 60 * 60 * 1000;
            break;

        case TimeUnit.Day:
            divisor += 24 * 60 * 60 * 1000;
            break;

        case TimeUnit.Month:
            divisor += 30 * 24 * 60 * 60 * 1000;
            break;

        case TimeUnit.Year:
            divisor += 365 * 24 * 60 * 60 * 1000;
            break;

        default:
            throw new Error('Unknown time unit');
    }

    let val = Math.floor((Math.abs(ms) / divisor * 10) / p) * p / 10;

    if(ms < 0){
        val *= -1;
    }

    return val;
}


export class TextFnProvider {

    dateDiff(d1: FormControlLike, d2: FormControlLike, unit: TimeUnit) {

        const type = 'date';

        if(d1.type !== type || d2.type !== type){
            return '';
        }

        const ts = timespan(d1.value, d2.value, unit);

        // console.log('diff', d1, d2, unit, ts);
        if(typeof ts !== 'number'){
            return '';
        }

        const t = ts + time_unit_zh[unit];

        return t;
    }

    getDateText(d1: Date | null, uint: TimeUnit) {
        if (!d1 || !(d1 instanceof Date)) {
            return '';
        }

        let val = 0;

        switch (uint) {

            case TimeUnit.Year:
                val = d1.getFullYear();
                break;

            case TimeUnit.Month:
                val = d1.getMonth() + 1;
                break;

            case TimeUnit.Days:
                val = d1.getDate();
                break;

            case TimeUnit.Hours:
                val = d1.getHours();
                break;

            case TimeUnit.Minute:
                val = d1.getMinutes();
                break;

            case TimeUnit.Second:
                val = d1.getSeconds();
                break;

            case TimeUnit.Quarter:
                val = Math.ceil((d1.getMonth() + 1) / 3);
                break;

        }

        if (uint === TimeUnit.Week) {
            const temp = new Date(d1.getFullYear(), 0, 1);
            const firstWeekDay = temp.getDay();
            const month = d1.getMonth();
            let days = d1.getDate();
            for (let i = 0; i < month; i++) {
                temp.setMonth(i + 1, 0);
                days += temp.getDate();
            }
            val = Math.ceil((days + firstWeekDay - 1) / 7);
            
            const t = '第' + val + time_unit_zh[uint];
            return t;
        }else{
            const t = val + time_unit_zh[uint];
            return t;
        }
    }

    dateYear(d1: FormControlLike) {
        return this.getDateText(d1.value, TimeUnit.Year);
    }

    dateMonth(d1: FormControlLike) {
        return this.getDateText(d1.value, TimeUnit.Month);
    }

    dateDay(d1: FormControlLike) {
        return this.getDateText(d1.value, TimeUnit.Days);
    }

    dateWeekNum(d1: FormControlLike) {
        return this.getDateText(d1.value, TimeUnit.Week);
    }

    dateQuarter(d1: FormControlLike) {
        return this.getDateText(d1.value, TimeUnit.Quarter);
    }

    dateHour(d1: FormControlLike) {
        return this.getDateText(d1.value, TimeUnit.Hours);
    }

    dateMinute(d1: FormControlLike) {
        return this.getDateText(d1.value, TimeUnit.Minute);
    }

    dateSecond(d1: FormControlLike) {
        return this.getDateText(d1.value, TimeUnit.Second);
    }

    concat(...args: any[]) {
        const str = args.map(a => {
            if (a.type && typeof a.toString === 'function') {
                return a.toString();
            } else if (typeof a === 'string') {
                return a;
            }
            return '';
        }).join('');

        return str;
    }

    substr(arg: any, start: number, end?: number) {

        let str = '';
        if (arg.type && typeof arg.toString === 'function') {
            str = arg.toString();
        } else if (typeof arg === 'string') {
            str = arg;
        }

        str = str.substring(start, end);
        return str;
    }

    mathMax(...args: any[]) {
        // console.log(args,'111')
        const maxValue:number[] = [];
        args.map((i)=> {
            if(i.type && typeof i.toString === 'function') {
                if(!Number.isNaN(parseFloat(i._value))) {
                    maxValue.push(parseFloat(i._value))
                }
            }else if(typeof i === "number") {
                maxValue.push(i)
            }
        });
        maxValue.sort((v1,v2)=>{
            if(v1>v2) {
                return 1
            }else {
                return -1
            }
        });
        // console.log(maxValue,'maxValue')
        return maxValue.length && maxValue[maxValue.length-1]
    }

    mathMin(...args: any[]) {
        const minValue:number[] = [];
        args.map((i)=> {
            if(i.type && typeof i.toString === 'function') {
                if(!Number.isNaN(parseFloat(i._value))) {
                    minValue.push(parseFloat(i._value))
                }
            }else if(typeof i === "number") {
                minValue.push(i)
            }
        });
        minValue.sort((v1,v2)=>{
            if(v1>v2) {
                return 1
            }else {
                return -1
            }
        });
        return minValue.length && minValue[0]
    }

    getIP() {
        //@ts-ignore
        const cip = '';
        const cname = '';
        // const cip = returnCitySN["cip"];
        // //@ts-ignore
        // const cname = returnCitySN['cname']
        if(!cip || !cname) return ''
        return `当前ip地址：${cip}   当前ip归属地:${cname}`
    }

    subStringLeft(...args: any[]) {
        // debugger
        let result:string = '';
        if(args.length===1){
            if(args[0].type && typeof args[0].toString === 'function') {
                result = args[0]._value
            }
        }else {
            let str = '';
            if(args[0].type && typeof args[0].toString === 'function') {
                str = args[0]._value
            }
            if(typeof args[1] === 'number') {
                str.length<args[1]?result=str:result = str.substring(0,args[1])
            }
        }
        return result
    }
}
