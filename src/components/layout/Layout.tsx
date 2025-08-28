import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { Home, BookOpen, Menu, X, MessageSquare, Heart } from "lucide-react";
import { Button } from "../ui/button";

export default function Layout({ children }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navigation = [
    { name: "Home", url: "/", icon: Home },
    { name: "Dashboard", url: createPageUrl("Dashboard"), icon: BookOpen },
    { name: "Feedback", url: "/feedback", icon: MessageSquare },
  ];

  const isActive = (url) => location.pathname === url;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <style>{`
        :root {
          /* Saudi Green, Egypt Gold */
          --clay-shadow: 0 8px 32px rgba(4, 120, 87, 0.1), 
                        0 4px 16px rgba(4, 120, 87, 0.08),
                        inset 0 2px 4px rgba(255, 255, 255, 0.8);
          --clay-shadow-hover: 0 12px 40px rgba(4, 120, 87, 0.15), 
                              0 6px 20px rgba(4, 120, 87, 0.1),
                              inset 0 2px 4px rgba(255, 255, 255, 0.9);
          --clay-inset: inset 0 4px 8px rgba(4, 120, 87, 0.1),
                        inset 0 -2px 4px rgba(255, 255, 255, 0.8);
        }
        
        .clay-element {
          background: linear-gradient(135deg, #E6FFFA 0%, #FFF5E1 50%, #D4F8E8 100%);
          border-radius: 20px;
          box-shadow: var(--clay-shadow);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px solid rgba(255, 255, 255, 0.3);
        }
        
        .clay-element:hover {
          box-shadow: var(--clay-shadow-hover);
          transform: translateY(-2px);
        }
        
        .clay-button {
          background: linear-gradient(135deg, #FFF5E1 0%, #D4F8E8 100%);
          border-radius: 16px;
          box-shadow: var(--clay-shadow);
          transition: all 0.2s ease;
          border: none;
          color: #047857; /* Dark Green */
          font-weight: 600;
        }
        
        .clay-button:hover {
          box-shadow: var(--clay-shadow-hover);
          transform: translateY(-1px);
          background: linear-gradient(135deg, #FFF9E9 0%, #C6F6D5 100%);
        }
        
        .clay-button:active {
          transform: translateY(1px);
          box-shadow: var(--clay-inset);
        }
        
        .clay-card {
          background: linear-gradient(145deg, rgba(255,255,255,0.7), rgba(255,255,255,0.3));
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          background-color: #FEFBF6;
          border-radius: 20px;
          box-shadow: var(--clay-shadow);
          border: 3px solid rgba(255, 255, 255, 0.4);
          transition: all 0.3s ease;
        }
        
        .clay-card:hover {
          box-shadow: var(--clay-shadow-hover);
          transform: translateY(-3px);
        }
        
        body {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
      `}</style>

      {/* Header */}
      <header className="clay-element sticky top-4 z-50 mx-4 mt-4 mb-8">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 clay-button rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-purple-700">ف</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Fusha Connect</h1>
                <p className="text-sm text-gray-600 hidden sm:block">Your structured path to fluent Arabic</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.url}
                  className={`clay-button px-6 py-2 flex items-center space-x-2 ${
                    isActive(item.url) ? 'clay-active' : ''
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
              
              {/* Donation CTA */}
              <a
                href="https://buymeacoffee.com/fushaconnect"
                target="_blank"
                rel="noopener noreferrer"
                className="clay-button px-4 py-2 flex items-center space-x-2 bg-gradient-to-r from-pink-100 to-rose-100 hover:from-pink-200 hover:to-rose-200 text-rose-700 border-rose-200 hover:border-rose-300 transition-all duration-200"
              >
                <Heart className="w-4 h-4 fill-current" />
                <span className="font-semibold">Support Us</span>
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <Button
              className="clay-button md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <nav className="md:hidden mt-4 pt-4 border-t border-white/30">
              <div className="flex flex-col space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.url}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`clay-button px-4 py-3 flex items-center space-x-3 ${
                      isActive(item.url) ? 'clay-active' : ''
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
                
                {/* Mobile Donation CTA */}
                <a
                  href="https://buymeacoffee.com/fushaconnect"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="clay-button px-4 py-3 flex items-center space-x-3 bg-gradient-to-r from-pink-100 to-rose-100 hover:from-pink-200 hover:to-rose-200 text-rose-700 border-rose-200 hover:border-rose-300 transition-all duration-200"
                >
                  <Heart className="w-4 h-4 fill-current" />
                  <span className="font-semibold">Support Us</span>
                </a>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen pb-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="clay-element mx-4 mb-4 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 mb-4">
              <Link to="/" className="text-gray-600 hover:text-gray-800 transition-colors">
                Home
              </Link>
              <Link to={createPageUrl("Dashboard")} className="text-gray-600 hover:text-gray-800 transition-colors">
                Dashboard
              </Link>
              <Link to="/feedback" className="text-gray-600 hover:text-gray-800 transition-colors">
                Contact & Feedback
              </Link>
              <a
                href="https://buymeacoffee.com/fushaconnect"
                target="_blank"
                rel="noopener noreferrer"
                className="text-rose-600 hover:text-rose-700 transition-colors flex items-center space-x-1"
              >
                <Heart className="w-3 h-3 fill-current" />
                <span>Support Us</span>
              </a>
            </div>
            <p className="text-gray-600 mb-2">© 2024 Fusha Connect. Made with ❤️ for Arabic learners.</p>
            <p className="text-sm text-gray-500">Free, structured, and effective Arabic learning.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
