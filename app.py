from flask import Flask, jsonify, request
from flask_cors import CORS

from core.collections import Chord, Key, Scale
from core.enums import ChordType

app = Flask(__name__)
CORS(app)

@app.route('/C3-notes', methods=['GET'])
def get_scale_notes():
    # chords = Key("C4", ChordType.MAJOR).get_chords()
    # chords = [[note.note for note in triad.get_notes()] for triad in chords]

    chords = [
        [note.note for note in Chord("C4", ChordType.DIMINISHED).get_notes()],
        [note.note for note in Chord("G#3").get_notes()],
        [note.note for note in Chord("F#3").get_notes()],
        [note.note for note in Chord("G#3").get_notes()],
    ]


    print('chords', chords)
    return jsonify({'chords': chords })


# Route 1: Hello World
@app.route('/')
def hello_world():
    sc = Scale("C3", ChordType.HARMONIC_MINOR).compute_wave(7)
    print(sc)
    return 'Hello, World!'

# Route 2: Add two numbers
@app.route('/add', methods=['GET'])
def add_numbers():
    # Get numbers from query parameters (e.g., /add?a=5&b=10)
    a = request.args.get('a', type=int, default=0)
    b = request.args.get('b', type=int, default=0)
    result = a + b
    return jsonify({"result": result})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True)

