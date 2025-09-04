import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

interface FeatureUnlockedCardProps {
  title: string;
  description: string;
  buttonLink: string;
}

export default function FeatureUnlockedCard({ title, description, buttonLink }: FeatureUnlockedCardProps) {
  return (
    <div className="clay-card p-6 mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 clay-button rounded-full flex items-center justify-center bg-gradient-to-r from-purple-100 to-pink-100">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">{description}</p>
          <Link
            to={buttonLink}
            className="clay-button px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 hover:from-purple-200 hover:to-pink-200 inline-flex items-center space-x-2 transition-all duration-200"
          >
            <span>Explore Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
