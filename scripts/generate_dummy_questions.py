#!/usr/bin/env python3
"""
Generate dummy questions for StudyGapAI database.

This script generates realistic JAMB-style Mathematics questions for testing.
"""

import json
import uuid
from typing import Dict, List

# JAMB Mathematics Topics
TOPICS = [
    {"name": "Algebra", "subject": "Mathematics", "subtopics": ["Linear Equations", "Quadratic Equations", "Polynomials", "Inequalities"]},
    {"name": "Geometry", "subject": "Mathematics", "subtopics": ["Triangles", "Circles", "Area", "Volume"]},
    {"name": "Trigonometry", "subject": "Mathematics", "subtopics": ["Sine", "Cosine", "Tangent", "Identities"]},
    {"name": "Calculus", "subject": "Mathematics", "subtopics": ["Differentiation", "Integration", "Limits"]},
    {"name": "Statistics", "subject": "Mathematics", "subtopics": ["Mean", "Median", "Mode", "Probability"]},
    {"name": "Number System", "subject": "Mathematics", "subtopics": ["Integers", "Fractions", "Decimals", "Real Numbers"]},
    {"name": "Sets", "subject": "Mathematics", "subtopics": ["Union", "Intersection", "Venn Diagrams"]},
    {"name": "Sequences & Series", "subject": "Mathematics", "subtopics": ["Arithmetic", "Geometric", "Sum"]},
    {"name": "Coordinate Geometry", "subject": "Mathematics", "subtopics": ["Distance", "Midpoint", "Slope", "Equation"]},
    {"name": "Probability", "subject": "Mathematics", "subtopics": ["Events", "Outcomes", "Conditional"]},
]

