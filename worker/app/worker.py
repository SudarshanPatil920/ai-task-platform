import json
from bson import ObjectId
from redis_client import redis_client
from tasks import process_task, tasks_collection

print("Worker started...")

while True:
    task_id = None  # ensure it's always defined

    try:
        # Blocking pop (waits until job arrives)
        _, task_data = redis_client.brpop("task_queue")

        # Redis returns bytes → decode first
        task_data = task_data.decode("utf-8")

        # Convert JSON string → dict
        task = json.loads(task_data)

        # Handle ObjectId safely
        if isinstance(task["_id"], dict):
            task_id = ObjectId(task["_id"]["$oid"])
        else:
            task_id = ObjectId(task["_id"])

        print(f"Processing task {task_id}")

        # Update status → running
        tasks_collection.update_one(
            {"_id": task_id},
            {"$set": {"status": "running", "logs": "Task started"}}
        )

        # Process task
        result = process_task(task)

        # Update success
        tasks_collection.update_one(
            {"_id": task_id},
            {
                "$set": {
                    "status": "success",
                    "result": result,
                    "logs": "Task completed"
                }
            }
        )

    except Exception as e:
        print("Error:", str(e))

        if task_id:
            tasks_collection.update_one(
                {"_id": task_id},
                {
                    "$set": {
                        "status": "failed",
                        "logs": str(e)
                    }
                }
            )