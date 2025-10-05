-- First migration: Add 'clientes' value to page_permission enum
ALTER TYPE page_permission ADD VALUE IF NOT EXISTS 'clientes';