# Question templates by topic and difficulty
QUESTION_TEMPLATES = {
    "Algebra": {
        "easy": [
            {
                "question_text": "Solve for x: 2x + 5 = 15",
                "option_a": "x = 3",
                "option_b": "x = 5",
                "option_c": "x = 10",
                "option_d": "x = 20",
                "correct_answer": "B",
                "subtopic": "Linear Equations"
            },
            {
                "question_text": "What is the value of x in the equation 3x - 7 = 14?",
                "option_a": "x = 5",
                "option_b": "x = 7",
                "option_c": "x = 9",
                "option_d": "x = 11",
                "correct_answer": "B",
                "subtopic": "Linear Equations"
            },
            {
                "question_text": "If x² - 5x + 6 = 0, what are the values of x?",
                "option_a": "x = 2 or x = 3",
                "option_b": "x = -2 or x = -3",
                "option_c": "x = 1 or x = 6",
                "option_d": "x = -1 or x = -6",
                "correct_answer": "A",
                "subtopic": "Quadratic Equations"
            },
            {
                "question_text": "Simplify: (x + 3)(x - 2)",
                "option_a": "x² + x - 6",
                "option_b": "x² - x - 6",
                "option_c": "x² + 5x - 6",
                "option_d": "x² - 5x + 6",
                "correct_answer": "A",
                "subtopic": "Polynomials"
            },
            {
                "question_text": "Solve the inequality: 2x + 3 > 11",
                "option_a": "x > 4",
                "option_b": "x > 5",
                "option_c": "x < 4",
                "option_d": "x < 5",
                "correct_answer": "A",
                "subtopic": "Inequalities"
            },
        ],
        "medium": [
            {
                "question_text": "If 2x² - 7x + 3 = 0, what is the sum of the roots?",
                "option_a": "3.5",
                "option_b": "1.5",
                "option_c": "7",
                "option_d": "3",
                "correct_answer": "A",
                "subtopic": "Quadratic Equations"
            },
            {
                "question_text": "Factorize: x² - 9",
                "option_a": "(x - 3)(x + 3)",
                "option_b": "(x - 9)(x + 1)",
                "option_c": "(x - 3)²",
                "option_d": "(x + 3)²",
                "correct_answer": "A",
                "subtopic": "Polynomials"
            },
            {
                "question_text": "If 3x + 2y = 12 and x - y = 1, what is the value of x?",
                "option_a": "x = 2",
                "option_b": "x = 2.8",
                "option_c": "x = 3",
                "option_d": "x = 4",
                "correct_answer": "B",
                "subtopic": "Linear Equations"
            },
        ],
        "hard": [
            {
                "question_text": "If the roots of x² - px + q = 0 are 2 and 3, what is the value of p + q?",
                "option_a": "11",
                "option_b": "7",
                "option_c": "5",
                "option_d": "13",
                "correct_answer": "A",
                "subtopic": "Quadratic Equations"
            },
            {
                "question_text": "Solve the system: x² + y² = 25 and x + y = 7",
                "option_a": "x = 3, y = 4 or x = 4, y = 3",
                "option_b": "x = 2, y = 5 or x = 5, y = 2",
                "option_c": "x = 1, y = 6 or x = 6, y = 1",
                "option_d": "No solution",
                "correct_answer": "A",
                "subtopic": "Quadratic Equations"
            },
        ]
    },
    "Geometry": {
        "easy": [
            {
                "question_text": "What is the area of a rectangle with length 8cm and width 5cm?",
                "option_a": "13 cm²",
                "option_b": "26 cm²",
                "option_c": "40 cm²",
                "option_d": "80 cm²",
                "correct_answer": "C",
                "subtopic": "Area"
            },
            {
                "question_text": "What is the perimeter of a square with side length 6cm?",
                "option_a": "12 cm",
                "option_b": "24 cm",
                "option_c": "36 cm",
                "option_d": "48 cm",
                "correct_answer": "B",
                "subtopic": "Area"
            },
            {
                "question_text": "In a triangle, if two angles are 45° and 60°, what is the third angle?",
                "option_a": "75°",
                "option_b": "90°",
                "option_c": "105°",
                "option_d": "120°",
                "correct_answer": "A",
                "subtopic": "Triangles"
            },
        ],
        "medium": [
            {
                "question_text": "What is the area of a circle with radius 7cm? (Use π = 22/7)",
                "option_a": "44 cm²",
                "option_b": "154 cm²",
                "option_c": "308 cm²",
                "option_d": "616 cm²",
                "correct_answer": "B",
                "subtopic": "Circles"
            },
            {
                "question_text": "A triangle has sides of length 5cm, 12cm, and 13cm. What type of triangle is it?",
                "option_a": "Equilateral",
                "option_b": "Isosceles",
                "option_c": "Right-angled",
                "option_d": "Scalene",
                "correct_answer": "C",
                "subtopic": "Triangles"
            },
        ],
        "hard": [
            {
                "question_text": "The volume of a cylinder is 1540 cm³. If the radius is 7cm, what is the height? (Use π = 22/7)",
                "option_a": "5 cm",
                "option_b": "10 cm",
                "option_c": "15 cm",
                "option_d": "20 cm",
                "correct_answer": "B",
                "subtopic": "Volume"
            },
        ]
    },
    "Trigonometry": {
        "easy": [
            {
                "question_text": "What is sin(30°)?",
                "option_a": "0",
                "option_b": "0.5",
                "option_c": "√3/2",
                "option_d": "1",
                "correct_answer": "B",
                "subtopic": "Sine"
            },
            {
                "question_text": "What is cos(60°)?",
                "option_a": "0",
                "option_b": "0.5",
                "option_c": "√3/2",
                "option_d": "1",
                "correct_answer": "B",
                "subtopic": "Cosine"
            },
            {
                "question_text": "What is tan(45°)?",
                "option_a": "0",
                "option_b": "1",
                "option_c": "√3",
                "option_d": "undefined",
                "correct_answer": "B",
                "subtopic": "Tangent"
            },
        ],
        "medium": [
            {
                "question_text": "If sin θ = 3/5, what is cos θ?",
                "option_a": "4/5",
                "option_b": "3/4",
                "option_c": "5/4",
                "option_d": "5/3",
                "correct_answer": "A",
                "subtopic": "Identities"
            },
        ],
        "hard": [
            {
                "question_text": "Simplify: sin²θ + cos²θ",
                "option_a": "0",
                "option_b": "1",
                "option_c": "sin(2θ)",
                "option_d": "cos(2θ)",
                "correct_answer": "B",
                "subtopic": "Identities"
            },
        ]
    },
    "Statistics": {
        "easy": [
            {
                "question_text": "What is the mean of the numbers 2, 4, 6, 8, 10?",
                "option_a": "5",
                "option_b": "6",
                "option_c": "7",
                "option_d": "8",
                "correct_answer": "B",
                "subtopic": "Mean"
            },
            {
                "question_text": "What is the median of 3, 5, 7, 9, 11?",
                "option_a": "5",
                "option_b": "7",
                "option_c": "9",
                "option_d": "11",
                "correct_answer": "B",
                "subtopic": "Median"
            },
        ],
        "medium": [
            {
                "question_text": "If a die is rolled, what is the probability of getting an even number?",
                "option_a": "1/6",
                "option_b": "1/3",
                "option_c": "1/2",
                "option_d": "2/3",
                "correct_answer": "C",
                "subtopic": "Probability"
            },
        ],
        "hard": [
            {
                "question_text": "Two dice are rolled. What is the probability of getting a sum of 7?",
                "option_a": "1/6",
                "option_b": "1/12",
                "option_c": "1/18",
                "option_d": "1/36",
                "correct_answer": "A",
                "subtopic": "Probability"
            },
        ]
    },
    "Number System": {
        "easy": [
            {
                "question_text": "What is 3/4 + 1/2?",
                "option_a": "1/4",
                "option_b": "4/6",
                "option_c": "5/4",
                "option_d": "6/4",
                "correct_answer": "C",
                "subtopic": "Fractions"
            },
            {
                "question_text": "Convert 0.75 to a fraction in simplest form",
                "option_a": "3/4",
                "option_b": "75/100",
                "option_c": "7/10",
                "option_d": "1/2",
                "correct_answer": "A",
                "subtopic": "Decimals"
            },
        ],
        "medium": [
            {
                "question_text": "What is the value of √144?",
                "option_a": "10",
                "option_b": "12",
                "option_c": "14",
                "option_d": "16",
                "correct_answer": "B",
                "subtopic": "Real Numbers"
            },
        ],
        "hard": [
            {
                "question_text": "Simplify: (2 + √3)(2 - √3)",
                "option_a": "1",
                "option_b": "4",
                "option_c": "7",
                "option_d": "4 - 2√3",
                "correct_answer": "A",
                "subtopic": "Real Numbers"
            },
        ]
    },
    "Sets": {
        "easy": [
            {
                "question_text": "If A = {1, 2, 3} and B = {3, 4, 5}, what is A ∩ B?",
                "option_a": "{1, 2, 3, 4, 5}",
                "option_b": "{3}",
                "option_c": "{1, 2}",
                "option_d": "{}",
                "correct_answer": "B",
                "subtopic": "Intersection"
            },
            {
                "question_text": "If A = {1, 2, 3} and B = {3, 4, 5}, what is A ∪ B?",
                "option_a": "{1, 2, 3, 4, 5}",
                "option_b": "{3}",
                "option_c": "{1, 2}",
                "option_d": "{}",
                "correct_answer": "A",
                "subtopic": "Union"
            },
        ],
        "medium": [
            {
                "question_text": "In a class of 30 students, 20 study Mathematics and 15 study Physics. If 10 study both, how many study neither?",
                "option_a": "5",
                "option_b": "10",
                "option_c": "15",
                "option_d": "20",
                "correct_answer": "A",
                "subtopic": "Venn Diagrams"
            },
        ],
        "hard": [
            {
                "question_text": "If U = {1, 2, 3, 4, 5, 6}, A = {1, 2, 3}, and B = {3, 4, 5}, what is (A ∪ B)'?",
                "option_a": "{6}",
                "option_b": "{1, 2, 4, 5}",
                "option_c": "{3}",
                "option_d": "{}",
                "correct_answer": "A",
                "subtopic": "Venn Diagrams"
            },
        ]
    },
    "Sequences & Series": {
        "easy": [
            {
                "question_text": "What is the next term in the sequence: 2, 5, 8, 11, ...?",
                "option_a": "13",
                "option_b": "14",
                "option_c": "15",
                "option_d": "16",
                "correct_answer": "B",
                "subtopic": "Arithmetic"
            },
            {
                "question_text": "What is the common difference in the arithmetic sequence: 3, 7, 11, 15, ...?",
                "option_a": "2",
                "option_b": "3",
                "option_c": "4",
                "option_d": "5",
                "correct_answer": "C",
                "subtopic": "Arithmetic"
            },
        ],
        "medium": [
            {
                "question_text": "What is the sum of the first 10 terms of the arithmetic sequence: 2, 5, 8, 11, ...?",
                "option_a": "155",
                "option_b": "165",
                "option_c": "175",
                "option_d": "185",
                "correct_answer": "A",
                "subtopic": "Sum"
            },
        ],
        "hard": [
            {
                "question_text": "In a geometric sequence, the first term is 2 and the common ratio is 3. What is the 5th term?",
                "option_a": "54",
                "option_b": "162",
                "option_c": "486",
                "option_d": "1458",
                "correct_answer": "B",
                "subtopic": "Geometric"
            },
        ]
    },
    "Coordinate Geometry": {
        "easy": [
            {
                "question_text": "What is the distance between points (0, 0) and (3, 4)?",
                "option_a": "5",
                "option_b": "7",
                "option_c": "12",
                "option_d": "25",
                "correct_answer": "A",
                "subtopic": "Distance"
            },
            {
                "question_text": "What is the midpoint of the line segment joining (2, 4) and (6, 8)?",
                "option_a": "(4, 6)",
                "option_b": "(3, 5)",
                "option_c": "(5, 7)",
                "option_d": "(8, 12)",
                "correct_answer": "A",
                "subtopic": "Midpoint"
            },
        ],
        "medium": [
            {
                "question_text": "What is the slope of the line passing through points (1, 2) and (4, 8)?",
                "option_a": "2",
                "option_b": "3",
                "option_c": "4",
                "option_d": "6",
                "correct_answer": "A",
                "subtopic": "Slope"
            },
        ],
        "hard": [
            {
                "question_text": "What is the equation of the line with slope 2 passing through point (1, 3)?",
                "option_a": "y = 2x + 1",
                "option_b": "y = 2x + 3",
                "option_c": "y = x + 2",
                "option_d": "y = 3x + 1",
                "correct_answer": "A",
                "subtopic": "Equation"
            },
        ]
    },
    "Calculus": {
        "easy": [
            {
                "question_text": "What is the derivative of x²?",
                "option_a": "x",
                "option_b": "2x",
                "option_c": "x²",
                "option_d": "2x²",
                "correct_answer": "B",
                "subtopic": "Differentiation"
            },
            {
                "question_text": "What is the derivative of 3x + 5?",
                "option_a": "3",
                "option_b": "3x",
                "option_c": "5",
                "option_d": "8",
                "correct_answer": "A",
                "subtopic": "Differentiation"
            },
        ],
        "medium": [
            {
                "question_text": "What is the integral of 2x?",
                "option_a": "x²",
                "option_b": "x² + C",
                "option_c": "2x²",
                "option_d": "2x² + C",
                "correct_answer": "B",
                "subtopic": "Integration"
            },
        ],
        "hard": [
            {
                "question_text": "What is lim(x→0) (sin x / x)?",
                "option_a": "0",
                "option_b": "1",
                "option_c": "∞",
                "option_d": "undefined",
                "correct_answer": "B",
                "subtopic": "Limits"
            },
        ]
    },
    "Probability": {
        "easy": [
            {
                "question_text": "A coin is tossed. What is the probability of getting heads?",
                "option_a": "0",
                "option_b": "0.25",
                "option_c": "0.5",
                "option_d": "1",
                "correct_answer": "C",
                "subtopic": "Events"
            },
        ],
        "medium": [
            {
                "question_text": "A bag contains 3 red balls and 5 blue balls. What is the probability of drawing a red ball?",
                "option_a": "3/8",
                "option_b": "5/8",
                "option_c": "3/5",
                "option_d": "5/3",
                "correct_answer": "A",
                "subtopic": "Outcomes"
            },
        ],
        "hard": [
            {
                "question_text": "Two cards are drawn from a deck of 52 cards without replacement. What is the probability that both are aces?",
                "option_a": "1/221",
                "option_b": "1/169",
                "option_c": "1/1326",
                "option_d": "4/52",
                "correct_answer": "A",
                "subtopic": "Conditional"
            },
        ]
    },
}


