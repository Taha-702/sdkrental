-- Set image_key and rate_per_day for fleet based on provided list
BEGIN;

UPDATE cars SET image_key = 'alto', rate_per_day = 4000 WHERE LOWER(name) LIKE '%alto%';
UPDATE cars SET image_key = 'cultus', rate_per_day = 5000 WHERE LOWER(name) LIKE '%cultus%';
UPDATE cars SET image_key = 'city-5500', rate_per_day = 5500 WHERE LOWER(name) LIKE '%city%';
UPDATE cars SET image_key = 'gli', rate_per_day = 6500 WHERE LOWER(name) LIKE '%gli%';
UPDATE cars SET image_key = 'yaris', rate_per_day = 7000 WHERE LOWER(name) LIKE '%yaris%';
UPDATE cars SET image_key = 'grande', rate_per_day = 12000 WHERE LOWER(name) LIKE '%grande%';
UPDATE cars SET image_key = 'elentra', rate_per_day = 13000 WHERE LOWER(name) LIKE '%elentr%';
UPDATE cars SET image_key = 'civic-x', rate_per_day = 10000 WHERE LOWER(name) LIKE '%civic%' AND LOWER(name) LIKE '%x%';
UPDATE cars SET image_key = 'civic-new', rate_per_day = 15000 WHERE LOWER(name) LIKE '%civic%' AND LOWER(name) LIKE '%new%';
UPDATE cars SET image_key = 'kia-sportage-16', rate_per_day = 16000 WHERE LOWER(name) LIKE '%sportage%';
UPDATE cars SET image_key = 'oshan-x-7', rate_per_day = 18000 WHERE LOWER(name) LIKE '%oshan%';
UPDATE cars SET image_key = 'revo-dala', rate_per_day = 28000 WHERE LOWER(name) LIKE '%revo%';
UPDATE cars SET image_key = 'jac-dala', rate_per_day = 30000 WHERE LOWER(name) LIKE '%jac%';
UPDATE cars SET image_key = 'havel', rate_per_day = 30000 WHERE LOWER(name) LIKE '%havel%';
UPDATE cars SET image_key = 'fortuner', rate_per_day = 35000 WHERE LOWER(name) LIKE '%fortuner%';
UPDATE cars SET image_key = 'prado', rate_per_day = 40000 WHERE LOWER(name) LIKE '%prado%';
UPDATE cars SET image_key = 'land-cruiser-v8', rate_per_day = 80000 WHERE LOWER(name) LIKE '%land%' OR LOWER(name) LIKE '%v8%';

COMMIT;
