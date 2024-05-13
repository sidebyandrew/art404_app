import { REF_USER_LIST_FOUND, USER_CREATED, USER_FOUND, USER_NOT_FOUND } from '@/utils/static404';
import { createUser, queryUser, queryUserListByRefTgId } from '@/utils/db404';
import { Result404, User404 } from '@/utils/interface404';

export const runtime = 'edge';

export async function GET(request: Request) {
  let result404: Result404 = { success: false };
  try {
    const { searchParams } = new URL(request.url);
    const tgId = searchParams.get('tgId');
    let tgUsername = searchParams.get('tgUsername');
    let access404 = searchParams.get('access404');
    if (access404 != 'error_code_404') {
      result404.code = 'ERROR: 404';
      return Response.json(result404);
    }
    if (!tgUsername) {
      tgUsername = tgId;
    }

    if (tgId && tgUsername) {
      let userQueryRes = await queryUser(tgId);
      if (userQueryRes.success && USER_FOUND == userQueryRes.code) {
        result404.success = true;
        result404.code = USER_FOUND;
        let referralUsersResult = await queryUserListByRefTgId(tgId);
        if (
          referralUsersResult.success &&
          referralUsersResult.code == REF_USER_LIST_FOUND
        ) {
          let result = referralUsersResult.result;
          let nameStr = '';
          for (const resultElement of result) {
            let user = resultElement as User404;
            let username = user.tgUsername;
            if (nameStr) {
              nameStr = nameStr + ', ' + username;
            } else {
              nameStr = username;
            }
          }
          let count = result.length;

          result404.success = true;
          result404.code = REF_USER_LIST_FOUND;
          result404.result = { refCount: count, refCode: userQueryRes.result.refCode };
        } else {
          result404.success = true;
          result404.code = REF_USER_LIST_FOUND;
          result404.result = { refCount: 0, refCode: userQueryRes.result.refCode };
        }
      } else {
        let createResult = await createUser(tgId, tgUsername);
        if (createResult.success && createResult.code == USER_CREATED) {
          result404.success = true;
          result404.code = USER_CREATED;
          let { refCode } = createResult.result;
          result404.result = { refCode };
        }
      }
    } else {
      result404.code = USER_NOT_FOUND;
    }
    return Response.json(result404);
  } catch (error) {
    if (error instanceof Error) {
      result404.msg = error.message;
    }
    return Response.json(result404);
  }
}