def generate_questions(num_questions: int = 100) -> List[Dict]:
    """Generate dummy questions for all topics."""
    questions = []
    topic_map = {}  # Map topic name to topic_id (we'll generate UUIDs)
    
    # First, create topic map (in real scenario, you'd fetch from database)
    for topic in TOPICS:
        topic_map[topic["name"]] = str(uuid.uuid4())
    
    question_count = 0
    difficulty_distribution = ["easy", "medium", "hard"]  # 50% easy, 30% medium, 20% hard
    
    # Generate questions from templates
    for topic_name, templates in QUESTION_TEMPLATES.items():
        if question_count >= num_questions:
            break
            
        topic_id = topic_map.get(topic_name, str(uuid.uuid4()))
        topic_info = next((t for t in TOPICS if t["name"] == topic_name), TOPICS[0])
        
        # Get questions from each difficulty level
        for difficulty in difficulty_distribution:
            if question_count >= num_questions:
                break
                
            if difficulty in templates:
                for template in templates[difficulty]:
                    if question_count >= num_questions:
                        break
                    
                    question = {
                        "topic_id": topic_id,
                        "topic": topic_name,
                        "subject": topic_info["subject"],
                        "question_text": template["question_text"],
                        "option_a": template["option_a"],
                        "option_b": template["option_b"],
                        "option_c": template["option_c"],
                        "option_d": template["option_d"],
                        "correct_answer": template["correct_answer"],
                        "difficulty": difficulty,
                        "subtopic": template.get("subtopic", ""),
                    }
                    questions.append(question)
                    question_count += 1
    
    # If we need more questions, generate generic ones
    while question_count < num_questions:
        topic = TOPICS[question_count % len(TOPICS)]
        topic_id = topic_map.get(topic["name"], str(uuid.uuid4()))
        difficulty = difficulty_distribution[question_count % 3]
        
        question = {
            "topic_id": topic_id,
            "topic": topic["name"],
            "subject": topic["subject"],
            "question_text": f"Sample question {question_count + 1} about {topic['name']}",
            "option_a": "Option A",
            "option_b": "Option B",
            "option_c": "Option C",
            "option_d": "Option D",
            "correct_answer": "A",
            "difficulty": difficulty,
            "subtopic": topic["subtopics"][0] if topic["subtopics"] else "",
        }
        questions.append(question)
        question_count += 1
    
    return questions


