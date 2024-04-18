---
title: How to propagate (fill the blank values from previous non null) 
---

| groupId | value  | version |
| ------- | ------ | ------- |
| 1       | value1 | 1       |
| 1       |        | 2       |
| 1       |        | 3       |
| 1       | value4 | 4       |
| 2       | value1 | 1       |
| 2       |        | 2       |
| 2       | value3 | 3       |
| 3       | value1 | 1       |
| 3       | value2 | 2       |


```sql {17}
WITH base AS (
    SELECT * FROM (
    VALUES 
    (1, 'value1', 1),
    (1, null,   2),
    (1, null,   3),
    (1, 'value4',   4),
    (2, 'value1',   1),
    (2, null,   2),
    (2, 'value3',   3),
    (3, 'value1',   1),
    (3, 'value2',   2)
    ) AS t(groupId, value, version) 
)
SELECT * FROM (
	SELECT t1.*, 
    LAST_VALUE(value IGNORE NULLS) OVER( PARTITION BY groupId ORDER BY version ) AS propagated_value	
	FROM base t1
) AS t
ORDER BY groupId, version
```

| groupId | value  | version | propagated_value |
| ------- | ------ | ------- | ---------------- |
| 1       | value1 | 1       | value1           |
| 1       |        | 2       | value1           |
| 1       |        | 3       | value1           |
| 1       | value4 | 4       | value4           |
| 2       | value1 | 1       | value1           |
| 2       |        | 2       | value1           |
| 2       | value3 | 3       | value3           |
| 3       | value1 | 1       | value1           |
| 3       | value2 | 2       | value2           |