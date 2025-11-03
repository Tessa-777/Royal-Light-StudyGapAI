from typing import Any, Dict, List, Tuple


def require_fields(obj: Dict[str, Any], fields: List[str]) -> Tuple[bool, List[str]]:
	missing = [f for f in fields if f not in obj or obj.get(f) in (None, "")]
	return (len(missing) == 0, missing)


