# EOSAdmin --  EOS管理工具箱
EOS现在虽然有很多效率工具, 但都不够直接了当, 所以抽空写了个, 顺便学习下EOS的相关API. 

## EOSAdmin的目标

+ 简单的编程实现一些自动化操作. 例如: 自动发币, 币价监控, bancor类发币经济模型测试, 游戏外挂等
+ 封装EOS及其侧链(ENU, Fibos)的js API, 一套API通吃所有;[TODO]
+ 简单的密钥管理, 小额自动免密操作;[TODO]
+ Bancor类发币生成工具, 经济模型建模测试及币价突变点监控预警等.
+ 一些Dapp的自动化操作. **目前实现了一个[BetDice](https://betdice.one/?ref=oxoooowatano)自动投注机器人**

## 为何选择EOSAdmin
---
+ 基于最新版本的eosjs api(20.0.0-beta1)开发

+ 使用typescript及其相关前端工程化工具

+ 只包含最核心代码, 可以任意集成到项目中

+ 最小类库依赖, 而且尽可能保证浏览器中运行; 运行环境只需要nodejs即可, 而且支持windows, linux和mac等操作系统, 不需安装EOS相关开发工具;

+ 简单粗暴, 可以作为新手API学习参照代码范例


## 基础组件
---
+ **xEOSHelper.ts** EOS类js API公用操作封装类
+ **tasks.ts** 钱包及常用任务封装
+ **betdice.ts** [BetDice](https://betdice.one/?ref=oxoooowatano)自动下单机器人

## 环境搭建
---
+ 安装nodejs, 去[官网](https://nodejs.org)下载v10.x版本NodeJs,并安装;

+ 在命令行下安装cnpm:

```shell
npm install -g cnpm --registry=https://registry.npm.taobao.org
```
+ 进入根目录, 安装相关全局工具和相关依赖:

```shell
cnpm install
```
+ 在根目录下添加`allEOSAccountsLive.json` 文件保存下单EOS帐号的active和owner(可空)公钥私钥. 

**注意:**

1. 这个文件只存储在本地, 只要你保管好这个文件不泄漏, 那么你的私钥也是安全的, 程序代码完全开源, 没有后门盗窃你的私钥.
1. 如果还是不放心,请使用自己的零钱钱包帐号, 不要在这个帐号中存放大额资金
1. 下一步准备使用一个通用的加密算法管理此钱包文件, 敬请期待:)
1. `allEOSAccounts.json` 为本人测试环境使用公钥私钥, 请不要乱动, 谢谢!

```json
{
  "oxwatanox345": [
    "EOS65S3Fm8nQcV1mEjbNsBCZJxkrtiS6P7yadhohCq2bNHcE7ygeD", 
    "5JjnywysiRmZ6eyC7MbcnTgRDW3GgtYsFsh7Psny19Jvrv6ZUwL",
    "",
    ""
  ]
}
```

+ 修改机器人启动参数

  ```typescript
  let betDice = new BetDice('oxoooowatano', 'DICE', 50, 100);//下单帐号, 下单代币类型,支持(EOE和DICE), 投注数字, 下单金额基数
  ```

1. 运行**[BetDice](https://betdice.one/?ref=oxoooowatano)机器人**
```shell
npm run betdice
```



## BetDice自动下单机器人

### 概述

**[BetDice](https://betdice.one/?ref=oxoooowatano)**游戏最近火爆异常, 可以低成本获得一些DICE代币进行游戏, 所以无聊时可以玩玩, 非常有意思! 但是在手机和PC桌面玩时非常麻烦,每次下单后都要点击多次确认,手机上还要输入密码,玩多了鼠标受不鸟:(

而且最关键的是这类游戏可以使用一种策略保证长期的收益. 所以就写了个机器人给大家薅一下项目方的羊毛,哈哈

### 策略说明

基本思路按照大神[比特币硕士-杨超](https://weibo.com/yangchao8)的策略:

+ 持续小额连续投注
+ 当输了时投注金额加倍; 赢了时投注金额重置为初始值
+ [新增] 定期自动随机更换下注加密种子seed
+ [新增] 连续输n局后自动休息一会
+ [新增] 到达最小金额`minBalance`或最大金额`maxBalance`时自动终止机器人
+ [新增] 到达最大投注倍数`maxBetPloidy`时停止增加倍数, 并适当休息一会
+ 支持EOS和DICE投注, 可以
+ [TODO] 目前EOS的API不能正确获取投注结果信息获取, 所以目前直接比较代币金额变化判断游戏输赢. 正确的相关代码已经注释, 请懂整的哥们帮忙看看什么原因,谢谢!
+ 支持DEBUG模式快速粗暴测试策略, 修改 `const isDebugMode = true;`.
+ BetDice官方绝对在随机算法里动了手脚, 长期运行程序收益会越来越不稳定, 建议定期换号运行. 
+ 欢迎各位策略达人分享你们的成功经验, 我来改进策略.
+ CPU资源不够的兄弟们可以使用[虎符CPU bank](https://eos.hoo.com/cpu)租用, 感觉还是很不错的, 费用也低. 妈妈再也不用担心我的CPU不够用了:)

### 源代码

机器人源代码在`src\betdice.ts`文件中, 使用typescript编写, 请自行研究代码,谢谢! 

## 关于我们

+ [微博](https://www.jianshu.com/u/ffQXX5)
+ [github主页](https://github.com/watano)
+ EOS帐号 [oxoooowatano](https://eospark.com/MainNet/account/oxoooowatano), 欢迎打赏聊天!
