from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DB_NAME")]
tasks_collection = db["tasks"]

def process_task(task):
    operation = task.get("operation")
    input_text = task.get("input")

    if operation == "uppercase":
        return input_text.upper()
    elif operation == "lowercase":
        return input_text.lower()
    elif operation == "reverse":
        return input_text[::-1]
    elif operation == "wordcount":
        return str(len(input_text.split()))
    else:
        raise Exception("Invalid operation")