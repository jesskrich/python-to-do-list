import firebase_admin
from firebase_admin import credentials, firestore 
import sys

cred = credentials.Certificate("config/firebase_connection.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# my_list = []
# --- 
# Collection name
COLLECTION = "tasks"

def welcome_message():
    print_list()
    command = input(" type 'add' to add an item or type 'delete' to delete an item")
    if command == "add":
        task = input(" what would you like to add?")
        add_item(task)
        welcome_message()
    elif command == "delete":
        commandtask_number = input(" enter the number of the item you want to delete?")
        delete_item(task_number)
    welcome_message()

            
def add_item(task):
    db.collection(COLLECTION).add({"task": task})
    print("✅ Task added!")

def delete_item(task_number): 
    tasks = list(db.collection(COLLECTION).stream())
    try:
        task_index = int(task_number) - 1
        task_to_delete = tasks[task_index]
        db.collection(COLLECTION).document(task_to_delete.id).delete()
        print("🗑️ Task deleted!")
    except (IndexError, ValueError):
        print("❌ Invalid task number.")

def print_list():
    tasks = list(db.collection(COLLECTION).stream())
    
    if not tasks:
        print("You have no to-dos.")
    else:
        print("📋 Your To-Dos:")
        for index, doc in enumerate(tasks):
            print(f"{index + 1}. {doc.to_dict().get('task', '[No Task Text]')}")

welcome_message()
