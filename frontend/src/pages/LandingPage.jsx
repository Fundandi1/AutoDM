import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

// Feature component
const Feature = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-start">
    <div className="p-2 bg-primary-100 rounded-lg">
      <Icon className="h-6 w-6 text-primary-600" />
    </div>
    <h3 className="mt-3 text-lg font-medium text-gray-900">{title}</h3>
    <p className="mt-2 text-base text-gray-500">{description}</p>
  </div>
);

// Testimonial component
const Testimonial = ({ quote, author, role, company, avatar }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
    <div className="px-4 py-5 sm:p-6">
      <p className="text-gray-600 italic">"{quote}"</p>
    </div>
    <div className="px-4 py-4 sm:px-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <img className="h-10 w-10 rounded-full" src={avatar} alt={author} />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900">{author}</p>
          <div className="text-sm text-gray-500">
            {role}, {company}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const LandingPage = () => {
  // Sample features data
  const features = [
    {
      icon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
        </svg>
      ),
      title: 'Automated Messaging',
      description: 'Send personalized DMs at scale with our intelligent automation system. Reach hundreds of potential clients daily.',
    },
    {
      icon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
        </svg>
      ),
      title: 'Advanced Targeting',
      description: 'Find your ideal clients with powerful filtering options based on bio, followers, posts, and more.',
    },
    {
      icon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
        </svg>
      ),
      title: 'Analytics Dashboard',
      description: 'Track your campaign performance with detailed analytics. See open rates, response rates, and ROI in real-time.',
    },
    {
      icon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        </svg>
      ),
      title: 'Smart Follow-up Sequences',
      description: 'Automatically send follow-up messages to leads who don\'t respond, maximizing your conversion rates.',
    },
    {
      icon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
      title: 'Account Safety',
      description: 'Our system respects Instagram\'s rate limits and uses proven methods to keep your accounts safe and healthy.',
    },
    {
      icon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
      title: 'Multi-Account Management',
      description: 'Manage multiple Instagram accounts from one dashboard. Perfect for agencies and power users.',
    },
  ];

  // Sample testimonials data
  const testimonials = [
    {
      quote: "AutoIGDM helped me grow my coaching business by 300% in just 3 months. The targeting is incredibly precise.",
      author: "Sarah Johnson",
      role: "Business Coach",
      company: "Growth Mindset Coaching",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      quote: "We've tried many DM automation tools, but nothing compares to AutoIGDM's reliability and conversion rates.",
      author: "Michael Chen",
      role: "Marketing Director",
      company: "TechStart Agency",
      avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      quote: "The follow-up sequences are a game-changer. We're seeing 65% higher response rates since switching to AutoIGDM.",
      author: "Emma Rodriguez",
      role: "Founder",
      company: "StyleConnect",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Grow your business with</span>
                  <span className="block text-primary-600">Instagram DM Automation</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Reach thousands of potential clients on Instagram with personalized messages. AutoIGDM helps you automate your outreach while keeping it personal and effective.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      to="/register"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                    >
                      Get started
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/pricing"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 md:py-4 md:text-lg md:px-10"
                    >
                      View pricing
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
            alt="Instagram Marketing"
          />
        </div>
      </div>

      {/* Features section */}
      <div className="py-16 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-primary-600 tracking-wide uppercase">Features</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Everything you need to scale your outreach
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Our platform combines cutting-edge automation with smart targeting to help you find and engage with your ideal clients.
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <Feature
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials section */}
      <div className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-primary-600 tracking-wide uppercase">Testimonials</h2>
            <p className="mt-1 text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight">
              Trusted by businesses worldwide
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Testimonial
                key={index}
                {...testimonial}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-primary-700">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to grow your business?</span>
            <span className="block">Start automating your Instagram DMs today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-primary-200">
            Join thousands of successful businesses using AutoIGDM to find and connect with their ideal clients on Instagram.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary-700 bg-white hover:bg-primary-50"
          >
            Sign up for free trial
            <ChevronRightIcon className="ml-2 -mr-1 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 