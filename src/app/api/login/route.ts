import type {NextRequest} from 'next/server'
import {createUser, queryUser} from "@/utils/db404";
import {USER_FOUND} from "@/utils/static404";
import {Result404, User404} from "@/utils/interface404";

export const runtime = 'edge'


export async function POST(request: NextRequest) {
    let result: Result404 = {
        success: false,
        code: '',
        msg: '',
    };
    try {
        let requestJson = await request.json<User404>();
        let tgId = requestJson.tgId;
        let tgUsername = requestJson.tgUsername;
        if (!tgUsername) {
            tgUsername = tgId;
        }
        if (tgId && tgUsername) {
            let queryRes = await queryUser(tgId);
            if (queryRes.success && USER_FOUND == queryRes.code) {
                result.success = true;
                result.code = 'login with existing user'
                result.msg = `tgId ${tgId} founded.`;
            } else {
                result = await createUser(tgId, tgUsername);
            }
        } else {
            result.code = 'login error';
            result.msg = "tgId not found.";
        }
    } catch (error) {
        result.code = 'login error'
        result.msg = "" + error;
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
