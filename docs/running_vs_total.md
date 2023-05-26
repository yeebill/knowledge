### Running Vs Total Sum per partition :

This is a classic example to show the importance of the "window". 

```sql
WITH base AS (
	SELECT * FROM (
	VALUES (1,1,1),
	(1, 1,	2),
	(1, 1,	3),
	(1, 1,	4),
	(2, 1,	1),
	(2, 1,	2),
	(2, 1,	3),
	(3, 1,	1),
	(3, 1,	2)
	) as t (pk , value, version)
)
SELECT * FROM (
	SELECT t1.*, SUM(value) OVER( PARTITION BY pk ORDER BY version) as running_sum
	FROM base t1
) as t
ORDER BY pk , version;
```


| pk   | value | version | running_sum |
| ---- | ----- | ------- | ----------- |
| 1    | 1     | 1       | 1           |
| 1    | 1     | 2       | 2           |
| 1    | 1     | 3       | 3           |
| 1    | 1     | 4       | 4           |
| 2    | 1     | 1       | 1           |
| 2    | 1     | 2       | 2           |
| 2    | 1     | 3       | 3           |
| 3    | 1     | 1       | 1           |
| 3    | 1     | 2       | 2           |



Notice how there is no window clause defined . This means that the default window is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW.  So in this case , it's not required to specify it . 
However, if we wanted a total sum , then we would need to specify the clause as follows :

```sql
WITH base AS (
	SELECT * FROM (
	VALUES (1,1,1),
	(1, 1,	2),
	(1, 1,	3),
	(1, 1,	4),
	(2, 1,	1),
	(2, 1,	2),
	(2, 1,	3),
	(3, 1,	1),
	(3, 1,	2)
	) as t (pk , value, version)
)
SELECT * FROM (
	SELECT t1.*, SUM(value) OVER( PARTITION BY pk ORDER BY version RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) as total_sum_per_partition
	FROM base t1
) as t
ORDER BY pk , version;
```

End Result:

| pk   | value | version | total_sum_per_partition |
| ---- | ----- | ------- | ----------------------- |
| 1    | 1     | 1       | 4                       |
| 1    | 1     | 2       | 4                       |
| 1    | 1     | 3       | 4                       |
| 1    | 1     | 4       | 4                       |
| 2    | 1     | 1       | 3                       |
| 2    | 1     | 2       | 3                       |
| 2    | 1     | 3       | 3                       |
| 3    | 1     | 1       | 2                       |
| 3    | 1     | 2       | 2                       |

