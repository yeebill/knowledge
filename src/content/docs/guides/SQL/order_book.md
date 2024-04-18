---
title: Order book algorithm
sidebar:
  hidden: true
  badge:
    text: Experimental
    variant: caution
---

```sql {7,8,15,17,19,25,27,33,35,39}
WITH feed_with_size_to_add_per_order_ref AS (
    SELECT *,
    -- create a key to guarantee uniqueness of orders
	concat(market_maker_id, '/', order_id) AS order_ref,
	-- if it's a size to remove from order , multiply by -1
	CASE 
		WHEN message_type IN ('BkCan', 'BkDel') AND "size" > 0 THEN "size" * -1
		WHEN message_type IN ('Order') THEN  "size"
	END AS size_to_add
	FROM ... 
)
,feed_with_order_size_price_side AS (
SELECT *, 
-- in some case , the sum can be negative , so we set it to zero
greatest(SUM(size_to_add) OVER (PARTITION BY symbol, order_ref ORDER BY bk_sequence_number),0) AS size_remaining,
-- price is only present on some messages
LAST_VALUE(price) IGNORE NULLS OVER (PARTITION BY symbol, order_ref ORDER BY bk_sequence_number) AS price_propagated,
-- side is only present on some messages
LAST_VALUE(side) IGNORE NULLS OVER (PARTITION BY symbol, order_ref ORDER BY bk_sequence_number) AS side_propagated
FROM feed_with_size_to_add_per_order_ref
),
feed_orders_with_state AS (
	SELECT *, 
	-- keeping track whether the order_ref is open
    IF(size_remaining > 0 , order_ref, NULL) AS order_ref_open,
	-- keeping track whether the order_ref is open
	IF(size_remaining <= 0 , order_ref, NULL) AS order_ref_close
	FROM feed_with_order_size_price_side
),
feed_orders_state_aggregated AS (
SELECT *, 
-- Array of the order_ref whose size_remaining was non-zero at some point previously
filter(array_distinct(array_agg("order_ref_open") OVER (PARTITION BY symbol, side_propagated, price_propagated ORDER BY bk_sequence_number)), x -> x IS NOT NULL ) AS order_ref_list
-- Array of the order_ref whose size_remaining was zero at some point previously
, filter(array_distinct(array_agg("order_ref_close") OVER (PARTITION BY symbol,side_propagated, price_propagated ORDER BY bk_sequence_number)), x -> x IS NOT NULL) AS mask
FROM feed_orders_with_state
)
SELECT order_ref , size_remaining, 
array_except(order_ref_list, mask) AS open_orders,
size FROM feed_orders_state_aggregated
```