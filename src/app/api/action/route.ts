import { Result404 } from '@/utils/interface404';

export const runtime = 'edge';

export async function GET(request: Request) {
  console.info('/api/points');
  let result404: Result404 = { success: false };
  try {


    return Response.json(result404);
  } catch (error) {
    if (error instanceof Error) {
      result404.msg = error.message;
    }
    console.error(`Minter ERROR: ` + JSON.stringify(result404));
    return Response.json(result404);
  }
}
