
def validate_result(result_df, expected_df):
    # Check 1: result exists
    if result_df is None:
        return {"error": "Your code did not create a result DataFrame."}

    # Check 2: column match
    expected_cols = set(expected_df.columns)
    result_cols = set(result_df.columns)
    if expected_cols != result_cols:
        return {
            "error": f"Column mismatch.\nExpected: {expected_cols}\nFound: {result_cols}"
        }

    # Check 3: row count
    if result_df.count() != expected_df.count():
        return {
            "error": f"Row count mismatch.\nExpected: {expected_df.count()}, Found: {result_df.count()}"
        }

    # Final check
    is_correct = dfs_equal(result_df, expected_df)
    result_data = [row.asDict() for row in result_df.limit(100).collect()]

    return {
            "output": result_data,
            "isCorrect": is_correct
        }


# Compare results: sorted to avoid order issues
def dfs_equal(df1, df2):
    try:
        df1_sorted = df1.select(sorted(df1.columns)).orderBy(sorted(df1.columns))
        df2_sorted = df2.select(sorted(df2.columns)).orderBy(sorted(df2.columns))
        
        return df1_sorted.collect() == df2_sorted.collect()
    except Exception as e:
        return False
