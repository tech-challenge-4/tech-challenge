ALTER TABLE "order" ADD CONSTRAINT status_check CHECK (status IN ('received', 'preparation', 'ready', 'finished', 'canceled'));