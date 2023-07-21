// 时间转换
export const formatTimeStr = (stayTime: number):string=> {
    let day: number = 0;
    let hour: number = 0;
    let min: number = 0;
    day = Math.floor(stayTime / (24 * 60 * 60 * 1000));
    hour = Math.floor(stayTime % (24 * 60 * 60 * 1000) / (60 * 60 * 1000));
    min = Math.floor(stayTime % (24 * 60 * 60 * 1000) % (60 * 60 * 1000) / (60 * 1000));
    if (day > 0) {
        return `${day}天${hour}小时`;
    }
    return `${hour}小时${min}分钟`;
}