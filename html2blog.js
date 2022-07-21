#!/usr/bin/env node
/*
 *  HTML2BLOG.JS
 *  (c) 2022 Lingrottin &
 *           University of Fool
 *  LISENCED UNDER MIT LICENSE
 */
// 引入https
var webProtocol;

// 引入颜色
const colors=require('colors-console');

// 引入 generate.js
const generate=require('./generate.js');

// 引入 parse.js
const parse=require('./parse.js');

// 引入 Commander
const {program} = require("commander");

// 引入文件系统
const fs=require("fs");

// 引入 TOML 解析器
const toml = require('toml');

// Program Start!

// 读取命令行参数
program
  .version('0.1.0')
  .requiredOption('-u, --url <string>', '博客链接')
  .requiredOption('-f, --filename <string>', "Markdown 文件的路径")
  .requiredOption('-p, --image-prefix <string>', '图片文件的前缀')
  .option('-c, --config <string>', "配置文件路径", './config.toml')
  .parse(process.argv);
// 读取配置文件
const options=program.opts();
var config=toml.parse(fs.readFileSync(options.config));
var args={ // 使用命令行参数初始化 args 变量
  link: options.url,
  filename: options.filename,
  imagePrefix: options.imagePrefix,
  webp: config.WebP.convert,
  webpArg: parse.parseWebP(config.WebP),
  protocol: config.Download.protocol,
  outputDir: config.Output.output_dir,
  cacheDir: config.Output.cache_dir,
  outputImagePath: config.Output.img_path,
  markdown: config.Generate.markdown,
  genImagePath: config.Generate.img_path,
  mdConfig:{
    headingStyle: config.Markdown.heading,
    bulletListMarker: config.Markdown.bullet,
    codeBlockStyle: config.Markdown.codeBlockStyle,
    fence: config.Markdown.codeBlockFence,
    emDelimiter: config.Markdown.emDelimiter,
    strongDelimiter: config.Markdown.strongDelimiter
  }
}
var htmlString=new String();

function info(infor){
  console.log(colors("green", "INFO"), infor);
}

// 开始爬取网页内容
info('开始下载网页')
webProtocol=require(args.protocol);
webProtocol.get(args.link,function(response){
  response.on("data", function(chunk){
    htmlString+= chunk;
  });
  response.on("end", function(){
    info("网页已下载");
    //开始生成
    generate.startGenerating(htmlString,args);
  });
});
