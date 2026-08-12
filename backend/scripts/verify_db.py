import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

load_dotenv("backend/.env")

async def verify():
    db_url = os.getenv("DATABASE_URL")
    engine = create_async_engine(db_url)
    async with engine.connect() as conn:
        res1 = await conn.execute(text("SELECT current_database(), current_user, version();"))
        db_info = res1.fetchone()
        print(f"PostgreSQL Active Database: {db_info[0]}")
        print(f"PostgreSQL Active User: {db_info[1]}")
        print(f"PostgreSQL Version: {db_info[2]}")

        res2 = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;"))
        tables = [r[0] for r in res2.fetchall()]
        print(f"Initialized PostgreSQL Tables: {tables}")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(verify())
