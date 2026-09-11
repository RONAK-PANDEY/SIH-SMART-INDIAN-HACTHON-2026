import React, { useState } from 'react';
import { CheckCircle2, Star, HeartHandshake } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Feedback: React.FC = () => {
  const navigate = useNavigate();
  const [rating1, setRating1] = useState(0);
  const [rating2, setRating2] = useState(0);
  const [rating3, setRating3] = useState(0);
  
  const renderStars = (rating: number, setRating: (val: number) => void) => (
    <div className="flex justify-center gap-3">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110">
          <Star 
            className={`w-10 h-10 ${star <= rating ? 'text-yellow-400 fill-yellow-400 drop-shadow-md' : 'text-slate-200 fill-slate-50'}`}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto shadow-[0_0_40px_rgba(0,0,0,0.05)] relative justify-center p-6 font-sans">
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 animate-in zoom-in-95 duration-500 relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-400/20 rounded-full blur-3xl"></div>

        <div className="flex flex-col items-center justify-center gap-3 mb-10 mt-2 relative z-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-2 shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="font-black text-2xl text-slate-900 tracking-tight text-center leading-tight">Consultation<br/>Completed</span>
        </div>

        <div className="space-y-8 relative z-10">
          <div className="text-center bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <p className="text-slate-800 font-bold mb-4">Overall Experience</p>
            {renderStars(rating1, setRating1)}
          </div>

          <div className="text-center">
            <p className="text-slate-600 font-semibold mb-3 text-sm">Doctor Communication</p>
            {renderStars(rating2, setRating2)}
          </div>

          <div className="text-center">
            <p className="text-slate-600 font-semibold mb-3 text-sm">Waiting Experience</p>
            {renderStars(rating3, setRating3)}
          </div>

          <div className="pt-4">
            <label className="text-slate-600 font-semibold mb-3 block text-sm flex items-center gap-2">
              <HeartHandshake className="w-4 h-4" /> Additional Feedback
            </label>
            <textarea 
              placeholder="Tell us how we can improve..."
              className="w-full bg-slate-50 border-2 border-slate-200/60 text-slate-800 py-4 px-5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 min-h-[120px] resize-none transition-all placeholder:text-slate-400 font-medium"
            ></textarea>
          </div>
        </div>

        <button 
          onClick={() => navigate('/dashboard')}
          className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all text-lg shadow-xl shadow-slate-900/20 mt-10 hover:-translate-y-0.5 relative z-10"
        >
          Submit Feedback
        </button>
      </div>
    </div>
  );
};
