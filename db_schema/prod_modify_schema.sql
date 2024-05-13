DROP TABLE IF EXISTS ArtAction404;
CREATE TABLE IF NOT EXISTS ArtAction404
(
    actionId TEXT PRIMARY KEY,
    tgId TEXT,
    tgUsername TEXT,
    actionType TEXT,
    selfReward INTEGER,
    targetType TEXT,
    targetId TEXT,
    targetName TEXT,
    targetReward INTEGER,
    extInfo   TEXT,
    traceId   TEXT,
    createBy  TEXT,
    createDt INTEGER,
    modifyBy  TEXT,
    modifyDt INTEGER
);
CREATE INDEX IF NOT EXISTS idx_trc_action_tg_id ON ArtAction404(tgId);
CREATE INDEX IF NOT EXISTS idx_trc_action_target_id ON ArtAction404(targetId);



DROP TABLE IF EXISTS PinkSellOrder404;
CREATE TABLE IF NOT EXISTS PinkSellOrder404
(
    sellOrderId TEXT PRIMARY KEY,
    extBizId  TEXT,
    sellerTgId  TEXT,
    sellerAddress  TEXT,
    sellerT404Address  TEXT,
    pinkMarketAddress  TEXT,
    pinkOrderSaleAddress TEXT,
    sellAmount INTEGER,
    unitPriceInTon INTEGER,
    feeNumerator INTEGER,
    feeDenominator INTEGER,
    orderType TEXT,
    orderMode TEXT,
    status    TEXT,
    extInfo   TEXT,
    traceId   TEXT,
    createBy  TEXT,
    createDt INTEGER,
    modifyBy  TEXT,
    modifyDt INTEGER
);
CREATE INDEX IF NOT EXISTS idx_pink_sell_order_ext_id ON PinkSellOrder404(extBizId);
CREATE INDEX IF NOT EXISTS idx_pink_sell_order_tg_id ON PinkSellOrder404(sellerTgId);
CREATE INDEX IF NOT EXISTS idx_pink_sell_order_tg_id_address ON PinkSellOrder404(sellerTgId, sellerAddress);
CREATE INDEX IF NOT EXISTS idx_pink_sell_order_tg_status ON PinkSellOrder404(status);
CREATE INDEX IF NOT EXISTS idx_pink_sell_order_unit_price ON PinkSellOrder404(unitPriceInTon);
CREATE INDEX IF NOT EXISTS idx_pink_sell_order_create_dt ON PinkSellOrder404(createDt);




DROP TABLE IF EXISTS PinkBuyOrder404;
CREATE TABLE IF NOT EXISTS PinkBuyOrder404(
    buyOrderId TEXT PRIMARY KEY,
    extBizId  TEXT,
    sellOrderId  TEXT,
    buyerTgId  TEXT,
    buyerAddress  TEXT,
    buyerT404Address  TEXT,
    buyAmount INTEGER,
    unitPriceInTon INTEGER,
    orderType TEXT,
    orderMode TEXT,
    status    TEXT,
    extInfo   TEXT,
    traceId   TEXT,
    createBy  TEXT,
    createDt INTEGER,
    modifyBy  TEXT,
    modifyDt INTEGER
);
CREATE INDEX IF NOT EXISTS idx_pink_buy_order_ext_id ON PinkBuyOrder404(extBizId);
CREATE INDEX IF NOT EXISTS idx_pink_buy_order_sell_id ON PinkBuyOrder404(sellOrderId);
CREATE INDEX IF NOT EXISTS idx_pink_buy_order_buyer_id ON PinkBuyOrder404(buyerTgId);
CREATE INDEX IF NOT EXISTS idx_pink_buy_order_buyer_add_id ON PinkBuyOrder404(buyerTgId,buyerAddress);
CREATE INDEX IF NOT EXISTS idx_pink_buy_order_buyer_status ON PinkBuyOrder404(status);
