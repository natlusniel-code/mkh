INSERT INTO categories (id, name, slug, description, sort_order) VALUES
  (gen_random_uuid(), 'Electronics', 'electronics', 'TVs, audio, cameras and everyday gadgets.', 1),
  (gen_random_uuid(), 'Phones and Accessories', 'phones-accessories', 'Smartphones, chargers, cases and power banks.', 2),
  (gen_random_uuid(), 'Computers and Accessories', 'computers-accessories', 'Laptops, monitors, keyboards and storage.', 3),
  (gen_random_uuid(), 'Fashion', 'fashion', 'Clothing and everyday style for everyone.', 4),
  (gen_random_uuid(), 'Shoes and Bags', 'shoes-bags', 'Footwear, handbags, backpacks and luggage.', 5),
  (gen_random_uuid(), 'Beauty and Personal Care', 'beauty-personal-care', 'Skincare, haircare, fragrance and grooming.', 6),
  (gen_random_uuid(), 'Home and Kitchen', 'home-kitchen', 'Cookware, appliances, bedding and decor.', 7),
  (gen_random_uuid(), 'Groceries', 'groceries', 'Pantry staples, snacks, drinks and household food.', 8),
  (gen_random_uuid(), 'Sports and Fitness', 'sports-fitness', 'Training gear, outdoor equipment and activewear.', 9),
  (gen_random_uuid(), 'Baby Products', 'baby-products', 'Baby care, feeding, clothing and nursery essentials.', 10)
ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO payment_settings (id, bank_name, account_name, account_number, instructions) VALUES
  ('default', 'Smartcash', 'MarketHub Cart Checkout', '9111356510', 'Transfer the exact amount to the account above, then submit your transaction reference so our team can verify your payment. Verification is usually completed within a few hours.')
ON CONFLICT (id) DO NOTHING;
