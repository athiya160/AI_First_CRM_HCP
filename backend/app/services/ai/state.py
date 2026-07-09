import operator
from typing import Annotated, Sequence, TypedDict
from langchain_core.messages import BaseMessage

class AgentState(TypedDict):
    """
    The state of the agent.
    messages: A list of messages in the conversation.
    """
    messages: Annotated[Sequence[BaseMessage], operator.add]
