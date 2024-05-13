import { queryRewardList } from '@/utils/db404';
import { Result404 } from '@/utils/interface404';

export const runtime = 'edge';

export async function GET(request: Request) {
  console.info(request.url);
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

    let pagination = searchParams.get('pagination');
    if (!pagination) {
      pagination = '1';
    }
    if (pagination && parseInt(pagination) <= 0) {
      result404.code = 'ERROR: Pagination 404';
      return Response.json(result404);
    }

    let queryRes = await queryRewardList(tgId, parseInt(pagination));
    return Response.json(queryRes);
  } catch (error) {
    if (error instanceof Error) {
      result404.msg = error.message;
    }
    console.error(`ERROR: ${request.url}` + JSON.stringify(result404));
    return Response.json(result404);
  }
}
