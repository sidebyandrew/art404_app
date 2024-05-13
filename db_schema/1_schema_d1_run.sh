
# 1. Create DB
npx wrangler d1 create d1-art404-prod

# 2.1 Local
npx wrangler d1 execute d1-art404-prod --local --file=./db_schema/d1_user_init_schema.sql
npx wrangler d1 execute d1-art404-prod --local --file=./db_schema/prod_modify_schema.sql
npx wrangler d1 execute d1-art404-prod --local --file=./d2_pink_market_schema.sql
npx wrangler d1 execute d1-art404-prod --local --command="SELECT * FROM ArtUser where tgId = 5499157826"
npx wrangler d1 execute d1-art404-prod --local --command="UPDATE ArtUser SET refTgId=5455301115  WHERE tgId=5499157826"
npx wrangler d1 execute d1-art404-prod --local --command="UPDATE ArtUser SET refTgId=5499157826  WHERE tgId=5455301115"
npx wrangler d1 execute d1-art404-prod --local --command="update ArtUser set refTgId = '1111111' where tgId = 5499157826"

npx wrangler d1 execute d1-art404-prod --local --command="SELECT * FROM ArtAction where targetType in ('REF_REWARD_BUY','REF_REWARD_MINT') and targetId='1111111'"
npx wrangler d1 execute d1-art404-prod --local --command="SELECT sum(targetReward) FROM ArtAction where targetType in ('REF_REWARD_BUY','REF_REWARD_MINT') and targetId='1111111'"

npx wrangler d1 execute d1-art404-prod --local --command="SELECT * FROM PinkSellOrder"
npx wrangler d1 execute d1-art404-prod --local --command="SELECT * FROM PinkBuyOrder"
npx wrangler d1 execute d1-art404-prod --local --command="SELECT * FROM ArtAction"


# 2.2 Deploy
npx wrangler d1 execute d1-art404-prod 线上环境将会删除所有数据谨慎执行 --file=./d1_user_init_schema.sql
npx wrangler d1 execute d1-art404-prod 线上环境将会删除所有数据谨慎执行 --file=./d2_pink_market_schema.sql
npx wrangler d1 execute d1-art404-prod --command="SELECT * FROM ArtUser"
npx wrangler d1 execute d1-art404-prod --command="UPDATE ArtUser SET refTgId='5455301115' AND refTgUsername='KojhLiang' WHERE tgId='5499157826'"



# 3. SQLs

select refTgId,refTgUsername,count(refTgId) as refCount from trcuser group by refTgId order by refCount desc
select * from trcuser where refTgUsername='RotgarSett'
select count(*) from trcuser where refTgUsername='RotgarSett' and tgId!=tgUsername
