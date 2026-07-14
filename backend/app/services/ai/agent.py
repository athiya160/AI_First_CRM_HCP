import os
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_groq import ChatGroq
from app.services.ai.state import AgentState
from app.services.ai.tools import agent_tools
from langchain_core.messages import SystemMessage
from app.core.config import settings

# 1. Initialize the LLM (Groq llama-3.3-70b-versatile)
# Requires GROQ_API_KEY environment variable to be set
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0,
    api_key=settings.GROQ_API_KEY
)

# 2. Bind tools to the LLM
llm_with_tools = llm.bind_tools(agent_tools)

# 3. Define the node functions
def call_model(state: AgentState):
    """Invoke the LLM with the current conversation state."""
    messages = state['messages']
    
    from datetime import datetime
    today = datetime.now().strftime("%Y-%m-%d")
    system_prompt = SystemMessage(content=(
        f"You are CRM Copilot, an advanced AI assistant for pharmaceutical sales representatives. "
        f"Today's date is {today}. "
        "Your goal is to help users manage interactions with Healthcare Professionals (HCPs) using your tools. "
        "IMPORTANT RULES:\n"
        "1. FRIENDLY ERROR HANDLING: If a tool fails or you cannot find a doctor, do NOT just output the error. Ask a friendly follow-up, e.g., 'I couldn't identify the doctor. Could you tell me their full name?'.\n"
        "2. DO NOT HALLUCINATE: Never invent a doctor's name (like 'Dr. Smith') if it wasn't provided in the prompt or conversation history. Always ask the user for clarification.\n"
        "3. CONVERSATION MEMORY: You have access to previous messages in this thread. Use them to infer context, such as which doctor the user is talking about.\n"
        "4. TOOL USAGE: When executing a tool successfully (like log_interaction), format your final response as a beautiful Markdown card. Do NOT just output a plain paragraph.\n\n"
        "Example format for a logged interaction:\n"
        "✓ Interaction Logged\n\n"
        "**Doctor**\nDr Sarah\n\n"
        "**Summary**\nDiscussed diabetes medication.\n\n"
        "**Sentiment**\nPositive 😊\n\n"
        "**Confidence**\n96%\n\n"
        "**Entities**\n• Diabetes\n• Insulin\n\n"
        "**Action Items**\n✓ Follow-up next Monday\n\n"
        "4. TOOL USED BADGE: Whenever you use a tool, YOU MUST append this exact block to the very end of your final response:\n\n"
        "**Tool Used**\n"
        "✓ [insert_tool_name_here]"
    ))
    
    # Prepend the system prompt to give the LLM its persona
    if not messages or not isinstance(messages[0], SystemMessage):
        invoke_messages = [system_prompt] + list(messages)
    else:
        invoke_messages = messages
        
    response = llm_with_tools.invoke(invoke_messages)
    return {"messages": [response]}

def should_continue(state: AgentState) -> str:
    """Determine whether to use tools or end the conversation."""
    messages = state['messages']
    last_message = messages[-1]
    
    # If the LLM makes a tool call, route to the "tools" node
    if last_message.tool_calls:
        return "tools"
    # Otherwise, stop
    return END

# 4. Define the Graph (ReAct Agent Skeleton)
workflow = StateGraph(AgentState)

# Add nodes
workflow.add_node("agent", call_model)
workflow.add_node("tools", ToolNode(agent_tools))

# Set entry point
workflow.set_entry_point("agent")

# Add conditional edges from agent
workflow.add_conditional_edges(
    "agent",
    should_continue,
    {
        "tools": "tools",
        END: END
    }
)

# Add edge from tools back to agent
workflow.add_edge("tools", "agent")

# Compile the graph
graph = workflow.compile()
