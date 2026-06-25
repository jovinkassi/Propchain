import json
import os
from typing import List
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from datetime import datetime, timezone
from dotenv import load_dotenv
from google import genai
from google.genai import types
from src.tools.property_tools import (
    get_property_details, list_all_properties,
    calculate_investment_return, get_market_overview, compare_properties
)
from src.db.mongo import get_chat_collection

load_dotenv()

router = APIRouter()
client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

MODEL = "gemini-2.0-flash-lite"

SYSTEM_PROMPT = """You are Propchain AI, an expert real estate investment advisor for the UAE market.
You help investors understand property returns, compare investments, and make informed decisions.
You have access to real-time data from the Propchain platform — always use tools to fetch actual numbers.
Be concise, data-driven, and always quote amounts in AED."""

TOOL_MAP = {
    "get_property_details": get_property_details,
    "list_all_properties": list_all_properties,
    "calculate_investment_return": calculate_investment_return,
    "get_market_overview": get_market_overview,
    "compare_properties": compare_properties,
}

TOOLS = [
    types.Tool(function_declarations=[
        types.FunctionDeclaration(
            name="get_property_details",
            description="Get detailed information about a specific UAE property listed on Propchain",
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={"property_name": types.Schema(type=types.Type.STRING, description="Property name")},
                required=["property_name"],
            ),
        ),
        types.FunctionDeclaration(
            name="list_all_properties",
            description="List all active investment properties on Propchain sorted by yield",
            parameters=types.Schema(type=types.Type.OBJECT, properties={}),
        ),
        types.FunctionDeclaration(
            name="calculate_investment_return",
            description="Calculate expected annual and monthly returns for a given investment amount",
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "property_id": types.Schema(type=types.Type.STRING, description="Property ID or on-chain ID"),
                    "investment_aed": types.Schema(type=types.Type.NUMBER, description="Investment amount in AED"),
                },
                required=["property_id", "investment_aed"],
            ),
        ),
        types.FunctionDeclaration(
            name="get_market_overview",
            description="Get overall UAE real estate market statistics from Propchain",
            parameters=types.Schema(type=types.Type.OBJECT, properties={}),
        ),
        types.FunctionDeclaration(
            name="compare_properties",
            description="Compare multiple properties side by side",
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "property_names": types.Schema(
                        type=types.Type.ARRAY,
                        items=types.Schema(type=types.Type.STRING),
                        description="List of property names to compare",
                    )
                },
                required=["property_names"],
            ),
        ),
    ])
]

CONFIG = types.GenerateContentConfig(
    system_instruction=SYSTEM_PROMPT,
    tools=TOOLS,
)


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    wallet: str | None = None


async def stream_agent_response(messages: list[dict]):
    contents = []
    for m in messages:
        role = "user" if m["role"] == "user" else "model"
        contents.append(types.Content(role=role, parts=[types.Part(text=m["content"])]))

    full_response = ""

    while True:
        response = client.models.generate_content(
            model=MODEL,
            contents=contents,
            config=CONFIG,
        )

        candidate = response.candidates[0]
        fn_calls = [p for p in candidate.content.parts if p.function_call is not None]

        if not fn_calls:
            text = candidate.content.parts[0].text if candidate.content.parts else ""
            full_response = text
            words = text.split(" ")
            for i, word in enumerate(words):
                chunk = word + (" " if i < len(words) - 1 else "")
                yield f"data: {json.dumps({'type': 'text', 'content': chunk})}\n\n"
            yield f"data: {json.dumps({'type': 'done', 'full_response': full_response})}\n\n"
            return

        contents.append(candidate.content)

        tool_response_parts = []
        for part in fn_calls:
            fn_name = part.function_call.name
            fn_args = dict(part.function_call.args)
            yield f"data: {json.dumps({'type': 'tool_call', 'tool': fn_name})}\n\n"
            fn = TOOL_MAP.get(fn_name)
            result = fn(**fn_args) if fn else {"error": "Unknown tool"}
            tool_response_parts.append(
                types.Part(
                    function_response=types.FunctionResponse(
                        name=fn_name,
                        response={"result": result},
                    )
                )
            )

        contents.append(types.Content(role="user", parts=tool_response_parts))


@router.post("/chat")
async def chat(req: ChatRequest):
    messages = [m.model_dump() for m in req.messages]

    async def stream_and_save():
        full_response = ""
        async for chunk in stream_agent_response(messages):
            yield chunk
            try:
                data = json.loads(chunk.replace("data: ", ""))
                if data.get("type") == "done":
                    full_response = data.get("full_response", "")
            except Exception:
                pass

        if req.wallet and full_response:
            try:
                collection = get_chat_collection()
                user_msg = messages[-1]["content"] if messages else ""
                await collection.insert_one({
                    "wallet": req.wallet,
                    "user_message": user_msg,
                    "ai_response": full_response,
                    "created_at": datetime.now(timezone.utc),
                })
            except Exception:
                pass

    return StreamingResponse(
        stream_and_save(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
