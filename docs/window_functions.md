## Window Functions 



### Why the need ?

If you were giving this dataset and were asked to provide me an SQL query which will for every distinct `pk` , return me the columns `value` and `version` corresponding to the highest `version`, what would you answer be ?


| pk   | value  | version |
| ---- | ------ | ------- |
| 1    | value1 | 1       |
| 1    | value2 | 2       |
| 1    | value3 | 3       |
| 1    | value4 | 4       |
| 2    | value1 | 1       |
| 2    | value2 | 2       |
| 2    | value3 | 3       |
| 3    | value1 | 1       |
| 3    | value2 | 2       |



Let's first build the dataset to play on.

If you are unfamiliar with the WITH clause , you can refer to https://en.wikipedia.org/wiki/Hierarchical_and_recursive_queries_in_SQL#Common_table_expression


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
	) as t (pk , value, version)
)
SELECT * FROM base;
```

The query above would create the table `base` representing the dataset


Now to answer the need , there is a good chance we would come up with something similar to the following:


```sql
SELECT * FROM base t1
INNER JOIN (
  SELECT pk, MAX(version) AS version
  FROM windowFunctionDemo
  GROUP BY pk
) AS t2
ON t1.pk = t2.pk AND t1.version = t2.version;
```

#### Takeaway

* Once the max version is retrieved, I lose all the other columns not specified in the `GROUP BY` clause. 

* This is the reason we have to use the `JOIN` to get that information back. 


However this makes the query much more complicated reading and logic wise.   
So,  what if there was a way to keep all the current rows and columns, and  just add the 'max version' as an extra column? We can, with  window/analytics functions.


### What composes a window function 

Window function requires a partition key, and boundaries. `ORDER BY` is optional. 


> The PARTITION BY clause acts much like the GROUP BY clause in the outermost block of a query. 
> It divides the rows into groups containing identical values in one or more columns. 
> These logical groups are known as partitions. 

> The ORDER BY clause works much like the ORDER BY clause in the outermost block of a query. 
> It defines the order in which rows are evaluated for the entire input set, or for each group produced by a PARTITION BY clause. 
> You can order by one or multiple expressions, and for each expression optionally choose ascending or descending order and whether nulls come first or last in the sort order. 

> The window clause is only allowed in combination with an ORDER BY clause. 
> If the ORDER BY clause is specified but the window clause is not, the default window is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW.

For more reference (https://www.cloudera.com/documentation/enterprise/5-8-x/topics/impala_analytic_functions.html)



Now if we were to rethink our original problem more in the form of "I would like to know for each `pk`, it's highest version and filter that" , then one choice would be use the RANK() version. Now it would be a question of asking what would be the partition , boundaries and the ordering.
With the problem reformulated , we can clearly see that the partition would be `pk` , the ordering would be by version descending (because we want the highest) and window clause is not required.


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
	) as t (pk , value, version)
)
SELECT * FROM (
	SELECT t1.*, RANK() OVER( PARTITION BY pk ORDER BY version desc ) as rank
	FROM base t1
) as t
WHERE rank =1 
ORDER BY pk;
```

End result

| pk   | value  | version | rank |
| ---- | ------ | ------- | ---- |
| 1    | value4 | 4       | 1    |
| 2    | value3 | 3       | 1    |
| 3    | value2 | 2       | 1    |



### Takeaway

* We have avoided a self join !
* An extra column is created as the placeholder for what we need 
* However predicates on those columns is more annoying (using that new column on a WHERE or HAVING clause) , you either need to make a sub-query or a common table expression over it.

