from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/add', methods=['POST'])
def add():
    """
    Adds two numbers provided in the JSON payload.

    Returns:
        JSON: A JSON response containing the sum of the two numbers.
    """
    data = request.json
    num1 = data.get('num1')
    num2 = data.get('num2')

    if num1 is None or num2 is None:
        return jsonify({'error': 'Missing parameters num1 and num2'}), 400

    try:
        result = float(num1) + float(num2)
        return jsonify({'result': result}), 200
    except ValueError:
        return jsonify({'error': 'Invalid parameters: num1 and num2 must be numbers'}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
