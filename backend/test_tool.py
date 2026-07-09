from dotenv import load_dotenv
load_dotenv()

from app.services.ai.tools import log_interaction

def test_tool():
    print("Testing log_interaction tool independently...\n")
    
    # 1. Provide sample data directly to the tool function
    doctor_name = "Dr Sarah"
    interaction_type = "Meeting"
    date = "2023-11-01T10:00:00Z"
    notes = "Dr Sarah was very interested in our new diabetes drug. She asked for a clinical trial brochure. We should follow up next week."
    
    # 2. Call the tool directly (without LangGraph agent)
    # The @tool decorator wraps the function, so we call .invoke() with a dict of args
    try:
        result = log_interaction.invoke({
            "doctor_name": doctor_name,
            "type": interaction_type,
            "date": date,
            "notes": notes
        })
        
        print("--- Tool Result ---")
        print(result)
    except Exception as e:
        print(f"Error testing tool: {e}")

if __name__ == "__main__":
    test_tool()
