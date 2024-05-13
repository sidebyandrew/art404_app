import { getRequestContext } from '@cloudflare/next-on-pages';
import {
  ACTION_CREATED, ACTION_LIST_FOUND, PINK_BUY_ORDER_CREATE_FAIL,
  PINK_BUY_ORDER_CREATED,
  PINK_SELL_ORDER_CREATED, PINK_SELL_ORDER_FOUND,
  PINK_SELL_ORDER_LIST_FOUND,
  PINK_SELL_ORDER_UPDATED,
  REF_USER_LIST_FOUND, REWARD_SUM_SUCCESS,
  USER_COUNT_FOUND,
  USER_CREATED,
  USER_CREATED_WITH_REF,
} from './static404';
import { USER_FOUND } from '@/utils/static404';
import { generateRefCode, uuid404 } from '@/utils/util404';
import { ActionInfo, BuyOrderInfo, Result404, SellOrderInfo, User404 } from '@/utils/interface404';
import { isMainnet, page_size } from '@/constant/config404';


function db404() {
  if (process.env.NODE_ENV === 'development') {
    const { env } = getRequestContext();
    return env.DB;
  }
  // Production
  return process.env.DB;
}


export async function queryUser(tgId: string): Promise<Result404> {
  let result: Result404 = {
    success: false,
    code: '',
    msg: '',
  };
  // @ts-ignore
  let d1Response = await db404().prepare('select * from ArtUser where tgId=?').bind(tgId).all();
  if (d1Response.success) {
    result.success = d1Response.success;
    if (d1Response.results.length >= 1) {
      result.code = USER_FOUND;
      let { tgId, tgUsername, refCode, refTgId } = d1Response.results[0];
      result.result = { tgId, tgUsername, refCode, refTgId } as User404;
    }
  }
  return result;
}


export async function queryUserCount(): Promise<Result404> {
  let result: Result404 = {
    success: false,
    code: '',
    msg: '',
  };
  // @ts-ignore
  let d1Response = await db404().prepare('select count(tgId) as userCount from ArtUser').all();
  if (d1Response.success) {
    result.success = d1Response.success;
    if (d1Response.results.length >= 1) {
      result.code = USER_COUNT_FOUND;
      let { userCount } = d1Response.results[0];
      result.result = userCount as number;
    }
  }
  return result;
}

export async function queryUserByRefCode(refCode: string): Promise<Result404> {
  let result: Result404 = {
    success: false,
    code: '',
    msg: '',
  };
  if (!refCode || refCode.length < 3) {
    return result;
  }

  // @ts-ignore
  let d1Response = await db404().prepare(
    'select * from ArtUser where refCode=?')
    .bind(refCode).all();
  if (d1Response.success) {
    result.success = d1Response.success;
    if (d1Response.results.length >= 1) {
      result.code = USER_FOUND;
      let { tgId, tgUsername } = d1Response.results[0];
      result.result = { tgId, tgUsername } as User404;
    }
  }
  return result;
}

export async function queryUserListByRefTgId(
  refTgId: string,
): Promise<Result404> {
  let result: Result404 = {
    success: false,
    code: '',
    msg: '',
  };
  if (!refTgId || refTgId.length < 3) {
    return result;
  }

  // @ts-ignore
  let d1Response = await db404()
    .prepare(
      'select * from ArtUser where refTgId=?',
    )
    .bind(refTgId)
    .all();
  if (d1Response.success) {
    result.success = d1Response.success;
    if (d1Response.results.length >= 1) {
      result.code = REF_USER_LIST_FOUND;
      let user404List: User404[] = [];
      for (const record of d1Response.results) {
        let { tgId, tgUsername } = record;
        user404List.push({ tgId, tgUsername } as User404);
      }
      result.result = user404List;
    }
  }
  return result;
}

export async function createUser(tgId: string, tgUsername: string, ref?: User404): Promise<Result404> {

  let result: Result404 = {
    success: false,
    code: '',
    msg: '',
  };
  let userId = uuid404();
  let refCode = generateRefCode(tgUsername);
  let current = Date.now();

  if (ref) {
    // @ts-ignore
    let d1Response: D1Response = await db404().prepare(
      'INSERT INTO ArtUser (userId, tgId, tgUsername, refCode, refTgId, refTgUsername,createBy,createDt) VALUES (?, ?,?,?,?, ?, ?, ?)')
      .bind(userId, tgId, tgUsername, refCode, ref.tgId, ref.tgUsername, tgId, current).run();
    result.success = d1Response.success;
    result.code = USER_CREATED_WITH_REF;
    result.result = {
      tgId,
      tgUsername,
      refCode,
      refTgId: ref.tgId,
      refTgUsername: ref.tgUsername,
    } as User404;
  } else {
    // @ts-ignore
    let d1Response: D1Response = await db404().prepare(
      'INSERT INTO ArtUser (userId, tgId, tgUsername, refCode, createBy,createDt) VALUES (?, ?,?, ?, ?, ?)')
      .bind(userId, tgId, tgUsername, refCode, tgId, current).run();
    result.success = d1Response.success;
    result.code = USER_CREATED;
    result.result = { tgId, tgUsername, refCode } as User404;
  }


  return result;
}


