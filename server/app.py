from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from pyspark.sql import SparkSession
import os
from utils.data_loader import load_level_data, level_title, concepts
from utils.response import error_response, success_response
import pandas as pd
from pyspark.sql.functions import col,row_number,when
from validators.validators import validate_result
from pyspark.sql.window import Window
from collections import defaultdict
from pyspark.sql.types import StructType, StructField, IntegerType, StringType, ArrayType
import logging

app = Flask(__name__)
CORS(app)

spark = SparkSession.builder \
    .master("local") \
    .appName("example") \
    .config("spark.ui.showConsoleProgress", "false") \
    .getOrCreate()

@app.route('/getTitle',methods=["GET"])
def get_level_title():
    data = level_title()
    try:

        # Define the schema explicitly
        schema = StructType([
            StructField("level_id", IntegerType(), True),
            StructField("topic", StringType(), True),
            StructField("group", StringType(), True),
            StructField("mission", StringType(), True),
            StructField("dataset", StringType(), True),
            StructField("dataset_name", ArrayType(StringType()), True),
            StructField("expected_result", StringType(), True),
            StructField("hint", StringType(), True),
            StructField("solution", StringType(), True),
            StructField("explain", StringType(), True),
            StructField("position", IntegerType(), True)
        ])

        for item in data:
            item['level_id'] = int(item['level_id'])

        # Convert Python list of dicts to Spark DataFrame
        df = spark.createDataFrame(data,schema=schema)
        
        # Define window to assign rank within each group
        windowSpec = Window.partitionBy("position","group").orderBy("position","level_id")
        ranked_df = df.withColumn("rank", row_number().over(windowSpec))

        # Select only necessary fields and sort
        sorted_rows = ranked_df.select("group","level_id", "topic", "rank","mission","position").orderBy("position","group","rank").collect()

        # Prepare grouped JSON output
        result = defaultdict(list)
        for row in sorted_rows:
            group = row["group"].capitalize()
            result[group].append({"rank": row["rank"], "topic": row["topic"] , "level_id": row["level_id"], "mission" : row["mission"] })

        total_levels = sum(len(v) for v in result.values())
    
        result_list = [{"group": key, "data": value } for key, value in result.items()]
        return {"total_levels": total_levels,"groups": result_list}

    except Exception as e:
        print(f"[ERROR] Failed to collect rows: {e}")
        return jsonify({"error": "Failed to process data"}), 500

@app.route('/getConcepts',methods=["GET"])
def get_concepts():
    concepts_data = concepts()

    # Define the schema explicitly
    schema = StructType([
        StructField("position", IntegerType(), True),
        StructField("topic", StringType(), True),
        StructField("concept", ArrayType(StringType()), True)
    ])

    for item in concepts_data:
        item['position'] = int(item['position'])

    df = spark.createDataFrame(concepts_data,schema=schema)
    print("......Concepts dataframe .......",df.show())
    json_data = df.toJSON().collect()
    print("Json data ",json_data)
    json_list = [json.loads(item) for item in json_data]
    print("Json list ",json_list)

    return jsonify(json_list)

@app.route('/execute', methods=['POST'])
def execute_code():
    data = request.json
    code = data['code']
    level_id = data['levelId']

    try:
        level = load_level_data(level_id)
        if not level:
            return jsonify({"error": "Invalid level"}), 404
        
        dataset_path = os.path.join("server", level["dataset"])
        expected_result_path = os.path.join("server", level["expected_result"])
        
        #Load the entire data
        df = spark.read.csv(dataset_path, header=True, inferSchema=True)

        # Convert '' to null for all string columns
        for column_name, dtype in df.dtypes:
            if dtype == 'string':
                df = df.withColumn(column_name, when(col(column_name) == "''", None).otherwise(col(column_name)))
        
        # Load expected result
        expected_df = spark.read.csv(expected_result_path, header=True, inferSchema=True)
        
        # Prepare local scope for safe exec
        local_vars = {"df": df}
        
        exec(code, {}, local_vars)

        result_df = local_vars.get("result")

        validate = validate_result(result_df,expected_df)

        # Check if it contains error
        if "error" in validate:
            return jsonify({"error": validate["error"]}), 400

        # Otherwise, send success response
        return jsonify(validate)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Define a function to load the CSV file
def load_csv(file_path):
    try:
        # Using pandas to load the CSV into a DataFrame
        df = pd.read_csv(file_path)
        # Convert the DataFrame to a list of dictionaries
        return df.to_dict(orient='records')
    except Exception as e:
        print(f"Error loading CSV: {e}")
        return None
  
#Route: Get Specific Level Data
@app.route("/levels/<int:level_id>",methods=["GET"])
def get_level(level_id):
    level_data = load_level_data(level_id)
    if not level_data:
        return error_response(f"Level {level_id} data not found or corrupted", 404)
    
    # Load the dataset from the CSV
    datasets = level_data["dataset"].split(',')
    dataset_list = {}
    
    for ind,d in enumerate(datasets):
        d = d.strip()
        file_name = os.path.basename(d)
        dataset_list[level_data["dataset_name"][ind]] = load_csv(f'server/{d}')

    if dataset_list is None:
        return jsonify({"error": "Dataset loading failed"}), 500
    
    # Return the level's mission and dataset
    return jsonify({
        "level_id": level_id,
        "mission": level_data["mission"],
        "explain": level_data["explain"],
        "hint": level_data["hint"],
        "solution": level_data["solution"],
        "dataset": dataset_list
    })
    
#Route : Submit Pyspark code
@app.route("/submit",methods=["POST"])
def submit_code():
    data = request.get_json()

    # Get level and user code from the request
    level_id = data.get("level_id")
    user_code = data.get("user_code")

    # Get level data (to understand what was expected)
    level_data = load_level_data(level_id)

    if not level_data:
        return jsonify({"error": "Level not found"}), 404
    
    try:
        # Execute PySpark code for validation (you can modify the logic as needed)
        code_result = execute_pyspark_code(user_code, level_data)
        return jsonify({"result": code_result, "level_id": level_id})
    except Exception as e:
        return jsonify({"error": f"Error executing code: {str(e)}"}), 500

# Function to execute PySpark code
def execute_pyspark_code(user_code, level_data):
    # Assuming `user_code` is a valid PySpark transformation
    # and the `level_data['dataset']` is a path or a string representing the dataset

    # Load dataset (for now let's use CSV from the server folder)
    dataset_path = os.path.join("server", level_data['dataset'])
    df = spark.read.csv(dataset_path, header=True, inferSchema=True)

    # Dynamically execute user code using `exec()`
    local_vars = {"df": df, "spark": spark}
    try:
        exec(user_code, {}, local_vars)

        result_df = None
        for var_name in reversed(local_vars):
            if isinstance(local_vars[var_name], type(df)):  # Check if it's a DataFrame
                result_df = local_vars[var_name]
                break

        if result_df is None:
            raise Exception("No DataFrame was returned from the user's code.")
        
        return result_df.head(5)  # return first 5 rows as result for validation
    except Exception as e:
        raise Exception(f"Error in user code: {e}")
    
if __name__ == "__main__":
    app.run(debug=True, port=5000)