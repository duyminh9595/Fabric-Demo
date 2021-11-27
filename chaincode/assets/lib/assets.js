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
  async changeOwner(ctx) {

    /// we use the args option
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

        const asset = JSON.parse(res.value.value.toString());
        asset.owner = "duy";
        await ctx.stub.putState(keys, Buffer.from(JSON.stringify(asset)));

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

}

module.exports = Cs01Contract