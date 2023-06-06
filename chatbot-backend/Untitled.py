#!/usr/bin/env python
# coding: utf-8

# In[3]:


import requests
from dotenv import dotenv_values
env_vars = dotenv_values(".env")
OPENAI_API_KEY = env_vars["OPENAI_API_KEY"]

def get_chatbot_response(user_message, condition, severity):
    # ChatGPT API endpoint
    api_endpoint = "https://api.openai.com/v1/chat/completions"

    # API request payload
    payload = {
        "messages": [
            {"role": "system", "content": "You are a helpdesk assistant for health conditions."},
            {"role": "user", "content": "I have a " + condition + " with " + severity + " severity. " + user_message},
        ],
        "model": "gpt-3.5-turbo"
    }

    # Set your OpenAI API key
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }

    # Send the API request
    response = requests.post(api_endpoint, json=payload, headers=headers)
    response_json = response.json()

    # Extract and return the chatbot's response
    return response_json["choices"][0]["message"]["content"]


# In[4]:


from flask import Flask, request, jsonify
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
@app.route("/chat", methods=["POST"])
def handle_chat_request():
    user_message = request.json["message"]
    condition = request.json["condition"]
    severity = request.json["severity"]

    chatbot_response = get_chatbot_response(user_message, condition, severity)

    return jsonify({"response": chatbot_response})

if __name__ == "__main__":
    app.run()


# In[ ]:




