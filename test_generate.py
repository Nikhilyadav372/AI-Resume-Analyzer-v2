import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print("API Key:", api_key[:10] + "...")

client = genai.Client(api_key=api_key)

print("Available text generation models:")

for model in client.models.list():
    if "generateContent" in getattr(model, "supported_actions", []):
        print(model.name)

print("\nTesting generation...")

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents="Say only: Hello"
)
response = client.models.generate_content(
    model="gemini-3.1-flash-lite",
    contents="Say only: Hello"
)
for model in client.models.list():
    if "generateContent" in getattr(model, "supported_actions", []):
        print(model.name)

print(response.text)