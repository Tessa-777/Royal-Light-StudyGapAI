from typing import Any, Dict, List


def build_adjusted_plan(existing_plan: Dict[str, Any], completed_topics: List[str], new_weak_topics: List[str]) -> Dict[str, Any]:
	plan = {**existing_plan}
	weeks = plan.get("weeks", [])
	for w in weeks:
		w_topics = w.get("topics", [])
		w["topics"] = [t for t in w_topics if t not in completed_topics]
	# Append new weak topics to first week for quick feedback loop
	if weeks:
		first = weeks[0]
		first_topics = first.get("topics", [])
		first["topics"] = list(dict.fromkeys(list(new_weak_topics) + first_topics))
	return plan


