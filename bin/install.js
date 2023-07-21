const PATH = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const rootPath = PATH.join(__dirname, '..');

const Target = PATH.join(rootPath, 'entries');

const folders = fs.readdirSync(Target).filter(folder => !['.DS_Store'].includes(folder));

console.log('folders:', folders);
console.log('nexus address =====>',process.env.nexus);

function execAsync(command) {

    return new Promise((resolve, reject) => {
        // 执行
        //console.log('exec start:', command);

        exec(command, function (error, stdout, stderr) {
            if (error) {
                reject(error);
            } else {
                //console.log('exec end:', stdout);
                resolve(stdout);
            }
        })
    });

}


function install(index) {

    const folder = folders[index];
    const fullPath = PATH.join(Target, folder);

    //env
    const nexus = process.env.nexus;

    // 定义执行指令
    const command = `cd ${fullPath} && npm i ${nexus&&'--registry='+nexus}`;
    //const command = 'cd ' + fullPath + ' && npm i ';

    // 先从外网安装私库没有的模块
    //const internetCmd = `cd ${fullPath} && npm i typescript@4.0.5 --save-dev @typescript-eslint/eslint-plugin@4.7.0 --save-dev  @typescript-eslint/parser@4.7.0 --save-dev @typescript-eslint/typescript-estree@4.7.0 --save-dev @vue/eslint-config-typescript@7.0.0 --save-dev vue-tsx-support@3.0.2 --save-dev`
    const internetCmd = command;
    // execAsync(internetCmd);

    if (index < folders.length - 1) {
        // return execAsync(command).then(() => {
        //     return install(++index);
        // });
        /* 如果需要安装 */
        /*return execAsync(internetCmd).then(()=>{
            return execAsync(command).then(()=>{
                return install(++index);
            })
        })*/
        return execAsync(command).then(()=>{
            return install(++index);
        })
    } else {
        return execAsync(command);
        /*return execAsync(internetCmd).then(()=>{
            return execAsync(command)
        })*/
    }

}


install(0).then(()=>{
    //env
    const nexus = process.env.nexus;

    const command = `cd ${rootPath} && npm i ${nexus&&'--registry='+nexus} && npm run package`;

    // const command = `cd ${rootPath} && npm i && npm run package`
    execAsync(command);
});