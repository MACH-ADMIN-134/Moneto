-- Moneto System Category & Configuration Seed Data

-- System Default Categories (user_id IS NULL)
INSERT INTO categories (id, user_id, name, type, icon, color, is_system) VALUES
(uuid_generate_v4(), NULL, 'Salary & Income', 'income', 'briefcase', '#10B981', TRUE),
(uuid_generate_v4(), NULL, 'Investment Returns', 'income', 'trending-up', '#059669', TRUE),
(uuid_generate_v4(), NULL, 'Freelance & Side Business', 'income', 'code', '#3B82F6', TRUE),
(uuid_generate_v4(), NULL, 'Housing & Rent', 'expense', 'home', '#EF4444', TRUE),
(uuid_generate_v4(), NULL, 'Utilities & Bills', 'expense', 'zap', '#F59E0B', TRUE),
(uuid_generate_v4(), NULL, 'Groceries & Dining', 'expense', 'shopping-cart', '#8B5CF6', TRUE),
(uuid_generate_v4(), NULL, 'Transportation & Fuel', 'expense', 'car', '#6366F1', TRUE),
(uuid_generate_v4(), NULL, 'Healthcare & Medical', 'expense', 'activity', '#EC4899', TRUE),
(uuid_generate_v4(), NULL, 'Entertainment & Leisure', 'expense', 'film', '#14B8A6', TRUE),
(uuid_generate_v4(), NULL, 'Account Transfer', 'transfer', 'repeat', '#64748B', TRUE)
ON CONFLICT DO NOTHING;
