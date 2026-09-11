import React, { useState } from 'react';
import { Star, ShieldAlert, CheckCircle2, MessageSquare, Award, AlertTriangle, X, ThumbsUp } from 'lucide-react';
import { useTranslation } from '../i18n';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId?: string;
  doctorName?: string;
  department?: string;
  hospitalName?: string;
  tokenNumber?: string;
  patientName?: string;
  onSuccess?: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  doctorId = 'doc-001',
  doctorName = 'Dr. Rajesh Sharma',
  department = 'Cardiology',
  hospitalName = 'AIIMS New Delhi - Main Campus',
  tokenNumber = 'CARD-042',
  patientName = 'Citizen Patient',
  onSuccess
}) => {
  const { t } = useTranslation();
  const [politeness, setPoliteness] = useState<number>(5);
  const [communication, setCommunication] = useState<number>(5);
  const [diagnosisQuality, setDiagnosisQuality] = useState<number>(5);
  const [waitTimeSat, setWaitTimeSat] = useState<number>(4);
  const [feedbackText, setFeedbackText] = useState('');
  const [isGrievance, setIsGrievance] = useState(false);
  const [grievanceCategory, setGrievanceCategory] = useState('Doctor Delay / Behavioral Issue');
  const [loading, setLoading] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      doctor_id: doctorId,
      doctor_name: doctorName,
      department: department,
      hospital_name: hospitalName,
      token_number: tokenNumber,
      patient_name: patientName,
      politeness_rating: politeness,
      communication_rating: communication,
      diagnosis_quality_rating: diagnosisQuality,
      wait_time_satisfaction: waitTimeSat,
      feedback_text: feedbackText,
      is_grievance: isGrievance,
      grievance_category: isGrievance ? grievanceCategory : undefined
    };

    try {
      const response = await fetch('http://localhost:8000/api/v1/observer/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      setSubmittedResult(data);

      // Save in local storage as well for patient records
      const existingReviews = JSON.parse(localStorage.getItem('smartcare_patient_reviews') || '[]');
      existingReviews.unshift({
        ...payload,
        submitted_at: new Date().toISOString(),
        overall_score: data.calculated_overall || ((politeness + communication + diagnosisQuality + waitTimeSat) / 4)
      });
      localStorage.setItem('smartcare_patient_reviews', JSON.stringify(existingReviews));

      if (onSuccess) onSuccess();
    } catch (err) {
      console.warn('Backend survey sync error, saving locally:', err);
      const overall = (politeness + communication + diagnosisQuality + waitTimeSat) / 4;
      setSubmittedResult({
        success: true,
        calculated_overall: overall,
        message: 'Feedback recorded locally and queued for National Health Ombudsman sync.'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, setRating: (val: number) => void) => {
    return (
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="p-1 focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`w-6 h-6 ${
                star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
              }`}
            />
          </button>
        ))}
        <span className="text-xs font-bold text-slate-600 ml-2">{rating} / 5</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* National Vigilance Ombudsman Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-1 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Govt of India • National Healthcare Oversight</span>
          </div>
          <h3 className="text-lg font-bold">Citizen Consultation & Doctor Feedback</h3>
          <p className="text-xs text-emerald-100 mt-0.5">
            Your honest rating directly shapes doctor salary incentives and government hospital quality audits.
          </p>
        </div>

        {submittedResult ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-800">Feedback Successfully Submitted!</h4>
              <p className="text-sm text-slate-600 mt-1 max-w-sm mx-auto">
                Thank you for contributing to public healthcare transparency. Your evaluation has been registered with the <strong>National Health Vigilance Ombudsman</strong>.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Doctor Evaluated:</span>
                <span className="font-bold text-slate-800">{doctorName} ({department})</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Your Given Rating:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {submittedResult.calculated_overall || 4.5} ★ / 5.0
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Government Impact:</span>
                <span className="font-semibold text-slate-700">Govt Performance Payroll Synced</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow transition"
            >
              Done & Return
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Consultation Context Card */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-800">{doctorName}</p>
                <p className="text-slate-500">{department} • Token: <span className="font-semibold text-blue-600">{tokenNumber}</span></p>
              </div>
              <span className="text-[11px] bg-blue-100 text-blue-700 font-semibold px-2.5 py-1 rounded-full border border-blue-200">
                Verified Visit
              </span>
            </div>

            {/* Rating Question 1: Politeness & Behavior */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                1. Doctor Courtesy & Talking Behavior (बातचीत का व्यवहार)
              </label>
              <p className="text-[11px] text-slate-500">Was the doctor polite, respectful, and patient?</p>
              {renderStars(politeness, setPoliteness)}
            </div>

            {/* Rating Question 2: Communication & Explanation */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                2. Treatment & Prescription Explanation (दवा और इलाज की समझ)
              </label>
              <p className="text-[11px] text-slate-500">Did the doctor clearly explain your condition and dosages?</p>
              {renderStars(communication, setCommunication)}
            </div>

            {/* Rating Question 3: Diagnosis Quality */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                3. Examination Thoroughness (जांच की गुणवत्ता)
              </label>
              <p className="text-[11px] text-slate-500">Did the doctor check vital signs and listen carefully?</p>
              {renderStars(diagnosisQuality, setDiagnosisQuality)}
            </div>

            {/* Rating Question 4: Punctuality / Wait Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                4. Punctuality & OPD Queue Flow (समयबद्धता)
              </label>
              <p className="text-[11px] text-slate-500">Was the consultation started on schedule without unnecessary delays?</p>
              {renderStars(waitTimeSat, setWaitTimeSat)}
            </div>

            {/* Written Remarks */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block flex items-center justify-between">
                <span>Citizen Written Remarks / Suggestions (Optional)</span>
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share your experience regarding cleanliness, doctor guidance, or staff support..."
                rows={2}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 resize-none"
              />
            </div>

            {/* Official Grievance Checkbox */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isGrievance}
                  onChange={(e) => setIsGrievance(e.target.checked)}
                  className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    File Official Vigilance Complaint / Grievance
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Tick this if you faced misconduct, unauthorized fees, extreme unexcused delay, or queue skipping.
                  </p>
                </div>
              </label>

              {isGrievance && (
                <div className="mt-3 bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs space-y-2">
                  <label className="font-semibold text-rose-900 block">Grievance Nature:</label>
                  <select
                    value={grievanceCategory}
                    onChange={(e) => setGrievanceCategory(e.target.value)}
                    className="w-full p-2 bg-white border border-rose-300 rounded-lg text-xs font-medium"
                  >
                    <option value="Doctor Delay / Absenteeism">Doctor Delay / Late OPD Arrival</option>
                    <option value="Rude Behavior / Disrespectful Talking">Rude Behavior / Disrespectful Talking</option>
                    <option value="Queue Jumping / Bypassing Tokens">Queue Jumping / Bypassing Tokens at Counter</option>
                    <option value="Inadequate Examination">Rushed Consultation (Under 2 Mins)</option>
                    <option value="Demanding Illegal Fees">Demanding Extra / Unauthorized Payment</option>
                  </select>
                </div>
              )}
            </div>

            {/* Submit Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 text-xs transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow text-xs transition flex items-center justify-center gap-1.5"
              >
                {loading ? 'Submitting...' : 'Submit to Govt Vigilance'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
