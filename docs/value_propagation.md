### Propagating values

Sometimes there a a need to propagate values from previous row into subsequent rows. 

```sql
WITH base AS (
    SELECT * FROM (
    VALUES 
    (1, 'value1',1),
    (1, null,   2),
    (1, null,   3),
    (1, 'value4',   4),
    (2, 'value1',   1),
    (2, null,   2),
    (2, 'value3',   3),
    (3, 'value1',   1),
    (3, 'value2',   2)
    ) t(pk , value, version)
)
SELECT * FROM base ORDER BY pk , version;
```

| pk   | value  | version |
| ---- | ------ | ------- |
| 1    | value1 | 1       |
| 1    |        | 2       |
| 1    |        | 3       |
| 1    | value4 | 4       |
| 2    | value1 | 1       |
| 2    |        | 2       |
| 2    | value3 | 3       |
| 3    | value1 | 1       |
| 3    | value2 | 2       |



Now let's say we want to fill in the blank values from previous non null value for the same pk. 

```sql
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
    ) t(pk, value, version) 
)
SELECT * FROM (
	SELECT t1.*, LAST_VALUE(value IGNORE NULLS) OVER( PARTITION BY pk ORDER BY version ) as propagated_value	
	FROM base t1
) AS t
ORDER BY pk , version
```



End Result:

| pk   | value  | version | propagated_value |
| ---- | ------ | ------- | ---------------- |
| 1    | value1 | 1       | value1           |
| 1    |        | 2       | value1           |
| 1    |        | 3       | value1           |
| 1    | value4 | 4       | value4           |
| 2    | value1 | 1       | value1           |
| 2    |        | 2       | value1           |
| 2    | value3 | 3       | value3           |
| 3    | value1 | 1       | value1           |
| 3    | value2 | 2       | value2           |

