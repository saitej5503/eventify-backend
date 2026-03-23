from flask import Flask, request, jsonify
import pandas as pd
import joblib

app = Flask(__name__)

# load trained model
model = joblib.load("ml/model.pkl")

# expected columns from training
columns = [
"user_interest_dance",
"user_interest_music",
"user_interest_sports",
"user_interest_tech",
"event_category_dance",
"event_category_music",
"event_category_sports",
"event_category_tech",
"location_chennai"
]

'''''
@app.route("/recommend", methods=["POST"])
def recommend():

    data = request.json

    df = pd.DataFrame([data])
    df = pd.get_dummies(df)

    for col in columns:
        if col not in df:
            df[col] = 0

    df = df[columns]

    prediction = model.predict(df)[0]

    categories = {
        0: "sports",
        1: "music",
        2: "dance",
        3: "tech"
    }

    predicted_category = categories.get(prediction, "tech")

    return jsonify({
        "recommended_category": predicted_category
    })
''' 
@app.route("/recommend", methods=["POST"])
def recommend():

    data = request.json

    user_interests = data.get("user_interests", [])
    location = data.get("location")

    if not user_interests:
        user_interests = ["music"]

    interest = user_interests[0]

    row = {
        "user_interest": interest,
        "event_category": interest,
        "location": location
    }

    df = pd.DataFrame([row])
    df = pd.get_dummies(df)

    for col in columns:
        if col not in df:
            df[col] = 0

    df = df[columns]

    prediction = model.predict(df)[0]

    categories = {
        0: "sports",
        1: "music",
        2: "dance",
        3: "tech"
    }

    predicted_category = categories.get(prediction, "tech")

    return jsonify({
        "recommended_categories": [predicted_category]
    })
app.run(port=6000)