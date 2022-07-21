/*
 *  HTML2BLOG.JS -> GENERATE.JS
 *  (c) 2022 Lingrottin &
 *           University of Fool
 *  LISENCED UNDER MIT LICENSE
 */
// 引入文件系统
const fs=require("node:fs");

// 引入 https
var webProtocol;

// 引入颜色
const colors=require('colors-console');

// 引入 JSDOM
const jsdom=require("jsdom");
const { JSDOM } = jsdom;

// 引入 path （用来创建文件夹）
const path=require("path");

// 引入 WEBP 转换器
const webp=require('webp-converter');

// 引入 async 流程控制器
const async=require('async');

// 引入 parse.js
const parse=require("./parse.js");

// 引入 Turndown
var TurndownService = require('turndown');
var turndownService = new TurndownService({
    codeBlockStyle: "fenced",
    fence: '```',
    headingStyle: "atx"
});

// 简单的 log 方法，输出以绿色 INFO 开头的文字
function info(information){
    console.log(colors("green","INFO"),information);
}


function loadDOM(_html,argument){
    //载入DOM
    const dom=new JSDOM(_html);
    var document=dom.window.document;
    var div=document.querySelector('div.entry-content'); // 选择文章入口元素，仅适用于单一网站，请记得修改
    info("DOM 已载入");
    var srcs=new Array();
    div.querySelectorAll('img').forEach(function(node,n){
        srcs[n]=node.src;
        //node.src=(`/img/${argument.imagePrefix}/${argument.imagePrefix}-${n}.webp`);
    });// 选择所有的 img 元素并改写图片引用路径

    div.querySelectorAll('div.wp-block-image').forEach(function(node,n){
        var imgouter=`<img src="${parse.parseTemplate(argument.genImagePath, argument.imagePrefix, n, function(){
            if(argument.webp){return "webp";}else{return "png";}
        })}" ></img>`;
        node.outerHTML=imgouter;
    });// 去除 img 外层的 <div> 和多余参数

    /***********
     * 
     * 以下代码只适用于特定的网页，请按需更改！
     * 
     ***********/
    div.querySelectorAll('style').forEach(function(node){
        node.outerHTML=null;
    });// 去除所有的样式表

    div.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(function(node){
        var headingText=node.textContent;
        node.innerHTML=headingText;
    });// 去除标题外层的 span

    div.querySelectorAll('small.shcb-language').forEach(function(node){
        node.outerHTML=null;
    });// 去除 highlight 插件添加的代码语言

    div.querySelectorAll('pre').forEach(function(node){
        var codeText=node.textContent;
        node.outerHTML=`<pre><code>${codeText}\n</code></pre>`;
    });// 使 <pre> 只保留内部代码
    /***********
     * 
     * 以上代码只适用于特定的网页，请按需更改！
     * 
     ***********/
    var html=new String();
    div.innerHTML.split('\n').forEach(function(line){
        if(line!=new String()){
            html+=`${line}\n`;
        }
    });//去除空行

    var output
    if(argument.markdown){
        output=turndownService.turndown(html);//转换 Markdown
        info("文件已改写");
    }
    else{
        output=html;
    }

    try{fs.writeFileSync(`${argument.outputDir}/${argument.filename}`, output, 'utf8');}
    catch(err){
        console.error(err);
        console.log(colors("red", "FATAL"), "出现错误");
        process.exit(1);
    }
    var fileType;
    if(argument.markdown){
        fileType="Markdown";
    }
    else{
        fileType="HTML"
    }
    info(`${fileType} 文件已写入`);
    return srcs;
}

// 从网站下载图片的方法，单独分一个方法是为了避免异步
function processSingleImage(source,n,argument){
    info(`正在下载图片 ${n+1}`);
    webProtocol.get(source, function (response) {
        var data=new String(); // 文件内容总是字符串
        response.setEncoding("binary"); // 不设置成 binary 会导致乱码
        response.on("data", function (chunk) {
            data+=chunk;
        });
        response.on("end",function(){
            fs.writeFileSync((`${argument.cacheDir}/${n.toString()}.png`), data, 'binary'/* 同上 */, err => {
                if (err) {
                    console.error(err);
                    console.log(colors("red", "FATAL"), "出现错误");
                    process.exit(1);
                }
            });
            info(`图片 ${n+1} 下载完成`);
            if(argument.webp){
                try{
                webp.cwebp(`${argument.cacheDir}/${n}.png`,`${argument.outputDir}/${parse.parseTemplate(argument.outputImagePath, argument.imagePrefix, n,"webp")}`,argument.webpArg);
                }
                catch(err){
                     console.error(err);
                    console.log(colors("red", "FATAL"), "出现错误");
                    process.exit(1);
               }
               finally{
                   info(`图片 ${n+1} 转换完成`);
               }
            }
            else{
                try{
                    var img=fs.readFileSync(`${argument.cacheDir}/${n.toString()}.png`, 'binary');
                    fs.writeFileSync(`${argument.outputDir}/${parse.parseTemplate(argument.genImagePath, argument.imagePrefix, n,"webp")}`, img, 'binary');
                }
                catch(err){
                    console.error(err);
                   console.log(colors("red", "FATAL"), "出现错误");
                   process.exit(1);
                }
                finally{
                    info(`图片 ${n+1} 复制完成`);
                }
            }
        })
    })
}

function processImages(srcs,argument){
    info(`开始下载和处理图片，总计 ${srcs.length.toString()} 个`);
    srcs.forEach(function(value,key){
        processSingleImage(value, key, argument);
    });
}

function createDir(dir){
    var brk=false;
    try{
        fs.mkdirSync(dir);
        while(!brk){
            dir=path.dirname(dir);
            fs.mkdirSync(dir);
        }
    }
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
    webProtocol=require(argument.protocol);
    var srcs;
    async.series([
        function(callback){
            createDir(`${argument.outputDir}`);
            createDir(`${argument.cacheDir}`);
            createDir( `${path.dirname(argument.outputDir + "/" + argument.filename)}`);
            createDir(`${argument.outputDir}/${parse.parseTemplate(path.dirname(argument.outputImagePath), argument.imagePrefix, 0, "0")}`);
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