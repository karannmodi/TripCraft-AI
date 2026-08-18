import React, { useState, useEffect } from 'react';
import { Trip, ItineraryDay, ItineraryActivity, ItineraryActivityUpdateInput } from '../../types/trip';
import { fetchItinerary, generateItinerary, updateActivity, deleteActivity } from '../../api/client';
import { ActivityEditModal } from './ActivityEditModal';

interface ItineraryViewProps {
  trip: Trip;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({ trip }) => {
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState<boolean>(false);
  const [editingActivity, setEditingActivity] = useState<ItineraryActivity | null>(null);

  const loadItinerary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchItinerary(trip.id);
      setItinerary(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load itinerary.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItinerary();
  }, [trip.id]);

  const handleGenerateClick = () => {
    if (itinerary.length > 0) {
      setShowOverwriteConfirm(true);
    } else {
      runGeneration(false);
    }
  };

  const runGeneration = async (overwrite: boolean) => {
    setShowOverwriteConfirm(false);
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateItinerary(trip.id, overwrite);
      setItinerary(result);
    } catch (err: any) {
      setError(err.message || 'Itinerary generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditSave = async (activityId: string, updatedFields: ItineraryActivityUpdateInput) => {
    try {
      const updated = await updateActivity(trip.id, activityId, updatedFields);
      setItinerary((prev) =>
        prev.map((day) => ({
          ...day,
          activities: day.activities.map((act) => (act.id === activityId ? updated : act)),
        }))
      );
    } catch (err: any) {
      alert(`Failed to save activity update: ${err.message}`);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) return;
    try {
      await deleteActivity(trip.id, activityId);
      setItinerary((prev) =>
        prev.map((day) => ({
          ...day,
          activities: day.activities.filter((act) => act.id !== activityId),
        }))
      );
    } catch (err: any) {
      alert(`Failed to delete activity: ${err.message}`);
    }
  };

  const formatCost = (cost?: string | number | null) => {
    if (cost == null || cost === '') return '$0.00';
    const num = typeof cost === 'number' ? cost : parseFloat(cost);
    return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl backdrop-blur-md">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Trip Itinerary</h3>
          <p className="text-sm text-slate-400">
            {trip.destination} • {trip.start_date} to {trip.end_date}
          </p>
        </div>

        <button
          onClick={handleGenerateClick}
          disabled={isGenerating}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-900/30 transition disabled:opacity-60"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Generating AI Itinerary...
            </>
          ) : (
            <>
              <span>✨</span>
              <span>{itinerary.length > 0 ? 'Regenerate AI Itinerary' : 'Generate AI Itinerary'}</span>
            </>
          )}
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-950/80 border border-red-800 rounded-2xl text-red-200 text-sm flex items-start justify-between gap-3">
          <div>
            <strong className="font-semibold block mb-1">Service Error</strong>
            {error}
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200">
            ✕
          </button>
        </div>
      )}

      {/* Overwrite Confirmation Dialog */}
      {showOverwriteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 max-w-md w-full shadow-2xl text-slate-100">
            <h4 className="text-lg font-semibold text-amber-400 mb-2">Overwrite Existing Itinerary?</h4>
            <p className="text-sm text-slate-300 mb-6">
              Regenerating will replace all existing days and activities in PostgreSQL with a newly generated AI itinerary.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowOverwriteConfirm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={() => runGeneration(true)}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl shadow-lg transition"
              >
                Confirm Overwrite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Loading itinerary...</div>
      ) : itinerary.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl p-8 bg-slate-900/40">
          <div className="text-4xl mb-3">🗓️</div>
          <h4 className="text-slate-200 font-medium mb-1">No Itinerary Generated Yet</h4>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            Click 'Generate AI Itinerary' above to create a day-by-day plan tailored to your budget and preferences using local Ollama AI.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {itinerary.map((day) => (
            <div
              key={day.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-md"
            >
              <div className="bg-slate-800/80 px-5 py-3.5 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-slate-100">
                    Day {day.day_number}: {day.title}
                  </h4>
                  <span className="text-xs text-indigo-400">{day.date}</span>
                </div>
                <span className="text-xs text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-700/50">
                  {day.activities.length} activities
                </span>
              </div>

              <div className="p-5 space-y-4">
                {day.notes && (
                  <p className="text-xs italic text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                    {day.notes}
                  </p>
                )}

                {day.activities.length === 0 ? (
                  <p className="text-sm text-slate-500 py-2 italic">No activities planned for this day.</p>
                ) : (
                  <div className="space-y-3">
                    {day.activities.map((act) => (
                      <div
                        key={act.id}
                        className="bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                              {act.time_slot}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                              {act.category}
                            </span>
                            <h5 className="font-medium text-slate-100">{act.title}</h5>
                          </div>

                          {act.description && (
                            <p className="text-sm text-slate-400">{act.description}</p>
                          )}

                          {act.location && (
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <span>📍</span> {act.location}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-4 self-end sm:self-center">
                          <span className="font-mono text-sm text-emerald-400 font-semibold bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                            {formatCost(act.estimated_cost)}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingActivity(act)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition"
                              title="Edit activity"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteActivity(act.id)}
                              className="px-2.5 py-1 bg-red-950/80 hover:bg-red-900 text-red-300 text-xs font-medium rounded-lg transition"
                              title="Delete activity"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Activity Modal */}
      {editingActivity && (
        <ActivityEditModal
          activity={editingActivity}
          isOpen={!!editingActivity}
          onClose={() => setEditingActivity(null)}
          onSave={(fields) => handleEditSave(editingActivity.id, fields)}
        />
      )}
    </div>
  );
};
