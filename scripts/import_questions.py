#!/usr/bin/env python3
"""
Import questions into StudyGapAI database.

This script helps import questions from JSON file into Supabase database.
"""

import json
import os
import sys
from typing import Dict, List, Optional
from dotenv import load_dotenv

# Add parent directory to path to import backend modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

try:
    from supabase import create_client, Client
except ImportError:
    print("❌ Error: supabase package not installed.")
    print("Install it with: pip install supabase")
    sys.exit(1)

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file")
    sys.exit(1)


def get_topics(supabase: Client) -> Dict[str, str]:
    """Get all topics and return a map of topic name to topic_id."""
    try:
        response = supabase.table("topics").select("id, name").execute()
        topics = {}
        for topic in response.data:
            topics[topic["name"]] = topic["id"]
        return topics
    except Exception as e:
        print(f"❌ Error fetching topics: {e}")
        return {}


def validate_question(question: Dict, topics: Dict[str, str]) -> tuple[bool, Optional[str]]:
    """Validate a question."""
    # Check required fields
    required_fields = ["topic", "subject", "question_text", "option_a", "option_b", "option_c", "option_d", "correct_answer"]
    for field in required_fields:
        if field not in question or not question[field]:
            return False, f"Missing required field: {field}"
    
    # Check topic exists
    if question["topic"] not in topics:
        return False, f"Topic '{question['topic']}' not found in database"
    
    # Check correct_answer
    if question["correct_answer"].upper() not in ["A", "B", "C", "D"]:
        return False, f"Invalid correct_answer: {question['correct_answer']}. Must be A, B, C, or D"
    
    # Check difficulty if provided
    if "difficulty" in question and question["difficulty"]:
        if question["difficulty"] not in ["easy", "medium", "hard"]:
            return False, f"Invalid difficulty: {question['difficulty']}. Must be easy, medium, or hard"
    
    return True, None


def prepare_question(question: Dict, topics: Dict[str, str]) -> Dict:
    """Prepare question for database insertion."""
    # Get topic_id
    topic_id = topics.get(question["topic"])
    
    # Prepare question data
    prepared = {
        "topic_id": topic_id,
        "topic": question["topic"],
        "subject": question["subject"],
        "question_text": question["question_text"],
        "option_a": question["option_a"],
        "option_b": question["option_b"],
        "option_c": question["option_c"],
        "option_d": question["option_d"],
        "correct_answer": question["correct_answer"].upper(),
    }
    
    # Add optional fields
    if "difficulty" in question and question["difficulty"]:
        prepared["difficulty"] = question["difficulty"]
    
    if "subtopic" in question and question["subtopic"]:
        prepared["subtopic"] = question["subtopic"]
    
    return prepared


def import_questions(supabase: Client, questions: List[Dict], batch_size: int = 50) -> tuple[int, int]:
    """Import questions into database."""
    # Get topics
    print("📋 Fetching topics from database...")
    topics = get_topics(supabase)
    
    if not topics:
        print("❌ Error: No topics found in database. Please create topics first.")
        return 0, 0
    
    print(f"✅ Found {len(topics)} topics: {', '.join(topics.keys())}")
    
    # Validate and prepare questions
    print(f"\n📝 Validating {len(questions)} questions...")
    valid_questions = []
    invalid_count = 0
    
    for i, question in enumerate(questions, 1):
        is_valid, error = validate_question(question, topics)
        if is_valid:
            prepared = prepare_question(question, topics)
            valid_questions.append(prepared)
        else:
            print(f"  ⚠️  Question {i} invalid: {error}")
            invalid_count += 1
    
    print(f"✅ {len(valid_questions)} valid questions, {invalid_count} invalid")
    
    if not valid_questions:
        print("❌ No valid questions to import")
        return 0, invalid_count
    
    # Import in batches
    print(f"\n📤 Importing {len(valid_questions)} questions in batches of {batch_size}...")
    imported_count = 0
    failed_count = 0
    
    for i in range(0, len(valid_questions), batch_size):
        batch = valid_questions[i:i + batch_size]
        try:
            response = supabase.table("questions").insert(batch).execute()
            imported_count += len(batch)
            print(f"  ✅ Imported batch {i // batch_size + 1}: {len(batch)} questions")
        except Exception as e:
            print(f"  ❌ Error importing batch {i // batch_size + 1}: {e}")
            failed_count += len(batch)
    
    print(f"\n✅ Import complete!")
    print(f"  - Imported: {imported_count}")
    print(f"  - Failed: {failed_count}")
    print(f"  - Invalid: {invalid_count}")
    
    return imported_count, invalid_count + failed_count


def main():
    """Main function."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Import questions into StudyGapAI database")
    parser.add_argument("file", help="JSON file containing questions")
    parser.add_argument("--batch-size", type=int, default=50, help="Batch size for import (default: 50)")
    parser.add_argument("--dry-run", action="store_true", help="Validate questions without importing")
    
    args = parser.parse_args()
    
    # Check if file exists
    if not os.path.exists(args.file):
        print(f"❌ Error: File not found: {args.file}")
        sys.exit(1)
    
    # Load questions from JSON
    print(f"📂 Loading questions from {args.file}...")
    try:
        with open(args.file, "r", encoding="utf-8") as f:
            questions = json.load(f)
    except Exception as e:
        print(f"❌ Error loading JSON file: {e}")
        sys.exit(1)
    
    if not isinstance(questions, list):
        print("❌ Error: JSON file must contain an array of questions")
        sys.exit(1)
    
    print(f"✅ Loaded {len(questions)} questions")
    
    # Initialize Supabase client
    print("\n🔌 Connecting to Supabase...")
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        print("✅ Connected to Supabase")
    except Exception as e:
        print(f"❌ Error connecting to Supabase: {e}")
        sys.exit(1)
    
    # Dry run: only validate
    if args.dry_run:
        print("\n🔍 Dry run mode: Validating questions only...")
        topics = get_topics(supabase)
        if not topics:
            print("❌ Error: No topics found in database")
            sys.exit(1)
        
        valid_count = 0
        invalid_count = 0
        for i, question in enumerate(questions, 1):
            is_valid, error = validate_question(question, topics)
            if is_valid:
                valid_count += 1
            else:
                print(f"  ⚠️  Question {i} invalid: {error}")
                invalid_count += 1
        
        print(f"\n✅ Validation complete!")
        print(f"  - Valid: {valid_count}")
        print(f"  - Invalid: {invalid_count}")
        return
    
    # Import questions
    imported, failed = import_questions(supabase, questions, args.batch_size)
    
    if failed > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()