// Action
export async function createArtAction(action: ActionInfo): Promise<Result404> {
  let result: Result404 = {
    success: false,
    code: '',
    msg: '',
  };

  let actionId = uuid404();
  let current = Date.now();
  let targetTable = 'ArtAction';
  if (isMainnet) {
    targetTable = 'ArtAction404';
  }
  let d1Response: D1Response = await db404().prepare(
    `INSERT INTO ${targetTable} (actionId,tgId,tgUsername,actionType,selfReward,targetType,targetId,targetName,targetReward,createBy,createDt) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(actionId, action.tgId, action.tgUsername, action.actionType, action.selfReward, action.targetType, action.targetId, action.targetName, action.targetReward, action.tgId, current).run();
  if (d1Response.success) {
    result.success = d1Response.success;
    result.code = ACTION_CREATED;
  }
  return result;
}

export async function sumRefRewardFromAction(tgId: String): Promise<Result404> {
  let result: Result404 = {
    success: false,
    code: '',
    msg: 'default msg of sumRefRewardFromAction',
  };
  let targetTable = 'ArtAction';
  if (isMainnet) {
    targetTable = 'ArtAction404';
  }

  let d1Response = await db404().prepare(
    `SELECT sum(targetReward) reward FROM ${targetTable} where targetType in ("REF_REWARD_BUY","REF_REWARD_MINT") and targetId=?`)
    .bind(tgId).all();
  if (d1Response.success) {
    if (d1Response.results.length == 1) {
      result.success = true;
      result.code = REWARD_SUM_SUCCESS;
      let reward = d1Response.results[0]?.reward;
      if (reward && parseInt('' + reward) > 0) {
        result.result = reward;
      } else {
        result.result = '0';
        result.msg = 'reward is null';
      }
    }
  }
  return result;
}


export async function queryRewardList(tgId: string, pagination: number): Promise<Result404> {
  let result: Result404 = { success: false, code: '', msg: '' };
  if (tgId && pagination) {
    let targetTable = 'ArtAction';
    if (isMainnet) {
      targetTable = 'ArtAction404';
    }
    let offsetNumber = (pagination - 1) * page_size;
    let sql = `SELECT * FROM ${targetTable} where targetType in ("REF_REWARD_BUY","REF_REWARD_MINT") and targetId=? order by createDt desc limit  ${page_size}  offset ?`;
    let d1Response = await db404()
      .prepare(
        sql,
      ).bind(tgId, offsetNumber)
      .all();

    if (d1Response.success) {
      result.success = d1Response.success;
      result.code = ACTION_LIST_FOUND;
      result.result = [];
      if (d1Response.results.length >= 1) {
        let actionList: ActionInfo[] = [];
        for (const record of d1Response.results) {
          actionList.push(record as ActionInfo);
        }
        result.result = actionList;
      }
    }
  }

  return result;
}


// Action End


// ================  Pink Market Sell Order  =========================


export async function createSellOrder(order: SellOrderInfo): Promise<Result404> {
  let result: Result404 = {
    success: false,
    code: '',
    msg: '',
  };

  let sellOrderId = uuid404();
  let current = Date.now();
  let orderType = 'SEPARABLE'; //SEPARABLE, INSEPARABLE
  let orderMode = 'FREE';//FREE, CUTOFF
  let status = 'INIT'; // INIT, SUBMITTED, PENDING, ONSALE, SOLD, CANCELED
  let targetTable = 'PinkSellOrder';
  if (isMainnet) {
    targetTable = 'PinkSellOrder404';
  }
  let d1Response: D1Response = await db404().prepare(
    `INSERT INTO ${targetTable} (sellOrderId,extBizId,sellerTgId,sellerAddress,sellerT404Address,pinkMarketAddress,pinkOrderSaleAddress,sellAmount,unitPriceInTon,feeNumerator,feeDenominator,orderType,orderMode,status,createBy,createDt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(sellOrderId, order.extBizId, order.sellerTgId, order.sellerAddress, order.sellerT404Address, order.pinkMarketAddress, order.pinkOrderSaleAddress, order.sellAmount, order.unitPriceInTon, order.feeNumerator, order.feeDenominator, orderType, orderMode, status, order.sellerTgId, current).run();
  result.success = d1Response.success;
  result.code = PINK_SELL_ORDER_CREATED;
  return result;
}


export async function querySellOrders(pagination: number, tgId?: string, loginWalletAddress?: string, history?: string): Promise<Result404> {
  let result: Result404 = { success: false, code: '', msg: '' };
  let offsetNumber = (pagination - 1) * page_size;
  let d1Response;
  let targetTable = 'PinkSellOrder';
  if (isMainnet) {
    targetTable = 'PinkSellOrder404';
  }
  if (tgId && loginWalletAddress) {
    // INIT, PENDING, ONSALE, LOCK, SOLD, CANCELED, INVALID
    // INIT, PENDING, LOCK

    let sql = `select * from ${targetTable} where sellerTgId=? and sellerAddress=? and status in("INIT","PENDING","LOCK","ONSALE") order by createDt desc limit ${page_size} offset ?`;
    if (history) {
      sql = `select * from ${targetTable} where sellerTgId=? and sellerAddress=? order by createDt desc limit ${page_size} offset ?`;
    }
    d1Response = await db404()
      .prepare(
        sql,
      ).bind(tgId, loginWalletAddress, offsetNumber)
      .all();
  } else {
    d1Response = await db404()
      .prepare(
        `select * from ${targetTable} where status = \'ONSALE\' order by unitPriceInTon limit  ${page_size} offset ?`,
      ).bind(offsetNumber)
      .all();
  }
  if (d1Response.success) {
    result.success = d1Response.success;
    result.code = PINK_SELL_ORDER_LIST_FOUND;
    let user404List: SellOrderInfo[] = [];
    result.result = user404List;
    if (d1Response.results.length >= 1) {
      for (const record of d1Response.results) {
        user404List.push(record as SellOrderInfo);
      }
    }
  }
  return result;
}


export async function getSellOrder(extBizId: string): Promise<Result404> {
  let result: Result404 = {
    success: false,
    code: '',
    msg: '',
  };
  let d1Response;
  if (extBizId) {
    let targetTable = 'PinkSellOrder';
    if (isMainnet) {
      targetTable = 'PinkSellOrder404';
    }

    d1Response = await db404()
      .prepare(
        `select * from ${targetTable} where extBizId=? `,
      ).bind(extBizId)
      .all();
    if (d1Response.success) {
      if (d1Response.results.length == 1) {
        result.success = true;
        result.code = PINK_SELL_ORDER_FOUND;
        result.result = d1Response.results[0] as SellOrderInfo;
      }
    }
  }
  return result;
}


export async function updateSellOrderStatus(extBizId: string, status: string): Promise<Result404> {
  let result: Result404 = {
    success: false,
    code: '',
    msg: '',
  };
  let targetTable = 'PinkSellOrder';
  if (isMainnet) {
    targetTable = 'PinkSellOrder404';
  }

  // @ts-ignore
  let current = Date.now();
  let d1Response = await db404().prepare(`update ${targetTable} set status=?,modifyDt=? where extBizId=?`).bind(status, current, extBizId).all();
  if (d1Response.success) {
    result.success = d1Response.success;
    result.code = PINK_SELL_ORDER_UPDATED;
    result.msg = `extBizId=${extBizId}`;
  }
  return result;
}


// ================  Pink Market Sell Order End  =====================


// Pink Market Buyer Order


export async function createBuyOrder(order: BuyOrderInfo): Promise<Result404> {
  let result: Result404 = {
    success: false,
    code: PINK_BUY_ORDER_CREATE_FAIL,
    msg: '',
  };

  try {
    let buyOrderId = uuid404();
    let current = Date.now();

    let targetTable = 'PinkBuyOrder';
    if (isMainnet) {
      targetTable = 'PinkBuyOrder404';
    }

    let d1Response: D1Response = await db404().prepare(
      `INSERT INTO ${targetTable} (buyOrderId,extBizId,sellOrderId,buyerTgId,buyerAddress,orderType,orderMode,createBy,createDt) VALUES (?,?,?,?,?,?,?,?,?)`)
      .bind(buyOrderId, order.extBizId, order.sellOrderId, order.buyerTgId, order.buyerAddress, order.orderType, order.orderMode, order.buyerTgId, current)
      .run();


    if (d1Response.success) {
      result.success = d1Response.success;
      result.result = buyOrderId;
      result.code = PINK_BUY_ORDER_CREATED;
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    console.error(err);
    throw err;
  }
  return result;
}


// Pink Market Buyer Order End
