import os
import sys

import redis
from pymongo import MongoClient


def main():
    redis_client = redis.Redis(
        host=os.getenv("REDIS_HOST", "redis"),
        port=int(os.getenv("REDIS_PORT", "6379")),
        socket_connect_timeout=2,
    )
    redis_client.ping()

    mongo_client = MongoClient(os.getenv("MONGO_URI"), serverSelectionTimeoutMS=2000)
    mongo_client.admin.command("ping")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"Healthcheck failed: {error}", file=sys.stderr)
        sys.exit(1)
