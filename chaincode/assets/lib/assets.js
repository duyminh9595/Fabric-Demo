'use strict';

// SDK Library to asset with writing the logic 
const { Contract } = require('fabric-contract-api');

class Cs01Contract extends Contract {

  constructor() {
    super('Cs01Contract');
    this.TxId = ''
  }

  async beforeTransaction(ctx) {
    // default implementation is do nothing
    this.TxId = ctx.stub.getTxID();
    console.log(`we can do some logging for ${this.TxId}  and many more !!`)
  }

  //created user org duyminh
  async createUser(ctx, email, pass, name, mspid) {
    console.info('============= START : createUser ===========');

    const user = {
      email: email,
      pass: pass,
      name: name,
      mspid: mspid,
    };
    console.info('============= End : createUser ===========');
    const buffer = await ctx.stub.putState(user.email, Buffer.from(JSON.stringify(user)));
    let response = `successfully created user account for ${user.email}. Use your email 
    and password log in to the Healthcare Network above.`
    return response;
  }


  async createAssets(ctx, _nameasset, _incredient, _owner, _description) {
    let _keyHelper = new Date();
    // compose our model
    let model = {
      nameasset: _nameasset,
      datecreated: _keyHelper,
      incredient: _incredient,
      owner: _owner,
      description: _description,
      txId: this.TxId
    }

    try {

      // store the composite key with a the value
      let indexName = 'year~month~date~txid'


      let _keyYearAsString = _keyHelper.getFullYear().toString()
      let _keyMonthAsString = _keyHelper.getMonth().toString()
      let _keyDateAsString = _keyHelper.getDate().toString();

      let yearMonthIndexKey = await ctx.stub.createCompositeKey(indexName, [_keyYearAsString, _keyMonthAsString, _keyDateAsString, this.TxId]);

      //console.info(yearMonthIndexKey, _keyYearAsString, _keyMonthAsString, this.TxId);

      // store the new state
      await ctx.stub.putState(yearMonthIndexKey, Buffer.from(JSON.stringify(model)));

      // compose the return values
      return {
        key: _keyYearAsString + '~' + _keyMonthAsString + '~' + _keyDateAsString + '~' + this.TxId
      };

    } catch (e) {
      throw new Error(`The tx ${this.TxId} can not be stored: ${e}`);
    }
  }

  async getCsByYearMonthDate(ctx) {

    // we use the args option
    const args = ctx.stub.getArgs();

    // we split the key into single peaces
    const keyValues = args[1].split('~')

    // collect the keys
    let keys = []
    keyValues.forEach(element => keys.push(element))

    // do the query
    let resultsIterator = await ctx.stub.getStateByPartialCompositeKey('year~month~date~txid', keys);

    // prepare the result
    const allResults = [];
    while (true) {
      const res = await resultsIterator.next();

      if (res.value) {
        // if not a getHistoryForKey iterator then key is contained in res.value.key
        allResults.push(res.value.value.toString('utf8'));
        //console.log('V:',res.value.value.toString('utf8'))
        //console.log('K:',res.value.key.toString('utf8'))
      }

      // check to see if we have reached then end
      if (res.done) {
        //console.log(res.done)
        // explicitly close the iterator            
        await resultsIterator.close();
        return allResults;
      }
    }
  }

