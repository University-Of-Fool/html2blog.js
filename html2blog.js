// 引入https
const https=require('node:https');
const { argv } = require('node:process');

// 引入颜色
const colors=require('colors-console');

// 引入 generate.js
const generate=require('./generate.js');

// Program Start!
function getHelp(){
  // 打印用法
  console.log(colors("blue","USAGE"),"node <process> <url> <output html> <image prefix>");
}
if(process.argv.length != 5){
  console.log(colors("red","FATAL"),"参数数目不规范！");
  getHelp()
  process.exit();
}

var htmlString=new String();
var info=colors("green","INFO");
var args={ // 使用命令行参数初始化 args 变量
  link: argv[2],
  filename: argv[3],
  imagePrefix: argv[4]
}

// 开始爬取网页内容
console.log(info,'开始下载网页')
https.get(args.link,function(response){
  response.on("data", function(chunk){
    htmlString+= chunk;
  });
  response.on("end", function(){
    console.log(info,"网页已下载");
    //开始生成
    generate.startGenerating(htmlString,args);
  });
});