def save_to_json(questions: List[Dict], filename: str = "dummy_questions.json"):
    """Save questions to JSON file."""
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(questions, f, indent=2, ensure_ascii=False)
    print(f"✅ Saved {len(questions)} questions to {filename}")


def generate_sql_insert(questions: List[Dict], filename: str = "dummy_questions.sql"):
    """Generate SQL INSERT statements."""
    with open(filename, "w", encoding="utf-8") as f:
        f.write("-- Dummy Questions for StudyGapAI\n")
        f.write("-- Generated by generate_dummy_questions.py\n\n")
        f.write("-- Note: topic_id values are placeholders. Update them with actual topic UUIDs from your database.\n\n")
        
        for q in questions:
            # Escape single quotes in text fields
            def escape(text):
                return str(text).replace("'", "''")
            
            sql = f"""INSERT INTO questions (topic_id, topic, subject, question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty, subtopic)
VALUES (
    '{q["topic_id"]}'::uuid,
    '{escape(q["topic"])}',
    '{escape(q["subject"])}',
    '{escape(q["question_text"])}',
    '{escape(q["option_a"])}',
    '{escape(q["option_b"])}',
    '{escape(q["option_c"])}',
    '{escape(q["option_d"])}',
    '{q["correct_answer"]}',
    '{q["difficulty"]}',
    '{escape(q.get("subtopic", ""))}'
);\n"""
            f.write(sql)
    
    print(f"✅ Generated SQL file with {len(questions)} INSERT statements: {filename}")


