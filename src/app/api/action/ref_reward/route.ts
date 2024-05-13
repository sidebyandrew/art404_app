import { querySellOrders, sumRefRewardFromAction } from '@/utils/db404';
import { Result404 } from '@/utils/interface404';

export const runtime = 'edge';

export async function GET(request: Request) {
  console.info('/api/points/ref_reward');
  let result404: Result404 = { success: false };
  try {
    const { searchParams } = new URL(request.url);
    const tgId = searchParams.get('tgId');
    let access404 = searchParams.get('access404');
    if (access404 != 'error_code_404') {
      result404.code = 'ERROR: 404';
      return Response.json(result404);
    }
    if (!tgId) {
      result404.code = 'ERROR: tgId 404';
      return Response.json(result404);
    }

    let queryRes = await sumRefRewardFromAction(tgId);
    console.info('/api/points/ref_reward' + JSON.stringify(queryRes));
    return Response.json(queryRes);
  } catch (error) {
    if (error instanceof Error) {
      result404.msg = error.message;
    } else {
      console.error(error);
    }
    console.error('ERROR: /api/points/ref_reward' + JSON.stringify(result404));
    return Response.json(result404);
  }
}
