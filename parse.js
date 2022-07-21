/*
 *  HTML2BLOG.JS -> PARSE.JS
 *  (c) 2022 Lingrottin &
 *           University of Fool
 *  LISENCED UNDER MIT LICENSE
 */
exports.parseWebP = function(config){
    if(config.convert){
        if(config.lossless){
            return `-lossless -z ${config.lossless_compress} -alpha_q 100`;
        }
        else{
            return `-q ${config.quality} -alpha_q ${config.alpha_quality}`;
        }
    }
    else{
        return new String();
    }
}
exports.parseTemplate = function(template, imagePrefix, n, fmt){
    template=template.replace(/%p/g, imagePrefix);
    template=template.replace(/%n/g, n);
    template=template.replace(/%f/g, fmt);
    return template;
}