import asyncio
import httpx

API_URL = "http://localhost:8000/api/v1"

async def seed():
    async with httpx.AsyncClient(base_url=API_URL) as client:
        # Create Student
        print("Creating Student...")
        student_resp = await client.post("/users/", json={
            "email": "arjun.sharma@uiet.edu.in",
            "name": "Arjun Sharma",
            "role": "STUDENT",
            "graduation_year": 2025
        })
        if student_resp.status_code == 200:
            print("Student created successfully:", student_resp.json())
        else:
            print("Failed to create student:", student_resp.text)

        # Create Recruiter
        print("Creating Recruiter...")
        recruiter_resp = await client.post("/users/", json={
            "email": "priya.nair@zomato.com",
            "name": "Priya Nair",
            "role": "ALUMNI"
        })
        if recruiter_resp.status_code == 200:
            print("Recruiter created successfully:", recruiter_resp.json())
        else:
            print("Failed to create recruiter:", recruiter_resp.text)

if __name__ == "__main__":
    asyncio.run(seed())
