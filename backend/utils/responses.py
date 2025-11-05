from flask import jsonify


def ok(data, status: int = 200):
	return jsonify(data), status


def fail(error: str, message: str, status: int = 400, fields=None):
	payload = {"error": error, "message": message}
	if fields:
		payload["fields"] = fields
	return jsonify(payload), status


