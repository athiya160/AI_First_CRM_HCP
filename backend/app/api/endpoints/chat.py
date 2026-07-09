import json
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.ai.agent import graph
from langchain_core.messages import HumanMessage, ToolMessage

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    hcp_id: int = None

@router.post("/")
def chat_endpoint(request: ChatRequest):
    # 1. Receive user message and convert to HumanMessage
    user_message = HumanMessage(content=request.message)
    
    # Defaults for structured fields
    summary = ""
    sentiment = "Neutral"
    confidence = 0
    entities = []
    action_items = []
    doctor = None
    interaction_id = None
    
    # 2 & 3. Call LangGraph & Execute tools automatically
    try:
        final_state = graph.invoke({"messages": [user_message]})
        
        # Extract the final AI response (last message in the state)
        messages = final_state.get("messages", [])
        ai_response = messages[-1].content if messages else "No response generated."
        
        # 4. Extract structured data from tool executions if any
        for msg in reversed(messages):
            if isinstance(msg, ToolMessage):
                try:
                    tool_data = json.loads(msg.content)
                    if "summary" in tool_data:
                        summary = tool_data.get("summary", summary)
                        sentiment = tool_data.get("sentiment", sentiment)
                        confidence = tool_data.get("confidence", confidence)
                        entities = tool_data.get("entities", entities)
                        action_items = tool_data.get("action_items", action_items)
                        doctor = tool_data.get("doctor", doctor)
                        interaction_id = tool_data.get("interaction_id", interaction_id)
                        break  # Got the most recent structured data
                except (json.JSONDecodeError, TypeError):
                    continue
                    
    except Exception as e:
        ai_response = f"I'm sorry, I cannot process your request right now. Error: {str(e)}"
    
    # 5. Return structured JSON
    return {
        "reply": ai_response,
        "success": True,
        "summary": summary,
        "sentiment": sentiment,
        "confidence": confidence,
        "entities": entities,
        "action_items": action_items,
        "doctor": doctor,
        "interaction_id": interaction_id
    }
