import json
import os
import time
import traceback

import redis
from bson import ObjectId
from redis.exceptions import RedisError

from tasks import process_task, tasks_collection

QUEUE_NAME = "task_queue"


def connect_redis():
    while True:
        try:
            client = redis.Redis(
                host=os.getenv("REDIS_HOST", "redis"),
                port=int(os.getenv("REDIS_PORT", "6379")),
                decode_responses=True,
            )
            client.ping()
            print("Connected to Redis", flush=True)
            return client
        except Exception as error:
            print(
                f"Redis not ready, retrying in 2 seconds... {error}",
                flush=True,
            )
            time.sleep(2)


def parse_task_id(task):
    raw_id = task["_id"]
    if isinstance(raw_id, dict) and "$oid" in raw_id:
        return ObjectId(raw_id["$oid"])
    return ObjectId(raw_id)


def update_task_status(task_id, status, logs, result=None):
    update = {
        "status": status,
        "logs": logs,
    }
    if result is not None:
        update["result"] = result

    tasks_collection.update_one(
        {"_id": task_id},
        {"$set": update},
    )


def main():
    print("Worker started", flush=True)
    redis_client = connect_redis()

    while True:
        task_id = None

        try:
            print("Waiting for task...", flush=True)
            queue_item = redis_client.brpop(QUEUE_NAME)

            if not queue_item:
                continue

            _, task_data = queue_item
            task = json.loads(task_data)
            task_id = parse_task_id(task)

            print(f"Processing task {task_id}", flush=True)
            update_task_status(task_id, "running", "Task started")

            result = process_task(task)

            update_task_status(task_id, "success", "Task completed", result)
            print(f"Completed task {task_id}", flush=True)

        except RedisError as error:
            print(f"Redis error: {error}", flush=True)
            print(traceback.format_exc(), flush=True)
            redis_client = connect_redis()

        except Exception as error:
            print(f"Worker error: {error}", flush=True)
            print(traceback.format_exc(), flush=True)

            if task_id:
                update_task_status(task_id, "failed", str(error))


if __name__ == "__main__":
    main()
