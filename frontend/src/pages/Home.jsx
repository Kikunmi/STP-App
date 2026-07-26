import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

const FEATURES = [
  { title: 'Plan Trips', desc: 'Organize destinations and dates effortlessly.', icon: 'M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
  { title: 'Build Itineraries', desc: 'Craft day-by-day plans that flow.', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { title: 'Track Expenses', desc: 'Keep every cost in check.', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2' },
  { title: 'Share & Collaborate', desc: 'Invite friends with a single link.', icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z' },
];

export default function Home() {
  return (
    <div className="min-h-screen hero-bg">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <span className="text-xl font-extrabold gradient-text">TravelPlanner</span>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">Login</Button>
          </Link>
          <Link to="/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-16 pb-20 max-w-3xl mx-auto animate-fade-up">
        <span className="badge bg-white/70 text-brand-600 shadow-soft mb-6 backdrop-blur">
          ✈️ Your all-in-one travel companion
        </span>
        <h1 className="text-5xl md:text-6xl leading-[1.1] mb-6">
          Plan smarter,{' '}
          <span className="gradient-text">travel better.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-8">
          Plan trips, manage itineraries, track expenses and share with friends —
          all in one beautifully simple place.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/register">
            <Button size="lg">Get Started — it's free</Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg">Sign in</Button>
          </Link>
        </div>
        <p className="mt-5 text-sm text-slate-400">No credit card required</p>
      </section>

      {/* Feature grid */}
      <section className="px-6 pb-24 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="card-base card-hover text-center animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900 mb-1">{f.title}</h3>
              <p className="text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
