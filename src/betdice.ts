import xEOSHelper from './assets/xEOSHelper';
import * as tasks from './tasks';
import * as utils from './assets/utils';

const minBalance = 6000; //最小资金量
const maxBalance = 100000; //最大资金量
const maxBetPloidy = 5; //最大投注金额倍数
let seed = 'Kb8F703gFuwj93oWJQ'; //加密种子
let tokenCode = 'betdicetoken';
const isDebugMode = false;

export class BetDice {
  private account = ''; //下单EOS帐号
  private symbol: string; //下注token代码
  private balance: number; //账户初始资金数量
  private roll: number; //投注号码
  private baseDice = 100; //投注金额基数
  private betPloidy = 1; //投注金额倍数

  private winCount = 0; //统计赢局总数
  private loseCount = 0; //统计输局总数
  private serialLoseCount = 0; //连续输局数
  private eosapi: xEOSHelper;

  constructor(account: string, symbol = 'DICE', roll = 50, baseDice = 100) {
    this.account = account;
    this.symbol = symbol;
    this.roll = roll;
    this.baseDice = baseDice;
    this.balance = 3000;
    if (symbol === 'DICE') {
      tokenCode = 'betdicetoken';
    } else {
      tokenCode = 'eosio.token';
    }
    this.eosapi = tasks.initEOSApi(this.account);
    this.updateSeed();
  }

  public fetchBalance(callBack: () => void) {
    if (isDebugMode) {
      callBack();
    } else {
      this.eosapi
        .tokenBalance(tokenCode, this.account)
        .then((result: any) => {
          this.balance = utils.parseBalance(result, this.symbol);
          callBack();
        })
        .catch(utils.dumpError);
    }
  }

  public async updateSeed() {
    let newSeed = await this.eosapi.randomPrivateKey();
    seed = newSeed.substring(0, 18);
    console.log(`自动更换随机seed[${seed}]!`);
  }

  public async doPlay(callBack: (diceNumber: number, payout: number) => void) {
    if (isDebugMode) {
      callBack(Math.round(Math.random() * 100), this.betPloidy * this.baseDice * 2);
    } else {
      let order = utils.amount(this.betPloidy * this.baseDice, this.symbol);
      console.log('下注: ' + order);
      await this.eosapi.transfer(tokenCode, this.account, 'betdiceadmin', order, 'action:bet,seed:' + seed + ',rollUnder:' + this.roll + ',ref:ha3toojugege');
      //暂停30多秒
      utils.sleep((Math.floor(Math.random() * 10 + 1) + 30) * 1000);

      const resultBalance = await this.eosapi.tokenBalance(tokenCode, this.account);
      const newBalance = utils.parseBalance(resultBalance, this.symbol);
      let diceNumber = 90;
      let payout = 0;
      if (newBalance > this.balance) {
        diceNumber = 1;
        payout = newBalance - this.balance;
        if (this.winCount > 2 && this.winCount % 20 == 1) {
          //连赢后自动更换随机seed
          this.updateSeed();
        }
      }
      callBack(diceNumber, payout);
      // const result = await this.eosapi.getActions('betdicelucky', 0, 200);
      // //console.log(result);
      // for (var act of result.actions) {
      //   let actionInfo = act.action_trace.act;
      //   if (act.action_trace.receipt.receiver === this.account && actionInfo.name === 'betreceipt') {
      //     let diceNumber = actionInfo.data.diceNumber;
      //     if (typeof diceNumber !== 'number' || diceNumber < 0 || diceNumber > 100) {
      //       console.error(act);
      //       utils.sleep(1000 * 10);
      //     } else {
      //       let payout = utils.parseAmount(actionInfo.data.payoutAsset);
      //       callBack(diceNumber, payout);
      //     }
      //   }
      // }
    }
  }

  public action() {
    this.fetchBalance(() => {
      this.doPlay((diceNumber, payout) => {
        let order = this.betPloidy * this.baseDice;
        if (diceNumber < this.roll) {
          console.log('赢' + this.balance + '<----------------' + payout);
          this.winCount++;
          this.serialLoseCount = 0;
          this.balance += payout;
          this.betPloidy = 1;
        } else {
          console.error('输' + this.balance + '->' + order);
          this.loseCount++;
          this.serialLoseCount++;
          if (this.serialLoseCount > maxBetPloidy + 2) {
            console.log(`连续输了${this.serialLoseCount}局了,休息一会.....`);
            this.serialLoseCount = 0;
            utils.sleep(62 * 1000);
          }
          this.balance -= order;
          if (this.betPloidy <= 1) {
            this.betPloidy = 2;
          } else if (this.betPloidy >= maxBetPloidy) {
            this.betPloidy = maxBetPloidy;
          } else {
            //this.betPloidy++;
            this.betPloidy *= 2;
          }
        }
        if (minBalance < this.balance && this.balance < maxBalance && this.balance > this.betPloidy * this.baseDice) {
          this.action();
        } else {
          console.log('------------------------------总资金:' + this.balance + ', 总计:赢' + this.winCount + '局, 输' + this.loseCount + '局');
        }
      });
    });
  }

  public async statistics() {
    console.log('----------------游戏数据统计---------------------');
    let count = 0;
    let offset = 1900;
    for (var pos = 0; ; ) {
      const result = await this.eosapi.getActions('betdicetoken', pos, offset);
      //console.log(result);
      for (var act of result.actions) {
        //console.log(act.block_time);
        count++;
        let action_trace = act.action_trace;
        //console.log(act.block_time, action_trace.act.name, action_trace.act.account);
        // if (action_trace.act.name === 'betreceipt') {
        // if (action_trace.receipt.receiver === this.account && action_trace.act.account === 'betdiceadmin') {
        console.log(`trx_id=${action_trace.trx_id}, total_cpu_usage=${action_trace.total_cpu_usage}, block_time=${action_trace.block_time}`);
        console.log(utils.explainActResult(action_trace.act));
        // }
      }
      // if (result.actions.length > 0) {
      //   pos += result.actions.length - 1;
      // } else {
      break;
      // }
    }
    console.log(`----------------游戏数据统计:${count}---------------------`);
  }
}

let betDice = new BetDice('oxoooowatano', 'DICE', 50, 100);
betDice.action();
// betDice.statistics();
