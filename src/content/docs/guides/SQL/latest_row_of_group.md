---
title: How to get latest rows of groups 
---

| groupId | value  | version |
|---------|--------|---------|
| 1       | value1 | 1       |
| 1       | value2 | 2       |
| 1       | value3 | 3       |
| 1       | value4 | 4       |
| 2       | value1 | 1       |
| 2       | value2 | 2       |
| 2       | value3 | 3       |
| 3       | value1 | 1       |
| 3       | value2 | 2       |

To find the columns `groupId` and `value` corresponding to the highest `version`, the classic option would be 

```sql
WITH base AS (
	SELECT * FROM (
	VALUES (1, 'value1',1),
	(1, 'value2',	2),
	(1, 'value3',	3),
	(1, 'value4',	4),
	(2, 'value1',	1),
	(2, 'value2',	2),
	(2, 'value3',	3),
	(3, 'value1',	1),
	(3, 'value2',	2)
	) AS t (groupId , value, version)
)
SELECT * FROM base;
```

```sql {3,7}
SELECT * FROM base t1
INNER JOIN (
  SELECT groupId, MAX(version) AS version
  FROM windowFunctionDemo
  GROUP BY groupId
) AS t2
ON t1.groupId = t2.groupId AND t1.version = t2.version;
```

However. a less verbose version would be 

```sql {2,5}
SELECT * FROM (
	SELECT t1.*, RANK() OVER( PARTITION BY groupId ORDER BY version DESC) AS rank
	FROM base t1
) as t
WHERE rank =1 
ORDER BY groupId;
```

