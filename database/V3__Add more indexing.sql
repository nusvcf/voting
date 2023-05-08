CREATE INDEX ballot_created ON ballot (created);
CREATE INDEX ballot_inval ON ballot (invalidated);
CREATE INDEX ballot_closed ON ballot (closed);

CREATE INDEX ballot_name_id ON ballot_name (ballot_id);
