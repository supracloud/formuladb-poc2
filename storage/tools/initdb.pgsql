DROP TABLE IF EXISTS kvtable;

-- Creates guitars table
CREATE TABLE IF NOT EXISTS kvtable (
    key VARCHAR NOT NULL,
    val json
);