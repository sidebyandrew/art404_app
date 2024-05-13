import type {NextRequest} from 'next/server'

export const runtime = 'edge'


export async function GET(request: NextRequest) {
    try {
        // If you did not use `DB` as your binding name, change it here
        // @ts-ignore

        return Response.json({});
    } catch (error) {
        console.info(error)
        return Response.json(error);
    }
}


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
