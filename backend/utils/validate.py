from functools import wraps
from typing import Type
from flask import request
from pydantic import BaseModel, ValidationError
from .responses import fail


def validate_json(model: Type[BaseModel]):
	def decorator(fn):
		@wraps(fn)
		def wrapper(*args, **kwargs):
			try:
				payload = request.get_json(force=True) or {}
				model.model_validate(payload)
			except ValidationError as ve:
				return fail("validation_error", "Invalid request body", 400, fields=ve.errors())
			return fn(*args, **kwargs)
		return wrapper
	return decorator


