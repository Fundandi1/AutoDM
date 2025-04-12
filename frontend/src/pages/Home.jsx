import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import the SVG logo component
import Logo from '../assets/logo.js';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-gradient-to-b from-white to-blue-50">
      {/* Hero Section - Enhanced with more powerful copy */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <div className="text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
            #1 Instagram Automation Tool
          </span>
          
          <h2 className="text-blue-600 text-xl font-medium">Tired of Manually Sending Instagram DMs?</h2>
          
          <h1 className="mt-4 text-5xl sm:text-6xl font-bold text-gray-900 leading-tight">
            Turn Your Instagram <span className="text-blue-600">Into a 24/7</span><br className="hidden md:block" /> Lead Generation Machine
          </h1>
          
          <p className="mt-6 text-xl sm:text-2xl text-gray-700 max-w-3xl mx-auto">
            AutoDM helps you automate personalized outreach to your ideal customers on Instagram—while you focus on closing deals.
          </p>
          
          <div className="mt-10">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-8 rounded-md text-lg shadow-md transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-8 rounded-md text-lg shadow-md transition-colors"
                >
                  Start Your Free Trial
                </Link>
                <Link
                  to="/login"
                  className="inline-block bg-white hover:bg-gray-100 text-blue-600 font-medium py-4 px-8 rounded-md text-lg shadow-md border border-blue-200 transition-colors"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
          
          {/* Added powerful social proof */}
          <div className="mt-10">
            <p className="text-gray-500 mb-2">Trusted by businesses worldwide</p>
            <div className="flex justify-center items-center space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white" />
              ))}
            </div>
            <p className="text-gray-600">
              <span className="font-semibold">4.7/5</span> stars from <span className="font-semibold">300+</span> reviews
            </p>
          </div>
        </div>
      </div>
      
      {/* Results Statistics Section - NEW */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">Real Results for Real Businesses</h2>
            <p className="mt-2 text-blue-100">Our users are scaling their Instagram outreach effortlessly</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl lg:text-5xl font-bold">10M+</p>
              <p className="mt-2 text-blue-100">DMs Sent</p>
            </div>
            
            <div className="text-center">
              <p className="text-4xl lg:text-5xl font-bold">38%</p>
              <p className="mt-2 text-blue-100">Average Response Rate</p>
            </div>
            
            <div className="text-center">
              <p className="text-4xl lg:text-5xl font-bold">5.2x</p>
              <p className="mt-2 text-blue-100">ROI for Users</p>
            </div>
            
            <div className="text-center">
              <p className="text-4xl lg:text-5xl font-bold">72%</p>
              <p className="mt-2 text-blue-100">Time Saved on Outreach</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Trusted By Section - Enhanced with industry names */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-700 text-lg mb-2">
            Join 10,000+ businesses that trust AutoDM
          </p>
          <p className="text-center text-blue-600 italic text-xl font-medium mb-10">
            From solopreneurs to enterprise teams in 50+ countries
          </p>
          
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5 items-center grayscale opacity-60">
            <div className="flex justify-center">
              <div className="h-8 w-32 bg-gray-200 rounded flex items-center justify-center text-gray-500 font-medium">TECH CO</div>
            </div>
            <div className="flex justify-center">
              <div className="h-8 w-32 bg-gray-200 rounded flex items-center justify-center text-gray-500 font-medium">AGENCY</div>
            </div>
            <div className="flex justify-center">
              <div className="h-8 w-32 bg-gray-200 rounded flex items-center justify-center text-gray-500 font-medium">STARTUP</div>
            </div>
            <div className="flex justify-center">
              <div className="h-8 w-32 bg-gray-200 rounded flex items-center justify-center text-gray-500 font-medium">E-COMMERCE</div>
            </div>
            <div className="flex justify-center">
              <div className="h-8 w-32 bg-gray-200 rounded flex items-center justify-center text-gray-500 font-medium">SAAS</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section - Enhanced with more compelling benefits */}
      <div className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Work Smarter, Not Harder on Instagram
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Sales teams spend just 33% of their time actually selling. AutoDM gives you those hours back.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Intelligent Lead Generation
              </h3>
              
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-lg font-medium text-gray-900">AI-Powered Target Finding</h4>
                    <p className="mt-1 text-gray-600">Automatically identify your ideal clients based on followers, bio, post frequency, and more.</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-lg font-medium text-gray-900">Advanced Lead Filtering</h4>
                    <p className="mt-1 text-gray-600">Focus only on profiles that match your ideal customer profile—filter by engagement, followers, and profile completeness.</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-lg font-medium text-gray-900">Smart Lead Prioritization</h4>
                    <p className="mt-1 text-gray-600">AutoDM ranks potential leads by engagement likelihood, helping you focus on high-value prospects first.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <img 
                src="https://via.placeholder.com/500x300?text=Lead+Generation+Dashboard" 
                alt="Lead Generation Dashboard" 
                className="rounded-md w-full"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 bg-white p-6 rounded-lg shadow-lg">
              <img 
                src="https://via.placeholder.com/500x300?text=Personalized+Messaging" 
                alt="Personalized Messaging" 
                className="rounded-md w-full"
              />
            </div>
            
            <div className="order-1 lg:order-2">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Personalized Messaging at Scale
              </h3>
              
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-lg font-medium text-gray-900">Dynamic Message Templates</h4>
                    <p className="mt-1 text-gray-600">Create templates with variables that automatically personalize for each recipient's name, interests, and profile data.</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-lg font-medium text-gray-900">Intelligent Follow-Up Sequences</h4>
                    <p className="mt-1 text-gray-600">Set up multi-step sequences that follow up automatically if prospects don't respond, with timing optimized for engagement.</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-lg font-medium text-gray-900">Human-Like Conversation Patterns</h4>
                    <p className="mt-1 text-gray-600">Random delays and natural messaging patterns ensure your outreach never appears automated or spammy.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* NEW: Testimonials Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">What Our Users Are Saying</h2>
            <p className="mt-4 text-lg text-gray-600">Real results from real businesses using AutoDM</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-200"></div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium">Sarah Johnson</h4>
                  <p className="text-sm text-gray-500">Marketing Director</p>
                </div>
              </div>
              <div className="flex text-yellow-400 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 italic">
                "AutoDM has completely transformed our Instagram outreach. We've seen a 3x increase in qualified leads coming in, and our sales team is spending way less time on manual prospecting."
              </p>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-200"></div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium">Michael Chen</h4>
                  <p className="text-sm text-gray-500">E-commerce Founder</p>
                </div>
              </div>
              <div className="flex text-yellow-400 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 italic">
                "I was skeptical about automation tools, but AutoDM feels incredibly personal. The targeting is spot-on, and we're connecting with exactly the right audience. Our conversion rate is up 42% in just two months."
              </p>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-200"></div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium">Jessica Martinez</h4>
                  <p className="text-sm text-gray-500">Agency Owner</p>
                </div>
              </div>
              <div className="flex text-yellow-400 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 italic">
                "Managing multiple client accounts used to be a nightmare. With AutoDM, we're scaling our Instagram outreach across 12 different accounts seamlessly. Best investment we've made this year."
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link
              to="/register"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-md shadow-md transition-colors"
            >
              Try It Risk-Free Today
            </Link>
          </div>
        </div>
      </div>
      
      {/* FAQ Section - Enhanced with more relevant questions */}
      <div id="faq" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-8">
            {/* FAQ Item 1 */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <button className="flex justify-between items-center w-full px-6 py-4 text-left focus:outline-none">
                <h3 className="text-lg font-medium text-gray-900">What is AutoDM and how does it work?</h3>
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="px-6 pb-4">
                <p className="text-gray-700">
                  AutoDM is an AI-powered Instagram automation platform that helps you find, target, and message potential clients automatically. It handles everything from identifying ideal prospects to sending personalized messages and follow-ups—all while maintaining a natural, human-like presence that doesn't risk your account safety.
                </p>
              </div>
            </div>
            
            {/* FAQ Item 2 */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <button className="flex justify-between items-center w-full px-6 py-4 text-left focus:outline-none">
                <h3 className="text-lg font-medium text-gray-900">Is AutoDM safe to use with my Instagram account?</h3>
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="px-6 pb-4">
                <p className="text-gray-700">
                  Absolutely. AutoDM is built with account safety as a top priority. Our system uses natural delays between actions, limits daily message volume, and mimics human behavior patterns. We stay within Instagram's limits and continuously update our approach to align with their latest guidelines.
                </p>
              </div>
            </div>
            
            {/* FAQ Item 3 */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <button className="flex justify-between items-center w-full px-6 py-4 text-left focus:outline-none">
                <h3 className="text-lg font-medium text-gray-900">How does AutoDM's pricing work?</h3>
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="px-6 pb-4">
                <p className="text-gray-700">
                  We offer flexible plans starting from just $49/month for solopreneurs, scaling to team and agency plans. All plans include our core automation features, with higher tiers adding multi-account management, advanced analytics, and team collaboration tools. We offer a 14-day free trial with no credit card required.
                </p>
              </div>
            </div>
            
            {/* FAQ Item 4 */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <button className="flex justify-between items-center w-full px-6 py-4 text-left focus:outline-none">
                <h3 className="text-lg font-medium text-gray-900">How quickly can I start getting results?</h3>
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="px-6 pb-4">
                <p className="text-gray-700">
                  Most users start seeing engagement within 24-48 hours of launching their first campaign. For lead generation and sales results, the typical timeframe is 1-2 weeks as conversations develop. Our onboarding team will help you set up optimized campaigns based on your industry and target audience to accelerate your results.
                </p>
              </div>
            </div>
            
            {/* FAQ Item 5 */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <button className="flex justify-between items-center w-full px-6 py-4 text-left focus:outline-none">
                <h3 className="text-lg font-medium text-gray-900">Can I use AutoDM with multiple Instagram accounts?</h3>
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="px-6 pb-4">
                <p className="text-gray-700">
                  Yes! Our Professional and Agency plans support multiple Instagram accounts. This is perfect for agencies managing client accounts or businesses with several brand profiles. You can manage distinct campaigns for each account from a single dashboard, with separate targeting, messaging, and analytics.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <a href="mailto:support@autodm.com" className="text-blue-600 font-medium hover:text-blue-800">
              Contact our support team →
            </a>
          </div>
        </div>
      </div>
      
      {/* NEW: Pricing Section with CTA */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Choose the plan that's right for your business. All plans include a 14-day free trial.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="border border-gray-200 rounded-lg p-8 bg-white shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-gray-900">Starter</h3>
              <p className="mt-4 text-gray-600">Perfect for solopreneurs and small businesses</p>
              <p className="mt-6 text-4xl font-bold text-gray-900">$49<span className="text-lg font-normal text-gray-500">/mo</span></p>
              
              <ul className="mt-8 space-y-4">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-600">1 Instagram account</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-600">Up to 1,000 DMs/month</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-600">Basic targeting</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-600">Standard analytics</span>
                </li>
              </ul>
              
              <div className="mt-8">
                <Link
                  to="/register?plan=starter"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-medium py-3 px-4 rounded-md shadow-sm transition-colors"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
            
            {/* Professional Plan */}
            <div className="border-2 border-blue-500 rounded-lg p-8 bg-white shadow-md relative">
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-medium rounded-bl-lg rounded-tr-lg">
                MOST POPULAR
              </div>
              <h3 className="text-xl font-bold text-gray-900">Professional</h3>
              <p className="mt-4 text-gray-600">For growing businesses and marketers</p>
              <p className="mt-6 text-4xl font-bold text-gray-900">$99<span className="text-lg font-normal text-gray-500">/mo</span></p>
              
              <ul className="mt-8 space-y-4">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-600">3 Instagram accounts</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-600">Up to 5,000 DMs/month</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-600">Advanced AI targeting</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-600">Full analytics suite</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-600">Priority support</span>
                </li>
              </ul>
              
              <div className="mt-8">
                <Link
                  to="/register?plan=professional"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-medium py-3 px-4 rounded-md shadow-sm transition-colors"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
            
            {/* Agency Plan */}
            <div className="border border-gray-200 rounded-lg p-8 bg-white shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-gray-900">Agency</h3>
              <p className="mt-4 text-gray-600">For agencies and larger teams</p>
              <p className="mt-6 text-4xl font-bold text-gray-900">$249<span className="text-lg font-normal text-gray-500">/mo</span></p>
              
              <ul className="mt-8 space-y-4">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-600">10 Instagram accounts</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-600">Unlimited DMs</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-600">AI-powered messaging</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-600">Team collaboration tools</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-600">White label reports</span>
                </li>
              </ul>
              
              <div className="mt-8">
                <Link
                  to="/register?plan=agency"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-medium py-3 px-4 rounded-md shadow-sm transition-colors"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-600">
              All plans include a 14-day free trial. No credit card required.
            </p>
          </div>
        </div>
      </div>
      
      {/* Final CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Instagram Strategy?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of businesses automating their Instagram outreach and growing their customer base on autopilot.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-block bg-white hover:bg-gray-100 text-blue-600 font-medium py-3 px-8 rounded-md text-lg shadow-md transition-colors"
            >
              Start Your Free Trial
            </Link>
            <Link
              to="/demo"
              className="inline-block bg-transparent hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-md text-lg border border-white shadow-md transition-colors"
            >
              Schedule a Demo
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer - Enhanced with more information */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center mb-4">
                <Logo className="h-8 w-8" fill="#ffffff" />
                <span className="ml-2 text-xl font-bold">AutoDM</span>
              </div>
              <p className="text-gray-400 mb-4">
                The AI-powered Instagram automation tool that helps you generate leads and grow your business.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/features" className="text-gray-400 hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-gray-400 hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/roadmap" className="text-gray-400 hover:text-white transition-colors">
                    Roadmap
                  </Link>
                </li>
                <li>
                  <Link to="/integrations" className="text-gray-400 hover:text-white transition-colors">
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/blog" className="text-gray-400 hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/guides" className="text-gray-400 hover:text-white transition-colors">
                    Guides
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="text-gray-400 hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/api" className="text-gray-400 hover:text-white transition-colors">
                    API Documentation
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="text-gray-400 hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@autodm.com" className="text-gray-400 hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <Link to="/legal/privacy" className="text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/legal/terms" className="text-gray-400 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© {new Date().getFullYear()} AutoDM. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 