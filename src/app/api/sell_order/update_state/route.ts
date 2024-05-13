import { ActionInfo, BuyOrderInfo, Result404, SellOrderInfo, User404 } from '@/utils/interface404';
import {
  createBuyOrder, createArtAction,
  createUser,
  getSellOrder,
  queryUser,
  queryUserByRefCode,
  updateSellOrderStatus,
} from '@/utils/db404';
import {
  ACTION_CREATED,
  BUY_T404,
  PINK_SELL_ORDER_FOUND, REF_REWARD_BUY,
  USER_FOUND,
} from '@/utils/static404';
import { BUY_POINT_REWARD_5, IS_POINT_BEING_COUNTING } from '@/constant/config404';

export const runtime = 'edge';

export async function GET(request: Request) {
  let result404: Result404 = { success: false };
  try {
    const { searchParams } = new URL(request.url);
    const tgId = searchParams.get('tgId');
    const extBizId = searchParams.get('extBizId');
    const status = searchParams.get('status');
    const loginWalletAddress = searchParams.get('loginWalletAddress');
    let access404 = searchParams.get('access404');
    if (access404 != 'error_code_404') {
      result404.code = 'ERROR: 404';
      return Response.json(result404);
    }
    if (!tgId) {
      result404.code = 'ERROR: tgId 404';
      return Response.json(result404);
    }
    if (!extBizId) {
      result404.code = 'ERROR: extBizId 404';
      return Response.json(result404);
    }
    if (!status) {
      result404.code = 'ERROR: status 404';
      return Response.json(result404);
    }
    if (status == 'SOLD' && !loginWalletAddress) {
      result404.code = 'ERROR: Wallet Address 404';
      return Response.json(result404);
    }
    let sellOrderResponse = await getSellOrder(extBizId);
    if (sellOrderResponse && sellOrderResponse.success && sellOrderResponse.code == PINK_SELL_ORDER_FOUND) {
      let sellOrder = sellOrderResponse.result as SellOrderInfo;
      if (status != sellOrder.status) {
        result404 = await updateSellOrderStatus(extBizId, status);
        console.info(`[Update] update Sold Order extBizId=${extBizId} to ${status}`);
        if ('SOLD' == status) {
          console.info(`[Update BUY Referral] update Sold Order extBizId=${extBizId} for ${tgId}`);
          let buyerTgId = tgId;
          let buyOrder: BuyOrderInfo = {};
          buyOrder.extBizId = extBizId;
          buyOrder.sellOrderId = sellOrder.sellOrderId;
          buyOrder.buyerTgId = buyerTgId;
          buyOrder.buyerAddress = '' + loginWalletAddress;
          buyOrder.orderType = sellOrder.orderType;
          buyOrder.orderMode = sellOrder.orderMode;
          let result = await createBuyOrder(buyOrder);

          if (IS_POINT_BEING_COUNTING) {
            // 1. 根据 buyerTgId 获取买家, 得到推荐人 refTgId
            // 2. 根据推荐人 refTgId 获得推荐人信息
            let buyerRes = await queryUser(buyerTgId);
            if (buyerRes.success && USER_FOUND == buyerRes.code) {
              let buyer = buyerRes.result as User404;
              let referUserRes = await queryUser(buyer.refTgId);
              if (referUserRes.success && USER_FOUND == referUserRes.code) {
                let referUser = referUserRes.result as User404;
                let action: ActionInfo = {};
                action.tgId = buyerTgId;
                action.tgUsername = buyer.tgUsername;
                action.actionType = BUY_T404;
                action.selfReward = 0;
                action.targetType = REF_REWARD_BUY;
                action.targetId = referUser.tgId;
                action.targetName = referUser.tgUsername;
                action.targetReward = 1;
                action.extInfo = '' + sellOrder.sellAmount;
                try {
                  let sellAmt = parseInt('' + sellOrder.sellAmount);
                  let targetRewardCal = Math.ceil(BUY_POINT_REWARD_5 * sellAmt);
                  if (targetRewardCal < 1) {
                    targetRewardCal = 1;
                  }
                  action.targetReward = targetRewardCal;
                } catch (e) {
                  console.error(e);
                }
                let actionRes = await createArtAction(action);
                if (actionRes.success && actionRes.code == ACTION_CREATED) {
                  console.info(`Buyer ${buyerTgId} buy ${sellOrder.sellAmount} T404, reward to ${referUser.tgId} with ${action.targetReward} points`);
                } else {
                  console.error(`Buyer ${buyerTgId} fail to reward ${referUser.tgId}, action create fail.`);
                }
              } else {
                console.info(`${buyerTgId} not have ref user!`);
              }
            } else {
              console.error('Buyer not found!');
            }
          }

          return Response.json(result);
        } else {
          console.info(`[Already SOLD]  Sold Order extBizId=${extBizId} for ${tgId}`);
        }
      } else {
        console.error('Status match, no need to update.');
      }
    }

    return Response.json(result404);
  } catch (error) {
    if (error instanceof Error) {
      result404.msg = error.message;
    }
    return Response.json(result404);
  }
}
