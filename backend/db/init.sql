-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Confirm extensions are loaded
SELECT extname FROM pg_extension WHERE extname = 'vector';
