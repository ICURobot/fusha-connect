import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { BookOpen, Target, Headphones, PenTool, ArrowRight, Star, Users } from "lucide-react";
import { Button } from "../ui/button";
import { curriculum } from "../../entities/Curriculum";

export default function Homepage() {
  const features = [
    {
      icon: Target,
      title: "CEFR-Based Curriculum",
      description: "Structured learning path following international standards",
      color: "bg-gradient-to-br from-green-100 to-green-200"
    },
    {
      icon: Headphones,
      title: "Audio Integration",
      description: "Perfect your pronunciation with native speaker recordings",
      color: "bg-gradient-to-br from-cyan-100 to-cyan-200"
    },
    {
      icon: PenTool,
      title: "Interactive Exercises",
      description: "Practice with engaging drills and instant feedback",
      color: "bg-gradient-to-br from-amber-100 to-amber-200"
    },
    {
      icon: BookOpen,
      title: "Self-Paced Learning",
      description: "Learn at your own speed with automatic progress tracking",
      color: "bg-gradient-to-br from-gray-200 to-gray-300"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="text-center py-16 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
            Master
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"> Formal Arabic </span>
            with Confidence
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 leading-relaxed">
            Your structured path to fluent Arabic. Learn through our comprehensive CEFR-based curriculum designed to take you from post-beginner to intermediate mastery.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to={createPageUrl("Dashboard")}>
              <Button className="clay-button text-lg px-8 py-4 w-full sm:w-auto">
                Start Learning Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center space-x-2 text-gray-600">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">100% Free • No Registration Required</span>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Overview */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            Your Learning Journey
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Follow our carefully structured curriculum designed by Arabic language experts
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {curriculum.map((level, index) => (
            <div key={level.code} className="clay-card p-6 group cursor-pointer">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${level.color} flex items-center justify-center`}>
                  <span className={`font-bold text-lg ${level.textColor}`}>{level.code}</span>
              </div>
              <span className="text-sm font-medium text-gray-500">Level {index + 1}</span>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{level.title}</h3>
              <p className="text-gray-600">{level.description}</p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{level.modules.length} modules included</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="clay-card p-8 sm:p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              How Fusha Connect Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A simple, effective approach to mastering formal Arabic
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Choose Your Level",
                description: "Start with A1 or jump to your current proficiency level",
                color: "from-green-100 to-green-200"
              },
              {
                step: "2", 
                title: "Follow the Modules",
                description: "Work through structured lessons with clear objectives",
                color: "from-red-100 to-red-200"
              },
              {
                step: "3",
                title: "Practice & Progress",
                description: "Complete exercises and track your advancement automatically",
                color: "from-amber-100 to-amber-200"
              }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                  <span className="text-2xl font-bold text-gray-700">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            Why Choose Fusha Connect?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need for effective Arabic learning in one beautiful platform
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="clay-card p-6 text-center group">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center">
        <div className="clay-card p-8 sm:p-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            Ready to Begin Your Arabic Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are mastering formal Arabic with our structured, university-quality curriculum.
          </p>
          <Link to={createPageUrl("Dashboard")}>
            <Button className="clay-button text-lg px-8 py-4">
              Start Learning Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
