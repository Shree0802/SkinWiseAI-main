import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Activity, BookOpen, ShoppingBag, Calendar } from 'lucide-react';
import { apiClient } from '../services/apiClient';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [youcamConfigured, setYoucamConfigured] = useState<boolean>(false);

  useEffect(() => {
    apiClient.checkHealth()
      .then((health) => {
        setApiOnline(health.status === 'healthy' || health.status === 'degraded');
        setYoucamConfigured(health.youcam_configured);
      })
      .catch(() => {
        setApiOnline(false);
      });
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Skin Analysis', path: '/analyze', icon: Activity },
    { name: 'Routine Builder', path: '/routine', icon: BookOpen },
    { name: 'Smart Shop', path: '/shop', icon: ShoppingBag },
    { name: 'Skin Journal', path: '/journal', icon: Calendar },
  ];

  return (
    <header className="sticky top-0 z-50 bg-cream-50/90 backdrop-blur-md border-b border-cream-300/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-lavender-600 to-lavender-400 flex items-center justify-center text-white shadow-sm shadow-lavender-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-stone-900 group-hover:text-lavender-600 transition-colors">
                SkinWise <span className="text-lavender-600">AI</span>
              </span>
              <span className="text-[10px] text-stone-500 font-medium -mt-1 tracking-wider uppercase">
                Skin Decision Assistant
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-cream-200/60 p-1 rounded-xl border border-cream-300/60">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action & API Status Badge */}
          <div className="flex items-center gap-3">
            {/* Status indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-white/70 border-cream-300">
              <span
                className={`w-2 h-2 rounded-full ${
                  apiOnline === true
                    ? youcamConfigured
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-amber-500'
                    : apiOnline === false
                    ? 'bg-rose-500'
                    : 'bg-stone-300'
                }`}
              />
              <span className="text-stone-600 text-[11px]">
                {apiOnline === true
                  ? youcamConfigured
                    ? 'YouCam Live'
                    : 'Demo / Offline Ready'
                  : apiOnline === false
                  ? 'Backend Disconnected'
                  : 'Checking...'}
              </span>
            </div>

            <Link
              to="/analyze"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-lavender-600 hover:bg-lavender-700 shadow-sm shadow-lavender-600/30 hover:shadow transition-all"
            >
              <Activity className="w-4 h-4" />
              <span>Analyze Skin</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
