import { createArtAction, querySellOrders, queryUser } from '@/utils/db404';
import { ActionInfo, Result404, User404 } from '@/utils/interface404';
import {
  IS_POINT_BEING_COUNTING,
  MINT_POINT_REWARD_50,
} from '@/constant/config404';
import { ACTION_CREATED, BUY_T404, MINT_T404, REF_REWARD_BUY, REF_REWARD_MINT, USER_FOUND } from '@/utils/static404';

export const runtime = 'edge';

export async function GET(request: Request) {
  console.info('/api/mint');
  let result404: Result404 = { success: false };
  try {
    const { searchParams } = new URL(request.url);
    const tgId = searchParams.get('tgId');
    const loginWallet = searchParams.get('loginWallet');
    const mintAmount = searchParams.get('mintAmount');
    let access404 = searchParams.get('access404');

    if (!tgId) {
      result404.code = 'ERROR: tgId 404';
      return Response.json(result404);
    }
    if (!loginWallet) {
      result404.code = 'ERROR: Login WalletAddress 404';
      return Response.json(result404);
    }
    if (!mintAmount) {
      result404.code = 'ERROR: Login WalletAddress 404';
      return Response.json(result404);
    }
    if (access404 != 'error_code_404') {
      result404.code = 'ERROR: 404';
      return Response.json(result404);
    }
    console.info(`/api/mint with ${tgId}  ${loginWallet}  ${mintAmount}`);

    // 1. 根据 mint tgId 获取 minter, 得到推荐人 refTgId
    // 2. 根据推荐人 refTgId 获得推荐人信息
    if (IS_POINT_BEING_COUNTING) {
      let minterRes = await queryUser(tgId);
      if (minterRes.success && USER_FOUND == minterRes.code) {
        let minter = minterRes.result as User404;
        let referUserRes = await queryUser(minter.refTgId);
        if (referUserRes.success && USER_FOUND == referUserRes.code) {
          let referUser = referUserRes.result as User404;
          let action: ActionInfo = {};
          action.tgId = minter.tgId;
          action.tgUsername = minter.tgUsername;
          action.actionType = MINT_T404;
          action.selfReward = 0;
          action.targetType = REF_REWARD_MINT;
          action.targetId = referUser.tgId;
          action.targetName = referUser.tgUsername;
          action.targetReward = 1;
          action.extInfo = '' + mintAmount;
          try {
            let mintAmt = parseInt('' + mintAmount);
            if (mintAmt > 5) {
              mintAmt = 5;
            }
            let targetRewardCal = Math.ceil(MINT_POINT_REWARD_50 * mintAmt);
            if (targetRewardCal < 1) {
              targetRewardCal = 1;
            }
            action.targetReward = targetRewardCal;
          } catch (e) {
            console.error(e);
          }
          let actionRes = await createArtAction(action);
          if (actionRes.success && actionRes.code == ACTION_CREATED) {
            console.info(`Minter ${tgId} mint ${mintAmount} T404, reward to ${referUser.tgId} with ${action.targetReward} points`);
            result404.success = true;
            result404.msg = JSON.stringify(action);
          } else {
            console.error(`Mint ${tgId} fail to reward ${referUser.tgId}, action create fail.`);
          }
        } else {
          console.error(`Referral user not found! ${minter.refTgId}`);
        }
      } else {
        console.error(`Minter not found! ${tgId}`);
      }
    }

    return Response.json(result404);
  } catch (error) {
    if (error instanceof Error) {
      result404.msg = error.message;
    }
    console.error(`Minter ERROR: ` + JSON.stringify(result404));
    return Response.json(result404);
  }
}
