"""Manual API testing script - Use this to test your running Flask server."""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_health():
    """Test health endpoint"""
    print("🔍 Testing /health...")
    r = requests.get(f"{BASE_URL}/health")
    print(f"Status: {r.status_code}")
    print(f"Response: {json.dumps(r.json(), indent=2)}\n")
    return r.status_code == 200

def test_user_flow():
    """Test user registration and login"""
    print("🔍 Testing User Registration...")
    reg = requests.post(
        f"{BASE_URL}/api/users/register",
        json={"email": "test@example.com", "name": "Test User", "phone": "1234567890"}
    )
    print(f"Registration Status: {reg.status_code}")
    user = reg.json()
    print(f"User: {json.dumps(user, indent=2)}\n")
    
    if reg.status_code != 201:
        return False
    
    user_id = user["id"]
    
    print("🔍 Testing User Login...")
    login = requests.post(
        f"{BASE_URL}/api/users/login",
        json={"email": "test@example.com"}
    )
    print(f"Login Status: {login.status_code}")
    print(f"Response: {json.dumps(login.json(), indent=2)}\n")
    
    print("🔍 Testing Get User...")
    get_user = requests.get(f"{BASE_URL}/api/users/{user_id}")
    print(f"Get User Status: {get_user.status_code}")
    print(f"User: {json.dumps(get_user.json(), indent=2)}\n")
    
    print("🔍 Testing Update Target Score...")
    update = requests.put(
        f"{BASE_URL}/api/users/{user_id}/target-score",
        json={"targetScore": 250}
    )
    print(f"Update Status: {update.status_code}")
    print(f"Updated User: {json.dumps(update.json(), indent=2)}\n")
    
    return user_id

def test_quiz_flow(user_id):
    """Test complete quiz flow"""
    print("🔍 Testing Get Questions...")
    questions = requests.get(f"{BASE_URL}/api/questions?total=5")
    print(f"Questions Status: {questions.status_code}")
    q_data = questions.json()
    print(f"Got {len(q_data)} questions\n")
    
    if questions.status_code != 200 or len(q_data) == 0:
        return None
    
    print("🔍 Testing Start Quiz...")
    start = requests.post(
        f"{BASE_URL}/api/quiz/start",
        json={"userId": user_id, "totalQuestions": 5}
    )
    print(f"Start Quiz Status: {start.status_code}")
    quiz = start.json()
    print(f"Quiz: {json.dumps(quiz, indent=2)}\n")
    
    quiz_id = quiz["id"]
    
    print("🔍 Testing Submit Quiz...")
    responses = []
    for i, q in enumerate(q_data[:5]):
        responses.append({
            "questionId": q["id"],
            "studentAnswer": q["correct_answer"],  # Answer correctly
            "correctAnswer": q["correct_answer"],
            "isCorrect": True,
            "explanationText": "",
            "timeSpentSeconds": 10
        })
    
    submit = requests.post(
        f"{BASE_URL}/api/quiz/{quiz_id}/submit",
        json={"responses": responses}
    )
    print(f"Submit Status: {submit.status_code}")
    print(f"Response: {json.dumps(submit.json(), indent=2)}\n")
    
    print("🔍 Testing Get Quiz Results...")
    results = requests.get(f"{BASE_URL}/api/quiz/{quiz_id}/results")
    print(f"Results Status: {results.status_code}")
    print(f"Results: {json.dumps(results.json(), indent=2)}\n")
    
    return quiz_id

def test_ai_endpoints(user_id, quiz_id):
    """Test AI endpoints"""
    print("🔍 Testing AI Analyze Diagnostic...")
    analyze = requests.post(
        f"{BASE_URL}/api/ai/analyze-diagnostic",
        json={
            "userId": user_id,
            "quizId": quiz_id,
            "responses": [
                {
                    "questionId": "q1",
                    "studentAnswer": "B",
                    "correctAnswer": "C",
                    "isCorrect": False,
                    "explanationText": "I thought B was correct"
                }
            ]
        }
    )
    print(f"Analyze Status: {analyze.status_code}")
    analysis = analyze.json()
    print(f"Analysis: {json.dumps(analysis, indent=2)}\n")
    
    if analyze.status_code != 200:
        return
    
    diagnostic_id = analysis.get("id")
    weak_topics = analysis.get("analysis", {}).get("weakTopics", [])
    
    print("🔍 Testing AI Generate Study Plan...")
    plan = requests.post(
        f"{BASE_URL}/api/ai/generate-study-plan",
        json={
            "userId": user_id,
            "diagnosticId": diagnostic_id or "diag-1",
            "weakTopics": weak_topics,
            "targetScore": 250,
            "currentScore": 165
        }
    )
    print(f"Study Plan Status: {plan.status_code}")
    print(f"Study Plan: {json.dumps(plan.json(), indent=2)}\n")
    
    print("🔍 Testing AI Explain Answer...")
    explain = requests.post(
        f"{BASE_URL}/api/ai/explain-answer",
        json={
            "questionId": "q1",
            "studentAnswer": "B",
            "correctAnswer": "C",
            "studentReasoning": "I thought B was correct because..."
        }
    )
    print(f"Explain Status: {explain.status_code}")
    print(f"Explanation: {json.dumps(explain.json(), indent=2)}\n")

def test_progress_and_analytics(user_id):
    """Test progress and analytics endpoints"""
    print("🔍 Testing Mark Progress Complete...")
    progress = requests.post(
        f"{BASE_URL}/api/progress/mark-complete",
        json={
            "userId": user_id,
            "topicId": "topic-1",
            "status": "completed",
            "resourcesViewed": 5,
            "practiceProblemsCompleted": 10
        }
    )
    print(f"Progress Status: {progress.status_code}")
    print(f"Progress: {json.dumps(progress.json(), indent=2)}\n")
    
    print("🔍 Testing Get User Progress...")
    get_progress = requests.get(f"{BASE_URL}/api/users/{user_id}/progress")
    print(f"Get Progress Status: {get_progress.status_code}")
    print(f"Progress: {json.dumps(get_progress.json(), indent=2)}\n")
    
    print("🔍 Testing Analytics Dashboard...")
    analytics = requests.get(f"{BASE_URL}/api/analytics/dashboard")
    print(f"Analytics Status: {analytics.status_code}")
    print(f"Analytics: {json.dumps(analytics.json(), indent=2)}\n")

def main():
    print("=" * 60)
    print("StudyGapAI Backend API Testing")
    print("=" * 60)
    print(f"Testing server at: {BASE_URL}\n")
    
    # Test health
    if not test_health():
        print("❌ Health check failed. Is the server running?")
        return
    
    # Test user flow
    user_id = test_user_flow()
    if not user_id:
        print("❌ User flow failed")
        return
    
    # Test quiz flow
    quiz_id = test_quiz_flow(user_id)
    if not quiz_id:
        print("❌ Quiz flow failed")
        return
    
    # Test AI endpoints
    test_ai_endpoints(user_id, quiz_id)
    
    # Test progress and analytics
    test_progress_and_analytics(user_id)
    
    print("=" * 60)
    print("✅ Testing complete!")
    print("=" * 60)

if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed. Make sure Flask server is running on http://localhost:5000")
    except Exception as e:
        print(f"❌ Error: {e}")

