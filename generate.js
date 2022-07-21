const { stripVTControlCharacters } = require("node:util"); // 我也不知道这是什么，是 vsc 自己给我加的

// 引入文件系统
const fs=require("node:fs");

// 引入 https
const https=require('https');

// 引入颜色
const colors=require('colors-console');

// 引入 JSDOM
const jsdom=require("jsdom");
const { JSDOM } = jsdom;

// 引入 WEBP 转换器
const webp=require('webp-converter');

// 引入  流程控制器
const async=require('async');
const { createDiffieHellman } = require("node:crypto");
const { resolve } = require("node:path");

// 简单的 log 方法，输出以绿色 INFO 开头的文字
function info(information){
    console.log(colors("green","INFO"),information);
}


function loadDOM(html,argument){
    //载入DOM
    const dom=new JSDOM(html);
    var document=dom.window.document;
    var div=document.querySelector('div.entry-content'); // 选择文章入口元素，仅适用于单一网站，请记得修改
    info("DOM 已载入");
    var srcs=new Array();
    div.querySelectorAll('img').forEach(function(node,n){
        srcs[n]=node.src;
        node.src=(`/img/${argument.imagePrefix}/${argument.imagePrefix}-${n}.webp`);
    });// 选择所有的 img 元素并改写图片引用路径
    info("图片路径已改写");
    try{fs.writeFileSync(`./output/${argument.filename}`, div.innerHTML, 'utf8');}
    catch(err){
        console.error(err);
        console.log(colors("red", "FATAL"), "出现错误");
        process.exit(1);
    }
    info("HTML 文件已写入");
    return srcs;
}

// 从网站下载图片的方法，单独分一个方法是为了避免异步
function processSingleImage(source,n,argument){
    info(`正在下载图片 ${n+1}`);
    https.get(source, function (response) {
        var data=new String(); // 文件内容总是字符串
        response.setEncoding("binary"); // 不设置成 binary 会导致乱码
        response.on("data", function (chunk) {
            data+=chunk;
        });
        response.on("end",function(){
            fs.writeFileSync(('./cache/' + n.toString() + '.png'), data, 'binary'/* 同上 */, err => {
                if (err) {
                    console.error(err);
                    console.log(colors("red", "FATAL"), "出现错误");
                    process.exit(1);
                }
            });
            info(`图片 ${n+1} 下载完成`);
            try{
            webp.cwebp(`./cache/${n}.png`,`./output/${argument.imagePrefix}/${argument.imagePrefix}-${n}.webp`,"-q 70 -alpha_q 50");
            }
            catch(err){
                console.error(err);
                console.log(colors("red", "FATAL"), "出现错误");
                process.exit(1);
            }
            finally{
                info(`图片 ${n+1} 转换完成`);
            }
        })
    })
}

function processImages(srcs,argument){
    info(`开始下载和转换图片，总计 ${srcs.length.toString()} 个`);
    srcs.forEach(function(value,key){
        processSingleImage(value, key, argument);
    });
}

function createDir(dir){
    try{fs.mkdirSync(dir);}
    catch(err){
        if(err.code!="EEXIST"){ // EEXIST: 文件夹已存在
            console.error(err);
            console.log(colors("red", "FATAL"), "出现错误");
            process.exit(1);
        }
        console.log(colors("yellow", "WARN"), `目录 ${dir} 已存在`);
    }
}
exports.startGenerating = function(html,argument){
    info("开始生成");
    var srcs;
    async.series([
        function(callback){
            createDir(`./output/`);
            createDir(`./cache/`);
            createDir(`./output/${argument.imagePrefix}`);
            callback(null,"createdir");
        },
        function(callback){
            srcs= loadDOM(html,argument);
            callback(null,"loaddom");
        },
        function(callback){
            processImages(srcs,argument);
            callback(null,"downimage");
        },

        function(callback){
            info("生成完成！");
            callback(null,"done");
        }
    ]);
}