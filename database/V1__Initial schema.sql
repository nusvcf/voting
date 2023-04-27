CREATE TABLE bootstrap (
    admin_pw_hashed TEXT
);

CREATE TABLE voter (
    id          uuid PRIMARY KEY   DEFAULT gen_random_uuid(),
    username    TEXT      NOT NULL UNIQUE,
    password    TEXT      NOT NULL,
    created     TIMESTAMP NOT NULL DEFAULT NOW(),
    last_seen   TIMESTAMP,
    invalidated TIMESTAMP
);

CREATE TABLE ballot (
    id          uuid PRIMARY KEY   DEFAULT gen_random_uuid(),
    position    TEXT,
    max_votes   SMALLINT,
    created     TIMESTAMP NOT NULL DEFAULT NOW(),
    closed      TIMESTAMP,
    invalidated TIMESTAMP
);

CREATE TABLE ballot_name (
    id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ballot_id uuid NOT NULL REFERENCES ballot (id) ON UPDATE CASCADE ON DELETE CASCADE,
    name      TEXT
);

CREATE TABLE vote (
    voter_id      uuid      NOT NULL REFERENCES voter (id) ON UPDATE CASCADE ON DELETE CASCADE,
    ballot_id     uuid      NOT NULL REFERENCES ballot (id) ON UPDATE CASCADE ON DELETE CASCADE,
    created       TIMESTAMP NOT NULL DEFAULT NOW(),
    abstain       bool      NOT NULL,
    no_confidence bool      NOT NULL,
    name_id       uuid REFERENCES ballot_name (id)
);
