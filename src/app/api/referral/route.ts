import type {NextRequest} from 'next/server'
import {Result404} from "@/utils/interface404";

export const runtime = 'edge'


export async function POST(request: NextRequest) {
    let result: Result404 = {success: false, code: '', msg: '',};
    return Response.json(result);
}
