---
title: How to get previous row value
---

| groupId | value | version |
| ------- | ----- | ------- |
| 1       | 1     | 1       |
| 1       | 2     | 2       |
| 1       | 4     | 3       |
| 1       | 5     | 4       |
| 2       | 1     | 1       |
| 2       | 2     | 2       |
| 2       | 3     | 3       |
| 3       | 1     | 1       |
| 3       | 5     | 2       |


```sql {16}
WITH base AS (
	SELECT * FROM (
	VALUES (1,1,1),
	(1, 2,	2),
	(1, 4,	3),
	(1, 5,	4),
	(2, 1,	1),
	(2, 2,	2),
	(2, 3,	3),
	(3, 1,	1),
	(3, 5,	2)
	) t(groupId , value, version)
)
SELECT t.*, value - previous_value as delta FROM (
	SELECT t1.*, 
    LAG(value, 1) OVER( PARTITION BY groupId ORDER BY version) AS previous_value
	FROM base t1
) as t
ORDER BY groupId, version
```

| groupId | value | version | previous_value | delta |
| ------- | ----- | ------- | -------------- | ----- |
| 1       | 1     | 1       |                |       |
| 1       | 2     | 2       | 1              | 1     |
| 1       | 4     | 3       | 2              | 2     |
| 1       | 5     | 4       | 4              | 1     |
| 2       | 1     | 1       |                |       |
| 2       | 2     | 2       | 1              | 1     |
| 2       | 3     | 3       | 2              | 1     |
| 3       | 1     | 1       |                |       |
| 3       | 5     | 2       | 1              | 4     |