  /**
   * CouchDb Query test
   * 
   * @param {*} ctx 
   * @returns 
   */
  async getCsByTimeRange(ctx) {
    // we use the args option
    const args = ctx.stub.getArgs();

    // break condition
    if (args.length !== 3) {
      return JSON.stringify({ error: true });
    }

    // we collect our result
    let allResults = [];

    // compose the selector
    let queryString = {};
    queryString.selector = {};
    queryString.selector.datecreated = {
      $gt: args[1],
      $lt: args[2]
    }
    queryString.sort = [{ "datecreated": "asc" }]

    //console.log(queryString)
    // --------------------

    // do the query
    let resultsIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));

    // loop over the results and create the allResults array
    let result = await resultsIterator.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
      let record;
      try {
        record = JSON.parse(strValue);
      } catch (err) {
        console.log(err);
        record = strValue;
      }
      allResults.push({ Key: result.value.key, Record: record });
      result = await resultsIterator.next();
    }

    // return the finale result
    return JSON.stringify(allResults);
  }
  async updateincredient(ctx, assetid, _incredient) {
    console.info('============= START : deleteMyAsset ===========');
    const exists = await this.myAssetExists(ctx, assetid);
    if (!exists) {
      throw new Error(`The my asset ${assetid} does not exist`);
    }
    const asset = JSON.parse(exists.toString());
    asset.incredient = _incredient;
    await ctx.stub.putState(assetid, Buffer.from(JSON.stringify(asset)));
    console.info('============= END : changeAssetOwner ===========');
  }

  async deleteMyAsset(ctx, _assetid) {
    // do the query
    let resultsIterator = await ctx.stub.getState('year~month~date~txid', _assetid);

    if (!resultsIterator || resultsIterator.length === 0) {
      throw new Error(`${_assetid} does not exist`);
    }
    await ctx.stub.deleteState(_assetid);
  }
  async afterTransaction(ctx, result) {
    // default implementation is do nothing
    console.log(`TX ${this.TxId} done !!`)
  }


  //register user
  async registerUser(ctx, email, password, username, ngaysinh) {
    const user = {
      email,
      password,
      username,
      ngaysinh,
      balance: 0
    };
    await ctx.stub.putState(email, Buffer.from(JSON.stringify(user)));
    console.info('============= END : Create User ===========');
  }
  //login user
  async queryUser(ctx, email) {
    const userAsBytes = await ctx.stub.getState(email);
    if (!userAsBytes || userAsBytes.length === 0) {
      throw new Error(`${userAsBytes} does not exist`);
    }
    console.log(userAsBytes.toString());
    return userAsBytes.toString();
  }
  //doi mat khau
  async changePassword(ctx, email, password) {
    const userAsBytes = await ctx.stub.getState(email);
    if (!userAsBytes || userAsBytes.length === 0) {
      throw new Error(`${userAsBytes} does not exist`);
    }
    const userInfo = JSON.parse(userAsBytes.toString());
    userInfo.password = password;
    await ctx.stub.putState(email, Buffer.from(JSON.stringify(userInfo)));
    console.info('============= END : change Password User ===========');
  }
  //doi thong tin user
  async changeUserInfo(ctx, email, ngaysinh, username) {
    const userAsBytes = await ctx.stub.getState(email);
    if (!userAsBytes || userAsBytes.length === 0) {
      throw new Error(`${userAsBytes} does not exist`);
    }
    const userInfo = JSON.parse(userAsBytes.toString());
    userInfo.username = username
    userInfo.ngaysinh = ngaysinh
    await ctx.stub.putState(email, Buffer.from(JSON.stringify(userInfo)));
    console.info('============= END : change User Info ===========');
  }
  //change balance of user
  async changeBalanceUser(ctx, email, amount) {
    const userAsBytes = await ctx.stub.getState(email);
    if (!userAsBytes || userAsBytes.length === 0) {
      throw new Error(`${userAsBytes} does not exist`);
    }
    const userBalance = JSON.parse(userAsBytes.toString());
    userBalance.balance = amount;
    await ctx.stub.putState(email, Buffer.from(JSON.stringify(userBalance)));
    console.info('============= END : change Balance User ===========');
  }
  //add income
  async addIncomeUser(ctx, email, income_name, amount, currency, rate_currency, id_income) {
    const userAsBytes = await ctx.stub.getState(email);
    if (!userAsBytes || userAsBytes.length === 0) {
      throw new Error(`${userAsBytes} does not exist`);
    }
    let _keyHelper = new Date();
    const userIncome = {
      email,
      date_created: _keyHelper,
      income_name,
      amount,
      currency,
      rate_currency,
      docType: 'incomeuser',
      id_income,
      type: 'add'
    };
    try {

      // store the composite key with a the value
      let indexName = 'year~month~date~txid'


      let _keyYearAsString = _keyHelper.getFullYear().toString()
      let _keyMonthAsString = _keyHelper.getMonth().toString()
      let _keyDateAsString = _keyHelper.getDate().toString();

      let yearMonthIndexKey = await ctx.stub.createCompositeKey(indexName, [_keyYearAsString, _keyMonthAsString, _keyDateAsString, this.TxId]);
      await ctx.stub.putState(yearMonthIndexKey, Buffer.from(JSON.stringify(userIncome)));
      const userBalance = JSON.parse(userAsBytes.toString());
      userBalance.balance = parseInt(userBalance.balance, 10) + parseInt(amount, 10) * parseInt(rate_currency, 10);
      await ctx.stub.putState(email, Buffer.from(JSON.stringify(userBalance)));
      console.info('============= END : change Balance User ===========');

      // compose the return values
      return {
        key: _keyYearAsString + '~' + _keyMonthAsString + '~' + _keyDateAsString + '~' + this.TxId
      };
    }
    catch (e) {
      throw new Error(`The tx ${this.TxId} can not be stored: ${e}`);
    }
  }
  //add spending
  async addSpendingUser(ctx, email, spend_name, amount, currency, rate_currency, id_spending) {
    const userAsBytes = await ctx.stub.getState(email);
    if (!userAsBytes || userAsBytes.length === 0) {
      throw new Error(`${userAsBytes} does not exist`);
    }
    let _keyHelper = new Date();
    const userSpending = {
      email,
      date_created: _keyHelper,
      spend_name,
      amount,
      currency,
      rate_currency,
      docType: 'spendinguser',
      id_spending,
      type: 'add'
    };
    try {

      // store the composite key with a the value
      let indexName = 'year~month~date~txid'


      let _keyYearAsString = _keyHelper.getFullYear().toString()
      let _keyMonthAsString = _keyHelper.getMonth().toString()
      let _keyDateAsString = _keyHelper.getDate().toString();

      let yearMonthIndexKey = await ctx.stub.createCompositeKey(indexName, [_keyYearAsString, _keyMonthAsString, _keyDateAsString, this.TxId]);
      await ctx.stub.putState(yearMonthIndexKey, Buffer.from(JSON.stringify(userSpending)));
      const userBalance = JSON.parse(userAsBytes.toString());
      userBalance.balance = parseInt(userBalance.balance, 10) - parseInt(amount, 10) * parseInt(rate_currency, 10);
      await ctx.stub.putState(email, Buffer.from(JSON.stringify(userBalance)));
      console.info('============= END : change Balance User ===========');

      // compose the return values
      return {
        key: _keyYearAsString + '~' + _keyMonthAsString + '~' + _keyDateAsString + '~' + this.TxId
      };
    }
    catch (e) {
      throw new Error(`The tx ${this.TxId} can not be stored: ${e}`);
    }
  }
  //add target de danh
  async addTarget(ctx, email, name_target, start_date, end_date, amount, currency, rate_currency, id) {
    const userAsBytes = await ctx.stub.getState(email);
    if (!userAsBytes || userAsBytes.length === 0) {
      throw new Error(`${userAsBytes} does not exist`);
    }
    let _keyHelper = new Date();
    const userTarget = {
      email,
      name_target,
      start_date,
      end_date,
      amount: amount * rate_currency,
      current_balance: 0,
      currency,
      rate_currency,
      docType: 'target',
      id
    };
    try {
      await ctx.stub.putState(this.TxId, Buffer.from(JSON.stringify(userTarget)));

      // compose the return values
      return {
        key: this.TxId
      };
    }
    catch (e) {
      throw new Error(`The tx ${this.TxId} can not be stored: ${e}`);
    }
  }
  //update amount target
  async updateAmountTarget(ctx, id, amount) {
    const targetUserAsBytes = await ctx.stub.getState(id);
    if (!targetUserAsBytes || targetUserAsBytes.length === 0) {
      throw new Error(`${targetUserAsBytes} does not exist`);
    }
    const targetUser = JSON.parse(targetUserAsBytes.toString());
    targetUser.amount = amount;
    await ctx.stub.putState(id, Buffer.from(JSON.stringify(targetUser)));
    console.info('============= END : change target User ===========');
  }
  //see all target of an email
  async seeAllTargetEmail(ctx, email) {
    const userAsBytes = await ctx.stub.getState(email);
    if (!userAsBytes || userAsBytes.length === 0) {
      throw new Error(`${userAsBytes} does not exist`);
    }
    let queryString = {};
    queryString.selector = {};
    queryString.selector.docType = 'target';
    queryString.selector.email = email;
    let queryResults = await this.getQueryResultForQueryString(ctx.stub, JSON.stringify(queryString));
    return queryResults; //shim.success(queryResults);
  }
  //add transaction to target
  async addTransactionTarget(ctx, email, id_target, amount, currency, rate_currency) {
    const userAsBytes = await ctx.stub.getState(email);
    if (!userAsBytes || userAsBytes.length === 0) {
      throw new Error(`${userAsBytes} does not exist`);
    }
    let _keyHelper = new Date();
    const userAddAmountTarget = {
      email,
      date_created: _keyHelper,
      amount,
      currency,
      rate_currency,
      id_target
    };
    try {

      // store the composite key with a the value
      let indexName = 'year~month~date~txid'


      let _keyYearAsString = _keyHelper.getFullYear().toString()
      let _keyMonthAsString = _keyHelper.getMonth().toString()
      let _keyDateAsString = _keyHelper.getDate().toString();

      let yearMonthIndexKey = await ctx.stub.createCompositeKey(indexName, [_keyYearAsString, _keyMonthAsString, _keyDateAsString, this.TxId]);




      await ctx.stub.putState(yearMonthIndexKey, Buffer.from(JSON.stringify(userAddAmountTarget)));

      const targetUserAsBytes = await ctx.stub.getState(id_target);
      if (!targetUserAsBytes || targetUserAsBytes.length === 0) {
        throw new Error(`${targetUserAsBytes} does not exist`);
      }
      const targetUser = JSON.parse(targetUserAsBytes.toString());
      targetUser.current_balance = targetUser.current_balance + amount * rate_currency;
      await ctx.stub.putState(id_target, Buffer.from(JSON.stringify(targetUser)));
      console.info('============= END : change target amount User ===========');


      // compose the return values
      return {
        key: _keyYearAsString + '~' + _keyMonthAsString + '~' + _keyDateAsString + '~' + this.TxId
      };
    }
    catch (e) {
      throw new Error(`The tx ${this.TxId} can not be stored: ${e}`);
    }
  }
  //see transaction to target
  async seeTransactionHasAddedTarget(ctx, email, id_target) {
    const userAsBytes = await ctx.stub.getState(email);
    if (!userAsBytes || userAsBytes.length === 0) {
      throw new Error(`${userAsBytes} does not exist`);
    }
    let queryString = {};
    queryString.selector = {};
    queryString.selector.email = email;
    queryString.selector.id_target = id_target;
    let queryResults = await this.getQueryResultForQueryString(ctx.stub, JSON.stringify(queryString));
    return queryResults; //shim.success(queryResults);
  }
  //see all user income
  async seeAllUserIncome(ctx, email) {
    const userAsBytes = await ctx.stub.getState(email);
    if (!userAsBytes || userAsBytes.length === 0) {
      throw new Error(`${userAsBytes} does not exist`);
    }
    let queryString = {};
    queryString.selector = {};
    queryString.selector.docType = 'incomeuser';
    queryString.selector.email = email;
    let queryResults = await this.getQueryResultForQueryString(ctx.stub, JSON.stringify(queryString));
    return queryResults; //shim.success(queryResults);
  }
  //see all user spending base on income id
  async seeAllUserSpendingBaseIncomeId(ctx, email, id_income) {
    const userAsBytes = await ctx.stub.getState(email);
    if (!userAsBytes || userAsBytes.length === 0) {
      throw new Error(`${userAsBytes} does not exist`);
    }
    let queryString = {};
    queryString.selector = {};
    queryString.selector.docType = 'incomeuser';
    queryString.selector.email = email;
    queryString.selector.id_income = id_income;
    let queryResults = await this.getQueryResultForQueryString(ctx.stub, JSON.stringify(queryString));
    return queryResults; //shim.success(queryResults);
  }
  //see all user spending
  async seeAllUserSpending(ctx, email) {
    const userAsBytes = await ctx.stub.getState(email);
    if (!userAsBytes || userAsBytes.length === 0) {
      throw new Error(`${userAsBytes} does not exist`);
    }
    let queryString = {};
    queryString.selector = {};
    queryString.selector.docType = 'spendinguser';
    queryString.selector.email = email;
    let queryResults = await this.getQueryResultForQueryString(ctx.stub, JSON.stringify(queryString));
    return queryResults; //shim.success(queryResults);
  }
  //see all user spending base on spending id
  async seeAllUserSpendingBaseSpendingId(ctx, email, id_spending) {
    const userAsBytes = await ctx.stub.getState(email);
    if (!userAsBytes || userAsBytes.length === 0) {
      throw new Error(`${userAsBytes} does not exist`);
    }
    let queryString = {};
    queryString.selector = {};
    queryString.selector.docType = 'spendinguser';
    queryString.selector.email = email;
    queryString.selector.id_spending = id_spending;
    let queryResults = await this.getQueryResultForQueryString(ctx.stub, JSON.stringify(queryString));
    return queryResults; //shim.success(queryResults);
  }
  //see all include spending and income
  async seeAllUserTransaction(ctx, email) {
    const userAsBytes = await ctx.stub.getState(email);
    if (!userAsBytes || userAsBytes.length === 0) {
      throw new Error(`${userAsBytes} does not exist`);
    }
    let queryString = {};
    queryString.selector = {};
    queryString.selector.email = email;
    queryString.selector.type = 'add'
    let queryResults = await this.getQueryResultForQueryString(ctx.stub, JSON.stringify(queryString));
    return queryResults; //shim.success(queryResults);
  }
  //see infor target id
  async seeInforTarget(ctx, email, targetid) {
    const userAsBytes = await ctx.stub.getState(email);
    if (!userAsBytes || userAsBytes.length === 0) {
      throw new Error(`${userAsBytes} does not exist`);
    }
    const targetAsbytes = await ctx.stub.getState(targetid);
    if (!targetAsbytes || targetAsbytes.length === 0) {
      throw new Error(`${targetAsbytes} does not exist`);
    }
    console.log(targetAsbytes.toString());
    return targetAsbytes.toString();
  }
  async getQueryResultForQueryString(stub, queryString) {

    console.info('- getQueryResultForQueryString queryString:\n' + queryString)
    let resultsIterator = await stub.getQueryResult(queryString);

    let results = await this.getAllResults(resultsIterator, false);

    //return Buffer.from(JSON.stringify(results));
    return results;
  }
  async getAllResults(iterator, isHistory) {
    let allResults = [];
    while (true) {
      let res = await iterator.next();

      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        console.log(res.value.value.toString('utf8'));

        if (isHistory && isHistory === true) {
          jsonRes.TxId = res.value.tx_id;
          jsonRes.Timestamp = res.value.timestamp;
          jsonRes.IsDelete = res.value.is_delete.toString();
          try {
            jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
          } catch (err) {
            console.log(err);
            jsonRes.Value = res.value.value.toString('utf8');
          }
        } else {
          jsonRes.Key = res.value.key;
          try {
            jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
          } catch (err) {
            console.log(err);
            jsonRes.Record = res.value.value.toString('utf8');
          }
        }
        allResults.push(jsonRes);
      }
      if (res.done) {
        console.log('end of data');
        await iterator.close();
        console.info(allResults);
        return allResults;
      }
    }
  }
}

module.exports = Cs01Contract