"""
AapdaSetu - Conversation Checkpointer Memory
=================================================
Configures standard in-memory checkpoints utilizing LangGraph MemorySaver
to sustain conversational state across multiple chat sessions/interactions.
"""

from langgraph.checkpoint.memory import MemorySaver

# Singleton checkpointer for keeping chat transcripts and execution history
memory_saver = MemorySaver()
