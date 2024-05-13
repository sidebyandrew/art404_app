import type { NextRequest } from 'next/server';
import { createUser, queryUser, queryUserByRefCode } from '@/utils/db404';
import { USER_FOUND } from '@/utils/static404';
import { Result404, User404 } from '@/utils/interface404';

export const runtime = 'edge';


export async function POST(request: NextRequest) {
  let result: Result404 = { success: false, code: '', msg: '' };
  try {
    let requestJson = await request.json<User404>();
    let tgId = requestJson.tgId;
    let tgUsername = requestJson.tgUsername;
    let refCode = requestJson.refCode;
    if (tgId && tgUsername) {
      let queryResult = await queryUser(tgId);
      if (queryResult.success && USER_FOUND == queryResult.code) {
        result.success = true;
        result.code = 'USER_EXISTED';
        result.msg = 'User is existed, cannot referral.';
      } else {
        let refUserResult = await queryUserByRefCode(refCode);
        if (refUserResult.success && USER_FOUND == refUserResult.code) {
          result = await createUser(tgId, tgUsername, refUserResult.result as User404);
          result.code = 'REF_SUCCESS';
          result.msg = 'referral bound.';
        } else {
          result = await createUser(tgId, tgUsername);
        }
      }
    } else {
      result.code = 'referral error';
      result.msg = 'tgId or refCode not found.';
    }
  } catch (error) {
    result.code = 'login error';
    result.msg = '' + error;
  }
  return Response.json(result);
}


// if (requestJson instanceof Array) {
//     console.info("Get a JSONArray...........................");
// }

// In the edge runtime you can use Bindings that are available in your application
// (for more details see:
//    - https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/#use-bindings-in-your-nextjs-application
//    - https://developers.cloudflare.com/pages/functions/bindings/
// )

// KV Example:
// const myKv = getRequestContext().env.MY_KV
// await myKv.put('suffix', ' from a KV store!')
// const suffix = await myKv.get('suffix')
// responseText += suffix
