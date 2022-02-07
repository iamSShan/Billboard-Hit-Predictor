import json
import pickle
import sklearn
import xgboost
import pandas as pd
from flask import jsonify
from flask import Flask, render_template, request


app = Flask(__name__)

@app.route('/')
def home():
    """
    Renders home page of the application
    Url: /
    """

    # Read songs
    songs_df = pd.read_csv("notebook/data/test.csv")

    # Create list of dictionary for all songs, so that we can show them in dropdown at front end
    songs_list = []
    for idx, song in songs_df.iterrows():
        song_dict = {}
        song_dict['id'] = song["id"]
        song_dict['value'] = song["track_name"]
        songs_list.append(song_dict)

    return render_template("home.html", songs=songs_list)


def get_prediction_probability(row, selected_model):
    """
    Get prediction probability for given song and model 
    """
    if selected_model == "xgb":
        model = pickle.load(open("notebook/models/xgb.pkl", 'rb'))
    elif selected_model == "rf":
            model = pickle.load(open("notebook/models/rf.pkl", 'rb'))
    elif selected_model == "dt":
        model = pickle.load(open("notebook/models/dt.pkl", 'rb'))
    elif selected_model == "lr":
        model = pickle.load(open("notebook/models/log_reg.pkl", 'rb'))
    elif selected_model == "svc":
        model = pickle.load(open("notebook/models/svc.pkl", 'rb'))

    # prediction = int(prediction)
    # prediction = model.predict(row)[0] # As only one prediction will be in the list

    prob_array = model.predict_proba(row)
    # Probabilities are in this form: array([[0.78627276, 0.21372725]], dtype=float32)
    probability = prob_array[0, 1]
    probability = round(float(probability) * 100, 2)
    print(probability)

    return probability


@app.route('/predict/')
def predict():
    """
    When at frontend for any specific song is selected and predict button is clicked
    Url: /predict
    """
    # Get parameters from front end
    song_id = request.args.get('song')
    selected_model = request.args.get('model')
    song_id = song_id.strip()
    print(song_id, selected_model)

    # Check if correct model is selected
    model_list = ["dt", "rf", "xgb", "lr", "svc"]
    selected_model = selected_model.strip()
    if selected_model not in model_list:
        return

    # Now get song details from csv file
    songsDF = pd.read_csv("notebook/data/test.csv")
    row = songsDF[songsDF.id == song_id]
    artist_name = row["artist_name"].iloc[0]
    song_name = row["track_name"].iloc[0]
    row = row[["acousticness", "danceability", "duration_ms", "energy", "explicit", "instrumentalness", "key", "liveness", "loudness", "mode", "popularity", "speechiness", "tempo", "valence", "sentimentPos", "sentimentNeg", "sentimentComp", "sentimentNeu", "pos_neg_diff"]]
    # Get hit probability
    probability = get_prediction_probability(row, selected_model)

    # Return the results to ajax call
    results = {'artist_name': artist_name,'song_name': song_name, 'probability': probability}
    return results


if __name__ == '__main__':
    app.run()
