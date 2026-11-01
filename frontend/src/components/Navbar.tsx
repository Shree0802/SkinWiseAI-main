import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Activity,
  BookOpen,
  ShoppingBag,
  Calendar,
  Menu,
  X,
  RefreshCw,
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import type { HealthStatus } from '../types';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'degraded' | 'disconnected'>('checking');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkBackendHealth = () => {
    setIsChecking(true);
    apiClient
      .checkHealth()
      .then((data) => {
        setHealth(data);
        if (data.status === 'healthy') {
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('degraded');
        }
      })
      .catch((err) => {
        console.warn('Backend health check error:', err);
        setConnectionStatus('disconnected');
        setHealth(null);
      })
      .finally(() => {
        setIsChecking(false);
      });
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  // Close mobile menu on page transition
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Skin Analysis', path: '/analyze', icon: Activity },
    { name: 'Routine Builder', path: '/routine', icon: BookOpen },
    { name: 'Smart Shop', path: '/shop', icon: ShoppingBag },
    { name: 'Skin Journal', path: '/journal', icon: Calendar },
  ];

  const getStatusBadge = () => {
    if (connectionStatus === 'checking') {
      return {
        dotClass: 'bg-stone-300 animate-pulse',
        label: 'Checking...',
        title: 'Querying /api/v1/health',
      };
    }
    if (connectionStatus === 'disconnected') {
      return {
        dotClass: 'bg-rose-500',
        label: 'Backend Disconnected',
        title: 'Unable to reach backend API. Click to retry.',
      };
    }
    if (connectionStatus === 'degraded') {
      return {
        dotClass: 'bg-amber-500',
        label: 'Backend Degraded',
        title: `Database: ${health?.database_connected ? 'Connected' : 'Disconnected'}`,
      };
    }
    // Connected
    if (health?.youcam_configured) {
      return {
        dotClass: 'bg-emerald-500',
        label: 'Backend Connected (YouCam Key Set)',
        title: `Environment: ${health.environment} | Database: Connected | Mode: ${health.service_mode || 'live_api'}`,
      };
    }
    return {
      dotClass: 'bg-amber-500',
      label: 'Backend Connected (Demo Mode)',
      title: `Environment: ${health?.environment} | Mode: Demo Fallback | Database: Connected`,
    };
  };

  const statusBadge = getStatusBadge();

  return (
    <header className="sticky top-0 z-50 bg-cream-50/95 backdrop-blur-md border-b border-cream-300/80 transition-all">
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

          {/* Desktop Navigation Links */}
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
          <div className="hidden sm:flex items-center gap-3">
            {/* Real Health Status Indicator */}
            <button
              onClick={checkBackendHealth}
              disabled={isChecking}
              title={statusBadge.title}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-white/80 border-cream-300 hover:bg-white transition-colors cursor-pointer"
            >
              <span className={`w-2 h-2 rounded-full ${statusBadge.dotClass}`} />
              <span className="text-stone-600 text-[11px] font-medium">{statusBadge.label}</span>
              <RefreshCw className={`w-3 h-3 text-stone-400 ml-0.5 ${isChecking ? 'animate-spin' : ''}`} />
            </button>

            <Link
              to="/analyze"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-lavender-600 hover:bg-lavender-700 shadow-sm shadow-lavender-600/30 hover:shadow transition-all"
            >
              <Activity className="w-4 h-4" />
              <span>Analyze Skin</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/analyze"
              className="inline-flex items-center justify-center p-2 rounded-xl text-white bg-lavender-600 hover:bg-lavender-700 shadow-sm"
              title="Analyze Skin"
            >
              <Activity className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-cream-200 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-cream-300 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-lavender-50 text-lavender-700 font-bold'
                      : 'text-stone-700 hover:bg-cream-100'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-stone-500" />}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Status Indicator */}
          <div className="pt-3 border-t border-cream-200 flex items-center justify-between">
            <button
              onClick={checkBackendHealth}
              className="inline-flex items-center gap-2 text-xs font-medium text-stone-600"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${statusBadge.dotClass}`} />
              <span>{statusBadge.label}</span>
              <RefreshCw className={`w-3 h-3 text-stone-400 ${isChecking ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
