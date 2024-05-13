export interface CloudflareEnv {
    // Add here the Cloudflare Bindings you want to have available in your application
    // (for more details on Bindings see: https://developers.cloudflare.com/pages/functions/bindings/)

    // If you set another name in wrangler.toml as the value for 'binding',
    // replace "DB" with the variable name you defined.
    DB: D1Database;

    // KV Example:
    // MY_KV: KVNamespace
}


declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DB: D1Database
        }
    }
}

declare global {
    interface CloudflareEnv {
        DB: D1Database
    }
}
