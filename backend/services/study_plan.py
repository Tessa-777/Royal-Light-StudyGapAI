from typing import Any, Dict, List


def build_adjusted_plan(existing_plan: Dict[str, Any], completed_topics: List[str], new_weak_topics: List[str]) -> Dict[str, Any]:
	plan = {**existing_plan}
	weeks = plan.get("weeks", [])
	
	# Remove completed topics from all weeks
	# Topics can be dicts (with topicId) or strings (topicId directly)
	for w in weeks:
		w_topics = w.get("topics", [])
		# Filter out completed topics by comparing topicId
		filtered_topics = []
		for t in w_topics:
			if isinstance(t, dict):
				topic_id = t.get("topicId") or t.get("topic_id")
				if topic_id not in completed_topics:
					filtered_topics.append(t)
			elif isinstance(t, str):
				if t not in completed_topics:
					filtered_topics.append(t)
		w["topics"] = filtered_topics
	
	# Append new weak topics to first week for quick feedback loop
	if weeks and new_weak_topics:
		first = weeks[0]
		first_topics = first.get("topics", [])
		
		# Convert new weak topics to dict format if they're strings
		new_topic_objects = []
		for topic_id in new_weak_topics:
			# Check if already exists
			exists = False
			for existing_topic in first_topics:
				if isinstance(existing_topic, dict):
					if existing_topic.get("topicId") == topic_id or existing_topic.get("topic_id") == topic_id:
						exists = True
						break
				elif isinstance(existing_topic, str) and existing_topic == topic_id:
					exists = True
					break
			
			if not exists:
				# Create a simple topic dict
				new_topic_objects.append({"topicId": topic_id, "topicName": topic_id})
		
		first["topics"] = first_topics + new_topic_objects
	
	return plan


