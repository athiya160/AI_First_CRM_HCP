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
    
    system_prompt = SystemMessage(content=(
        "You are the CRM Copilot, an advanced AI assistant for pharmaceutical sales representatives. "
        "Your primary goal is to help users manage their interactions with Healthcare Professionals (HCPs). "
        "You have access to tools to log, edit, search, and summarize interactions, as well as schedule follow-ups. "
        "When a user asks you to perform a task, ALWAYS use the appropriate tool. "
        "When you successfully execute a tool, do NOT just say 'The meeting has been logged'. "
        "Instead, provide a highly professional, conversational response outlining exactly what was logged. "
        "For example: 'I have successfully logged your meeting with Dr. Smith. Based on your notes, here is my understanding:\\n- Topic: X\\n- Sentiment: Y\\n- Action Items: Z\\nInteraction ID #3 has been saved.'"
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
