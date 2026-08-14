'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface CreditScoreData {
  score: number;
  riskCategory: string;
  paymentPunctuality: number;
  leaseCompletionRatio: number;
  disputeHistoryScore: number;
  propertyDamageScore: number;
  behavioralScore: number;
  identityConfidence: number;
  tenureStability: number;
  communityEndorsements: number;
  updatedAt: string;
  explanation?: Record<string, unknown>;
}

interface ScoreEvent {
  id: string;
  type: string;
  scoreDelta: number;
  status: string;
  evidenceUrl?: string;
  tenantResponse?: string;
  createdAt: string;
}

export default function CreditScorePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [score, setScore] = useState<CreditScoreData | null>(null);
  const [events, setEvents] = useState<ScoreEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [disputeId, setDisputeId] = useState<string | null>(null);
  const [disputeText, setDisputeText] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/auth/login';
      return;
    }
    fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [scoreRes, eventsRes] = await Promise.all([
        api.get('/credit-score/me'),
        api.get('/credit-score/events/me'),
      ]);
      setScore(scoreRes.data.data);
      setEvents(eventsRes.data.data || []);
    } catch {
      setScore(null);
      setEvents([]);
    }
    setLoading(false);
  };

  const submitDispute = async (eventId: string) => {
    if (disputeText.trim().length < 10) {
      toast.error('Please provide at least 10 characters explaining your dispute');
      return;
    }
    try {
      await api.post(`/credit-score/events/${eventId}/dispute`, {
        tenantResponse: disputeText,
      });
      toast.success('Dispute submitted — an admin will review your response');
      setDisputeId(null);
      setDisputeText('');
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit dispute';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const getRiskColor = (category: string) => {
    const colors: Record<string, string> = {
      LOW: 'text-green-600',
      MODERATE: 'text-yellow-600',
      HIGH: 'text-orange-600',
      VERY_HIGH: 'text-red-600',
    };
    return colors[category] || 'text-gray-600';
  };

  const getRiskBg = (category: string) => {
    const colors: Record<string, string> = {
      LOW: 'bg-green-50 border-green-200',
      MODERATE: 'bg-yellow-50 border-yellow-200',
      HIGH: 'bg-orange-50 border-orange-200',
      VERY_HIGH: 'bg-red-50 border-red-200',
    };
    return colors[category] || 'bg-gray-50 border-gray-200';
  };

  const scoreFactors = score
    ? [
        { label: 'Payment Punctuality', value: Math.round(score.paymentPunctuality * 100), icon: '💰' },
        { label: 'Lease Completion', value: Math.round(score.leaseCompletionRatio * 100), icon: '📋' },
        { label: 'Dispute History', value: Math.round(score.disputeHistoryScore * 100), icon: '⚖️' },
        { label: 'Property Damage', value: Math.round(score.propertyDamageScore * 100), icon: '🔧' },
        { label: 'Behavioral Score', value: Math.round(score.behavioralScore * 100), icon: '🤝' },
        { label: 'Identity Confidence', value: Math.round(score.identityConfidence * 100), icon: '🪪' },
        { label: 'Tenure Stability', value: Math.round(score.tenureStability * 100), icon: '🏠' },
        { label: 'Community Endorsements', value: Math.round(score.communityEndorsements * 100), icon: '⭐' },
      ]
    : [];

  const scorePercent = score ? Math.min((score.score / 1000) * 100, 100) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10">
        <Link href="/dashboard" className="text-primary-600 text-sm font-medium hover:underline">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-2">Credit Score</h1>
        <p className="text-sm text-gray-500 mb-8">
          Every score change is tied to an immutable event. You can dispute any negative event with a written response.
        </p>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading...</div>
        ) : !score ? (
          <div className="text-center py-20 max-w-md mx-auto">
            <span className="text-5xl block mb-4">📊</span>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No Credit Score Yet</h2>
            <p className="text-sm text-gray-500">
              Your score starts at 600 when you register. Build history through on-time payments and completed leases.
            </p>
          </div>
        ) : (
          <div className="max-w-3xl space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke={
                      score.score >= 750
                        ? '#16a34a'
                        : score.score >= 600
                          ? '#ca8a04'
                          : score.score >= 400
                            ? '#ea580c'
                            : '#dc2626'
                    }
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${scorePercent * 2.64} 264`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-gray-900">{score.score}</span>
                  <span className="text-xs text-gray-400">out of 1000</span>
                </div>
              </div>
              <div
                className={`inline-block px-4 py-1.5 rounded-full border text-sm font-semibold ${getRiskBg(score.riskCategory)} ${getRiskColor(score.riskCategory)}`}
              >
                {score.riskCategory.replace('_', ' ')} Risk
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-5">Score Breakdown</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {scoreFactors.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-xl">{f.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700">{f.label}</span>
                        <span className="text-xs font-bold text-gray-900">{f.value}/100</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-600 rounded-full transition-all"
                          style={{ width: `${f.value}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Score Events</h2>
              {events.length === 0 ? (
                <p className="text-sm text-gray-500">No score events yet.</p>
              ) : (
                <ul className="space-y-4">
                  {events.map((ev) => (
                    <li key={ev.id} className="border border-gray-100 rounded-lg p-4">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {ev.type.replace(/_/g, ' ')}
                            <span
                              className={`ml-2 text-xs font-normal px-2 py-0.5 rounded-full ${
                                ev.scoreDelta >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                              }`}
                            >
                              {ev.scoreDelta >= 0 ? '+' : ''}
                              {ev.scoreDelta}
                            </span>
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(ev.createdAt).toLocaleString()} · {ev.status}
                          </p>
                          {ev.tenantResponse && (
                            <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                              Your response: {ev.tenantResponse}
                            </p>
                          )}
                        </div>
                        {ev.status === 'ACTIVE' && ev.scoreDelta < 0 && disputeId !== ev.id && (
                          <button
                            type="button"
                            onClick={() => setDisputeId(ev.id)}
                            className="text-xs text-primary-600 font-medium hover:underline shrink-0"
                          >
                            Dispute
                          </button>
                        )}
                      </div>
                      {disputeId === ev.id && (
                        <div className="mt-3 space-y-2">
                          <textarea
                            value={disputeText}
                            onChange={(e) => setDisputeText(e.target.value)}
                            placeholder="Explain why this event is incorrect (min 10 characters)..."
                            rows={3}
                            className="w-full text-sm border border-gray-200 rounded-lg p-2"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => submitDispute(ev.id)}
                              className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg"
                            >
                              Submit dispute
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDisputeId(null);
                                setDisputeText('');
                              }}
                              className="text-xs text-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
