import os
import sys

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from agents.coordinator import execute_pipeline, format_disaster_report

def main():
    print("=====================================")
    print("AapdaSetu AI Disaster Intelligence")
    print("=====================================\n")
    
    while True:
        try:
            query = input("Enter your query:\n> ").strip()
            
            if not query:
                continue
                
            if query.lower() in ["exit", "quit", "q"]:
                print("Exiting AapdaSetu AI. Stay safe!")
                break
                
            print("\nProcessing...\n")
            
            state = execute_pipeline(query=query)
            report = format_disaster_report(state)
            
            print(report)
            
        except KeyboardInterrupt:
            print("\nExiting AapdaSetu AI. Stay safe!")
            break
        except Exception as e:
            print(f"\n[Error] An unexpected error occurred: {e}")
            print("Please try again with a different query.\n")

if __name__ == "__main__":
    main()