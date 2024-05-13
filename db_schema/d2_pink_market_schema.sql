
DROP TABLE IF EXISTS PinkSellOrder;
CREATE TABLE IF NOT EXISTS PinkSellOrder
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
CREATE INDEX IF NOT EXISTS idx_pink_sell_order_ext_id ON PinkSellOrder(extBizId);
CREATE INDEX IF NOT EXISTS idx_pink_sell_order_tg_id ON PinkSellOrder(sellerTgId);
CREATE INDEX IF NOT EXISTS idx_pink_sell_order_tg_id_address ON PinkSellOrder(sellerTgId, sellerAddress);
CREATE INDEX IF NOT EXISTS idx_pink_sell_order_tg_status ON PinkSellOrder(status);
CREATE INDEX IF NOT EXISTS idx_pink_sell_order_unit_price ON PinkSellOrder(unitPriceInTon);
CREATE INDEX IF NOT EXISTS idx_pink_sell_order_create_dt ON PinkSellOrder(createDt);




DROP TABLE IF EXISTS PinkBuyOrder;
CREATE TABLE IF NOT EXISTS PinkBuyOrder(
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
CREATE INDEX IF NOT EXISTS idx_pink_buy_order_ext_id ON PinkBuyOrder(extBizId);
CREATE INDEX IF NOT EXISTS idx_pink_buy_order_sell_id ON PinkBuyOrder(sellOrderId);
CREATE INDEX IF NOT EXISTS idx_pink_buy_order_buyer_id ON PinkBuyOrder(buyerTgId);
CREATE INDEX IF NOT EXISTS idx_pink_buy_order_buyer_add_id ON PinkBuyOrder(buyerTgId,buyerAddress);
CREATE INDEX IF NOT EXISTS idx_pink_buy_order_buyer_status ON PinkBuyOrder(status);
