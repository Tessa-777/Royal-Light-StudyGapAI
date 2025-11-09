import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Brain, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';

const LandingPage = () => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Master JAMB with AI-Powered Learning
              </h1>
              <p className="text-lg text-gray-600 mb-2">
                Identify your gaps, get personalized study plans, ace your exams
              </p>
              <p className="text-sm text-gray-500 mb-8">
                No account required - Try the diagnostic quiz for free
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/quiz">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto">
                    Take Diagnostic Quiz
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Login
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Students studying with technology"
                className="rounded-lg shadow-xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Features Designed for JAMB Success
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform combines AI technology with educational expertise to
              help you prepare effectively for JAMB
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <BookOpen className="text-blue-600 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Diagnostic Quiz
              </h3>
              <p className="text-gray-600">
                Take AI-powered diagnostic tests that identify your strengths
                and weaknesses across all JAMB subjects
              </p>
            </div>
            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Brain className="text-blue-600 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Personalized Analysis
              </h3>
              <p className="text-gray-600">
                Get detailed insights into your performance with topic-by-topic
                breakdown and error pattern analysis
              </p>
            </div>
            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Calendar className="text-blue-600 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Study Plans
              </h3>
              <p className="text-gray-600">
                Follow 6-week personalized learning paths designed to target
                your specific improvement areas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              How StudyGapAI Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our simple 4-step process helps you prepare effectively for JAMB
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 h-full">
                <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center mb-4 font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Take Diagnostic Quiz
                </h3>
                <p className="text-gray-600">
                  Complete a comprehensive 30-question assessment across your
                  JAMB subjects
                </p>
              </div>
              <div className="hidden lg:block absolute top-1/3 right-0 transform translate-x-1/2">
                <ArrowRight className="text-blue-300 h-8 w-8" />
              </div>
            </div>
            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 h-full">
                <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center mb-4 font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Get AI Analysis
                </h3>
                <p className="text-gray-600">
                  Receive detailed insights into your strengths and areas
                  needing improvement
                </p>
              </div>
              <div className="hidden lg:block absolute top-1/3 right-0 transform translate-x-1/2">
                <ArrowRight className="text-blue-300 h-8 w-8" />
              </div>
            </div>
            {/* Step 3 */}
            <div className="relative">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 h-full">
                <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center mb-4 font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Follow Study Plan
                </h3>
                <p className="text-gray-600">
                  Use your personalized 6-week study plan to focus on your weak
                  areas
                </p>
              </div>
              <div className="hidden lg:block absolute top-1/3 right-0 transform translate-x-1/2">
                <ArrowRight className="text-blue-300 h-8 w-8" />
              </div>
            </div>
            {/* Step 4 */}
            <div>
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 h-full">
                <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center mb-4 font-bold">
                  4
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Track Progress
                </h3>
                <p className="text-gray-600">
                  Monitor your improvement and adjust your study plan as needed
                </p>
              </div>
            </div>
          </div>
          {/* CTA */}
          <div className="mt-12 text-center">
            <Link to="/quiz">
              <Button variant="primary" size="lg">
                Start Your JAMB Prep Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See how StudyGapAI has helped students achieve their JAMB goals
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-bold">AO</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Adebayo Oluwaseun</h4>
                  <p className="text-sm text-gray-500">Lagos State</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The diagnostic test identified my weak areas in Physics and
                Chemistry. After following the study plan for 6 weeks, I
                improved my score by 78 points!"
              </p>
              <div className="mt-4 flex">
                <CheckCircle2 className="text-green-500 h-5 w-5 mr-2" />
                <span className="text-sm text-gray-500">Scored 345 in JAMB</span>
              </div>
            </div>
            {/* Testimonial 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-bold">CN</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Chioma Nwosu</h4>
                  <p className="text-sm text-gray-500">Enugu State</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "I was struggling with Mathematics but the personalized study
                plan helped me focus on the right topics. The practice questions
                were very similar to actual JAMB questions."
              </p>
              <div className="mt-4 flex">
                <CheckCircle2 className="text-green-500 h-5 w-5 mr-2" />
                <span className="text-sm text-gray-500">Scored 320 in JAMB</span>
              </div>
            </div>
            {/* Testimonial 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-bold">YI</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Yusuf Ibrahim</h4>
                  <p className="text-sm text-gray-500">Kaduna State</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "StudyGapAI helped me understand my learning patterns. The error
                distribution analysis showed I was making conceptual mistakes,
                which helped me change my study approach."
              </p>
              <div className="mt-4 flex">
                <CheckCircle2 className="text-green-500 h-5 w-5 mr-2" />
                <span className="text-sm text-gray-500">Scored 332 in JAMB</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Ready to Transform Your JAMB Preparation?
          </h2>
          <p className="text-blue-100 max-w-2xl mx-auto mb-8">
            Join thousands of students who have improved their scores with our
            AI-powered learning system
          </p>
          <Link to="/quiz">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              Take Diagnostic Quiz Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

