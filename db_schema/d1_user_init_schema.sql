
DROP TABLE IF EXISTS ArtUser;
CREATE TABLE IF NOT EXISTS ArtUser
(
    userId TEXT PRIMARY KEY,
    tgId  TEXT,
    tgUsername  TEXT,
    refCode TEXT,
    refTgId TEXT,
    refTgUsername TEXT,
    totalRefPoint INTEGER,
    totalActionPoint INTEGER,
    extInfo   TEXT,
    traceId   TEXT,
    createBy  TEXT,
    createDt INTEGER,
    modifyBy  TEXT,
    modifyDt INTEGER
);
CREATE INDEX IF NOT EXISTS idx_trc_user_tg_id ON ArtUser(tgId);
CREATE INDEX IF NOT EXISTS idx_trc_user_tg_username ON ArtUser(tgUsername);
CREATE INDEX IF NOT EXISTS idx_trc_user_ref_code ON ArtUser(refCode);

CREATE INDEX IF NOT EXISTS idx_trc_ref_by_tg_id ON ArtUser(refTgId);




DROP TABLE IF EXISTS ArtUserAddress;
CREATE TABLE IF NOT EXISTS ArtUserAddress
(
    addressId TEXT PRIMARY KEY,
    tgId TEXT,
    network TEXT,
    address TEXT,
    extInfo   TEXT,
    traceId   TEXT,
    createBy  TEXT,
    createDt INTEGER,
    modifyBy  TEXT,
    modifyDt INTEGER
);
CREATE INDEX IF NOT EXISTS idx_trc_address_tg_id ON ArtUserAddress(tgId);
CREATE INDEX IF NOT EXISTS idx_trc_address_address ON ArtUserAddress(address);





DROP TABLE IF EXISTS ArtAction;
CREATE TABLE IF NOT EXISTS ArtAction
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
CREATE INDEX IF NOT EXISTS idx_trc_action_tg_id ON ArtAction(tgId);
CREATE INDEX IF NOT EXISTS idx_trc_action_target_id ON ArtAction(targetId);





DROP TABLE IF EXISTS ArtLog;
CREATE TABLE IF NOT EXISTS ArtLog
(
    logId TEXT PRIMARY KEY,
    tgId TEXT,
    opCode TEXT,
    logs TEXT,
    extInfo   TEXT,
    traceId   TEXT,
    createBy  TEXT,
    createDt INTEGER,
    modifyBy TEXT,
    modifyDt INTEGER
);
CREATE INDEX IF NOT EXISTS idx_trc_log_tg_id ON ArtLog(tgId);






DROP TABLE IF EXISTS Customers;
CREATE TABLE IF NOT EXISTS Customers
(
    CustomerId INTEGER PRIMARY KEY,
    CompanyName TEXT,
    ContactName TEXT
);


INSERT INTO Customers (CustomerID, CompanyName, ContactName)
VALUES (1, 'Alfreds Futterkiste', 'Maria Anders1'),
       (4, 'Around the Horn', 'Thomas Hardy1'),
       (11, 'Bs Beverages', 'Victoria Ashworth1'),
       (13, 'Bs Beverages', 'Random Name1');
