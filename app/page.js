'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import Navbar from '@/components/Navbar';

const CATEGORIES = [
  { icon: '🚗', name: 'Motor Vehicle & Accident', desc: 'Road accidents, hit-and-run, DUI, insurance claims' },
  { icon: '🏠', name: 'Property & Real Estate', desc: 'Tenant disputes, land grab, inheritance, eviction' },
  { icon: '👨‍👩‍👧', name: 'Family & Matrimonial', desc: 'Divorce, custody, maintenance, domestic violence' },
  { icon: '🛒', name: 'Consumer Protection', desc: 'Product defects, service fraud, overcharging' },
  { icon: '💼', name: 'Employment & Labor', desc: 'Wrongful termination, harassment, wage disputes' },
  { icon: '🏢', name: 'Corporate & Commercial', desc: 'Contract breach, IP, partnership disputes' },
  { icon: '💻', name: 'Cybercrime & Digital', desc: 'Online fraud, data theft, cyberstalking' },
  { icon: '⚖️', name: 'Criminal Law', desc: 'Theft, assault, cheating, bail applications' },
];

function LandingContent() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="hero">
        <h1>
          Navigate Any Legal Situation<br />
          <span className="gradient">with AI-Powered Confidence</span>
        </h1>
        <p>
          From first incident to final resolution — JurisNode guides you through legal procedures,
          connects you with the right lawyers, and ensures zero information loss.
        </p>
        <div className="hero-actions">
          <Link href="/register" className="btn btn-lg btn-primary">Get Started Free</Link>
          <Link href="/login" className="btn btn-lg btn-outline">Sign In</Link>
        </div>
      </section>

      {/* How it works */}
      <section className="container" style={{ padding: '60px 20px' }}>
        <div className="section-header">
          <h2>How JurisNode Works</h2>
          <p>Your AI-powered legal journey in 4 simple steps</p>
        </div>
        <div className="steps">
          <div className="step-card fade-in">
            <div className="step-num">1</div>
            <h3>Describe Your Situation</h3>
            <p>Tell our AI what happened. It classifies your issue and creates a structured case file.</p>
          </div>
          <div className="step-card fade-in">
            <div className="step-num">2</div>
            <h3>Get Immediate Guidance</h3>
            <p>AI provides step-by-step procedures, document checklists, and urgency alerts.</p>
          </div>
          <div className="step-card fade-in">
            <div className="step-num">3</div>
            <h3>Connect with Lawyers</h3>
            <p>Find verified lawyers by location and specialization. Local or primary — your choice.</p>
          </div>
          <div className="step-card fade-in">
            <div className="step-num">4</div>
            <h3>Seamless Continuity</h3>
            <p>Every action logged. Every document stored. Any new lawyer gets full context instantly.</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container" style={{ padding: '40px 20px 60px' }}>
        <div className="section-header">
          <h2>Legal Categories We Cover</h2>
          <p>Whatever your legal situation, we have a path forward</p>
        </div>
        <div className="grid grid-4">
          {CATEGORIES.map((cat, i) => (
            <Link href="/register" key={i} className="cat-card fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <span className="cat-icon">{cat.icon}</span>
              <div className="cat-name">{cat.name}</div>
              <div className="cat-desc">{cat.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Core Innovation */}
      <section className="container" style={{ padding: '40px 20px 60px' }}>
        <div className="section-header">
          <h2>Why JurisNode is Different</h2>
          <p>The legal continuity engine that doesn&apos;t exist anywhere else</p>
        </div>
        <div className="grid grid-2">
          <div className="card">
            <h3 style={{ marginBottom: 12, color: 'var(--accent)' }}>📁 Case File as Single Source of Truth</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Timeline view, document storage, lawyer notes, AI summaries — all in one place.
              No scattered WhatsApp messages or lost emails.
            </p>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: 12, color: 'var(--accent)' }}>🤖 AI That Keeps Working</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Not just a one-time chatbot. AI continues analyzing documents, tracking deadlines,
              and suggesting next steps throughout your case.
            </p>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: 12, color: 'var(--accent)' }}>🔄 Zero-Loss Lawyer Handoff</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              When your case moves from local to primary lawyer, everything transfers.
              No repeated explanations. No lost documents.
            </p>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: 12, color: 'var(--accent)' }}>📄 Document Intelligence</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Upload a legal notice — AI explains it in plain language, extracts deadlines,
              and suggests next steps.
            </p>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="container" style={{ padding: '20px 20px 40px' }}>
        <div className="disclaimer" style={{ textAlign: 'center' }}>
          <strong>⚠️ Legal Disclaimer:</strong> JurisNode provides legal information and procedural navigation only.
          It does not constitute legal advice or legal representation. Always consult a qualified lawyer for specific legal guidance.
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>⚖️ JurisNode — AI-Powered Legal Navigation Platform</p>
          <p style={{ marginTop: 6 }}>Built for access to justice. Not a substitute for legal advice.</p>
        </div>
      </footer>
    </>
  );
}

export default function HomePage() {
  return <LandingContent />;
}
