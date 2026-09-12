'use client';

import React from 'react';
import { SimilarCase } from '../lib/types';
import { Sparkles, Clock, CheckCircle, Pill, Leaf, ShieldCheck } from 'lucide-react';

interface SimilarCasesListProps {
  cases: SimilarCase[];
  loading?: boolean;
}

export default function SimilarCasesList({ cases, loading = false }: SimilarCasesListProps) {
  if (loading) {
    return (
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="h-6 bg-slate-200 rounded-lg animate-pulse w-3/4"></div>
        <div className="h-28 bg-slate-100 rounded-xl animate-pulse"></div>
        <div className="h-28 bg-slate-100 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span>Historically Similar Cases</span>
          </h3>
          <p className="text-xs text-slate-500">
            Vector embeddings matched against 10,000+ past Indian clinical cohorts
          </p>
        </div>
        <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
          pgvector Match
        </span>
      </div>

      <div className="space-y-4">
        {cases.map((item) => (
          <div
            key={item.case_id}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-sky-300 hover:shadow-md transition-all"
          >
            {/* Header: Title & Similarity Score */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  {item.demographics} • ID: {item.case_id}
                </p>
              </div>
              <span className="px-2.5 py-1 text-xs font-extrabold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs whitespace-nowrap">
                {item.similarity_score} Match
              </span>
            </div>

            {/* Treatment Duration Pill */}
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 mb-2">
              <span className="flex items-center space-x-1 text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                <Clock className="h-3.5 w-3.5" />
                <span>Duration: {item.treatment_duration}</span>
              </span>
              {item.prakriti && (
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                  Prakriti: {item.prakriti}
                </span>
              )}
            </div>

            {/* Interventions */}
            <div className="text-xs text-slate-600 mb-2 bg-white p-2 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800 flex items-center space-x-1 mb-0.5">
                <Pill className="h-3.5 w-3.5 text-sky-600" />
                <span>Interventions:</span>
              </span>
              <p className="text-slate-600">{item.interventions}</p>
            </div>

            {/* Clinical Outcome */}
            <div className="text-xs text-slate-800 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200/80">
              <span className="font-bold text-emerald-900 flex items-center space-x-1 mb-0.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                <span>Documented Outcome:</span>
              </span>
              <p className="text-emerald-950 font-medium">{item.outcome}</p>
            </div>

            {/* AYUSH Adjuvant (if available) */}
            {item.ayush_adjuvant && (
              <div className="mt-2 text-xs text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200">
                <span className="font-bold flex items-center space-x-1 text-amber-950 mb-0.5">
                  <Leaf className="h-3.5 w-3.5 text-amber-600" />
                  <span>AYUSH Adjuvant Response:</span>
                </span>
                <p className="text-amber-900">{item.ayush_adjuvant}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
