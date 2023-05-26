### Previous value

Another classic usage of window function is to retrieve a value from the previous row. This can be achieved through the LAG function. 
Having the previous value enables all sort of delta calculation which would fit use cases such as time elapsed and  gaps in sequence.

```sql
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
	) t (pk , value, version)
)
SELECT * FROM base
ORDER BY pk , version
```



| pk   | value | version |
| ---- | ----- | ------- |
| 1    | 1     | 1       |
| 1    | 2     | 2       |
| 1    | 4     | 3       |
| 1    | 5     | 4       |
| 2    | 1     | 1       |
| 2    | 2     | 2       |
| 2    | 3     | 3       |
| 3    | 1     | 1       |
| 3    | 5     | 2       |



Here is an an example where I would retrieve the previous value from a sequence and calculate the delta . This would detect if there is a gap in the sequence.

```sql
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
	) t(pk , value, version)
)
SELECT t.*, value - previous_value as delta FROM (
	SELECT t1.*, LAG(value, 1) OVER( PARTITION BY pk ORDER BY version) AS previous_value
	FROM base t1
) as t
ORDER BY pk , version
```

| pk   | value | version | previous_value | delta |
| ---- | ----- | ------- | -------------- | ----- |
| 1    | 1     | 1       |                |       |
| 1    | 2     | 2       | 1              | 1     |
| 1    | 4     | 3       | 2              | 2     |
| 1    | 5     | 4       | 4              | 1     |
| 2    | 1     | 1       |                |       |
| 2    | 2     | 2       | 1              | 1     |
| 2    | 3     | 3       | 2              | 1     |
| 3    | 1     | 1       |                |       |
| 3    | 5     | 2       | 1              | 4     |