def main():
    """Main function."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Generate dummy questions for StudyGapAI")
    parser.add_argument("-n", "--num", type=int, default=100, help="Number of questions to generate (default: 100)")
    parser.add_argument("--format", choices=["json", "sql", "both"], default="both", help="Output format (default: both)")
    parser.add_argument("--output-dir", default=".", help="Output directory (default: current directory)")
    
    args = parser.parse_args()
    
    print(f"Generating {args.num} dummy questions...")
    questions = generate_questions(args.num)
    
    if args.format in ["json", "both"]:
        save_to_json(questions, f"{args.output_dir}/dummy_questions.json")
    
    if args.format in ["sql", "both"]:
        generate_sql_insert(questions, f"{args.output_dir}/dummy_questions.sql")
    
    print(f"\n✅ Generated {len(questions)} questions successfully!")
    print(f"\n📊 Question Distribution:")
    difficulty_counts = {}
    topic_counts = {}
    for q in questions:
        difficulty_counts[q["difficulty"]] = difficulty_counts.get(q["difficulty"], 0) + 1
        topic_counts[q["topic"]] = topic_counts.get(q["topic"], 0) + 1
    
    print(f"\nBy Difficulty:")
    for diff, count in sorted(difficulty_counts.items()):
        print(f"  {diff}: {count}")
    
    print(f"\nBy Topic:")
    for topic, count in sorted(topic_counts.items()):
        print(f"  {topic}: {count}")


if __name__ == "__main__":
    main()

