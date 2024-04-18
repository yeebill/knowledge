---
title: How to break grouped set
---

| group_id  | seq |
|-----------|-----|
| SEC20_N_0 | 1   |
| SEC20_N_0 | 2   |
| SEC20_N_0 | 6   |
| SEC20_N_0 | 8   |
| SEC20_N_0 | 9   |
| SEC20_N_0 | 10  |

Assign a id to the slice of consecutive sequence numbers

Answer : 

* Add a column where given a condition is true return `1`
* SUM new column OVER PARTITION to break sequentially create new id for each subset. 

```sql {16,21}
WITH base AS (
	SELECT * FROM (
		VALUES 
		('SEC20_N_0', 1)
		,('SEC20_N_0', 2)
		,('SEC20_N_0', 6)
		,('SEC20_N_0', 8)
		,('SEC20_N_0', 9)
		,('SEC20_N_0', 10)
	) group_sequence(group_id, seq)
), base_with_previous_sequence AS (
	SELECT *
	,LAG(seq,1,0) OVER (PARTITION BY group_id ORDER BY seq) as previous_seq
	-- If the current sequence - 1 is equals to previous value , then it means no gap 
	-- Else it means that there is a gap so we return 1
	,CASE WHEN seq - 1 = LAG(seq,1,1) OVER (PARTITION BY group_id ORDER BY seq) THEN 0 	ELSE 1	END AS diff
	FROM base
), base_with_lot_id AS (
	SELECT * 
	-- Sum the diff , after each gap , the lot_id increases by 1
	, SUM(diff) OVER (PARTITION BY group_id ORDER BY seq) AS lot_id
	FROM base_with_previous_sequence
)
SELECT * FROM base_with_lot_id;
```

| group_id  | seq | previous_seq | diff | lot_id |
|-----------|-----|--------------|------|--------|
| SEC20_N_0 | 1   | 0            | 1    | 1      |
| SEC20_N_0 | 2   | 1            | 0    | 1      |
| SEC20_N_0 | 6   | 2            | 1    | 2      |
| SEC20_N_0 | 8   | 6            | 1    | 3      |
| SEC20_N_0 | 9   | 8            | 0    | 3      |
| SEC20_N_0 | 10  | 9            | 0    | 3      |