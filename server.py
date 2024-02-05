from flask import Flask, request, jsonify
from src.parser import parse, unparse
from src.polynomial import Polynomial

app = Flask(__name__)

@app.route('/add', methods=['POST'])
def add():
    """
    adds two numbers

    Returns:
        _type_: _description_
    """
    data = request.json
    poly1 = parse(data['poly1'])
    poly2 = parse(data['poly2'])
    result = poly1 + poly2
    return jsonify({'result': unparse(result)})

@app.route('/sub', methods=['POST'])
def sub():
    """
    adds two numbers

    Returns:
        _type_: _description_
    """
    data = request.json
    poly1 = parse(data['poly1'])
    poly2 = parse(data['poly2'])
    result = poly1 - poly2
    return jsonify({'result': unparse(result)})

@app.route('/mult', methods=['POST'])
def mult():
    """
    adds two numbers

    Returns:
        _type_: _description_
    """
    data = request.json
    poly1 = parse(data['poly1'])
    poly2 = parse(data['poly2'])
    result = poly1 * poly2
    return jsonify({'result': unparse(result)})

@app.route('/newton', methods=['POST'])
def newton():
    """
    adds two numbers

    Returns:
        _type_: _description_
    """
    data = request.json
    poly1 = parse(data['poly1'])
    poly2 = parse(data['poly2'])
    result = poly1 + poly2
    return jsonify({'result': unparse(result)})


@app.route('/secant', methods=['POST'])
def secant():
    """
    adds two numbers

    Returns:
        _type_: _description_
    """
    data = request.json
    poly1 = parse(data['poly1'])
    poly2 = parse(data['poly2'])
    result = poly1 + poly2
    return jsonify({'result': unparse(result)})

@app.route('/bisection', methods=['POST'])
def bisection():
    """
    adds two numbers

    Returns:
        _type_: _description_
    """
    data = request.json
    poly1 = parse(data['poly1'])
    poly2 = parse(data['poly2'])
    result = poly1 + poly2
    return jsonify({'result': unparse(result)})

@app.route('/newtonBisect', methods=['POST'])
def newton_bisect():
    """
    adds two numbers

    Returns:
        _type_: _description_
    """
    data = request.json
    poly1 = parse(data['poly1'])
    poly2 = parse(data['poly2'])
    result = poly1 + poly2
    return jsonify({'result': unparse(result)})

if __name__ == '__main__':
    app.run(debug=True)
