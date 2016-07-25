
## 常用的正则表达式

---

#### 校验某个URL是否在指定的domain下

```js
//检查某个url是否在qq.com域下：
const reg = /^https?\:\/\/([\w\-]+\.)*qq\.com/i;

//--------------------

/**
 * 检查某个url是否在指定的一组域名下
 * @param {String} url 指定要检查的url
 * @param {Array} domain 要检查的域名列表
 * @return {Boolean} 检查结果是否匹配。
 */
const check = function(url, domains){
  let res = domains.some(function(domain, index){
    //需要将domain里面的点号替换为正则参数的\\.
    let _domain = domain.replace(/\./g, "\\.");
    const reg = new RegExp(`^https?\\:\\/\/([\\w\-]+\\.)*${_domain}\/`, "i");
    return reg.test(url);
  });
  console.info(`"${url}" is ${res ? "matched" : "not matched"} ${domains}`);
  return res;
};

//test:
check('http://pallas.tgp.qq.com/xx.html?ab=34', ['qq.com', 'youku.com', 'iqiyi.com']); //true
check('http://qq.com/xx.html?ab=34', ['qq.com', 'youku.com', 'aiqiyi.com']); //true
check('http://www.qqq.com/xx.html?ab=34&d=youku.com', ['qq.com', 'youku.com', 'aiqiyi.com']); //false
check('http://www.youku.com.cn/xx.html?ab=34', ['qq.com', 'youku.com', 'iqiyi.com']); //false

```
