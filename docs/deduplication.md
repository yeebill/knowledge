### Deduplication

We have used the function RANK in this example .. but what would happen if there was a duplicate of the latest version . 

```sql
WITH base AS (
	SELECT * FROM (
	VALUES (1, 'value4',	4),
    (1, 'value5',	4),
    (2, 'value3',	3),
    (2, 'value4',	3)	
	) AS t (pk , value, version)
)
SELECT * FROM (
	SELECT t1.*, RANK() OVER( PARTITION BY pk ORDER BY version desc ) as rank
	FROM base t1
) AS t
WHERE rank = 1; 
```

| pk   | value  | version | rank |
| ---- | ------ | ------- | ---- |
| 1    | value4 | 4       | 1    |
| 1    | value5 | 4       | 1    |
| 2    | value3 | 3       | 1    |
| 3    | value4 | 2       | 1    |


We would be showing both ! 

Now if you ever heard a fancy word such as `deduplication` then all we would need to do is to use the ROW_NUMBER function instead

> Returns an ascending sequence of integers, starting with 1. 
> Starts the sequence over for each group produced by the PARTITIONED BY clause. 
> The output sequence includes different values for duplicate input values. 
> Therefore, the sequence never contains any duplicates or gaps, regardless of duplicate input values

https://impala.apache.org/docs/build/html/topics/impala_analytic_functions.html#row_number

```sql
WITH base AS (
	SELECT * FROM (
	VALUES (1, 'value4',	4),
    (1, 'value5',	4),
    (2, 'value3',	3),
    (2, 'value4',	3)	
	) AS t (pk , value, version)
)
SELECT * FROM (
	SELECT t1.*, ROW_NUMBER() OVER( PARTITION BY pk ORDER BY version desc ) as rank
	FROM base t1
) AS t
WHERE rank = 1; 
```



End result :

| pk   | value  | version | rank |
| ---- | ------ | ------- | ---- |
| 2    | value3 | 3       | 1    |
| 1    | value4 | 4       | 1    |

