import { useState, useEffect } from 'react';
import api from '../utils/api';

const CUISINES = ['Indian', 'Italian', 'Japanese', 'Mexican', 'French', 'Thai', 'Mediterranean', 'American', 'Chinese', 'Korean', 'Middle Eastern', 'Spanish'];
const DIETS = ['None', 'Non-Veg', 'Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Pescatarian', 'Gluten-Free', 'Dairy-Free'];
const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Experimentalist'];
const EQUIPMENT = ['Air Fryer', 'Oven', 'Microwave', 'Slow Cooker', 'Instant Pot', 'Blender', 'Food Processor', 'Cast Iron Skillet', 'Sous-vide', 'Grill'];
const GOALS = ['Lose Weight', 'Build Muscle', 'General Health', 'Save Time', 'Learn New Skills', 'Stress Relief'];

const CulinaryBioForm = ({ onComplete, initialData }) => {
  const isEditMode = initialData?.meta?.onboardingComplete;
  const [step, setStep] = useState(isEditMode ? 0 : 1); // 0 means Full View
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialData || {
    basics: { homeCuisine: '', currentRegion: '', heritageStory: '' },
    dietary: { primaryDiet: 'None', strictness: 5, allergies: [], hatedIngredients: [] },
    flavorDNA: { spiceLevel: 3, sweetTooth: 3, saltIndex: 3, umamiFocus: 3 },
    equipment: [],
    goals: { macroTarget: 'Balanced', healthFocus: '', cookingMotivation: '' },
    meta: { skillLevel: 'Beginner', onboardingComplete: false }
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const toggleItem = (list, item, field) => {
    const current = [...formData[field]];
    const index = current.indexOf(item);
    if (index > -1) current.splice(index, 1);
    else current.push(item);
    setFormData({ ...formData, [field]: current });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedProfile = { ...formData, meta: { ...formData.meta, onboardingComplete: true } };
      await api('/user/profile', { method: 'PUT', body: { culinaryProfile: updatedProfile } });
      onComplete(updatedProfile);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (sectionId) => {
    switch(sectionId) {
      case 1: return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="space-y-1">
            <h2 className="font-poiret text-3xl text-primary uppercase tracking-widest">The Basics</h2>
            <p className="text-[10px] uppercase tracking-widest text-primary/30">Your culinary roots and current environment</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-accent font-bold">Preferred Home Cuisine</label>
              <select 
                value={formData.basics.homeCuisine}
                onChange={e => setFormData({...formData, basics: {...formData.basics, homeCuisine: e.target.value}})}
                className="w-full bg-surface border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent/40"
              >
                <option value="">Select Cuisine</option>
                {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-accent font-bold">Cooking Heritage (e.g. "My Grandma's Kitchen")</label>
              <textarea 
                value={formData.basics.heritageStory}
                onChange={e => setFormData({...formData, basics: {...formData.basics, heritageStory: e.target.value}})}
                placeholder="Share a short culinary memory..."
                rows={3}
                className="w-full bg-surface border border-primary/10 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-accent/40"
              />
            </div>
          </div>
        </div>
      );
      case 2: return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="space-y-1">
            <h2 className="font-poiret text-3xl text-primary uppercase tracking-widest">Dietary DNA</h2>
            <p className="text-[10px] uppercase tracking-widest text-primary/30">What fuel does your body need?</p>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-accent font-bold">Primary Diet</label>
                <select 
                  value={formData.dietary.primaryDiet}
                  onChange={e => setFormData({...formData, dietary: {...formData.dietary, primaryDiet: e.target.value}})}
                  className="w-full bg-surface border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent/40"
                >
                  {DIETS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-accent font-bold">Strictness ({formData.dietary.strictness}/10)</label>
                <input 
                  type="range" min="1" max="10" 
                  value={formData.dietary.strictness}
                  onChange={e => setFormData({...formData, dietary: {...formData.dietary, strictness: parseInt(e.target.value)}})}
                  className="w-full accent-accent"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-accent font-bold">Hated Ingredients (Comma separated)</label>
              <input 
                type="text"
                value={formData.dietary.hatedIngredients.join(', ')}
                onChange={e => setFormData({...formData, dietary: {...formData.dietary, hatedIngredients: e.target.value.split(',').map(s => s.trim())}})}
                className="w-full bg-surface border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent/40"
                placeholder="e.g. Cilantro, Olives, Mushrooms"
              />
            </div>
          </div>
        </div>
      );
      case 3: return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="space-y-1">
            <h2 className="font-poiret text-3xl text-primary uppercase tracking-widest">Flavor DNA</h2>
            <p className="text-[10px] uppercase tracking-widest text-primary/30">Fine-tune your personal palate</p>
          </div>
          <div className="space-y-6">
            {[
              { label: 'Spice Tolerance', key: 'spiceLevel', icons: ['🌶️', '🔥'] },
              { label: 'Sweet Tooth', key: 'sweetTooth', icons: ['🍎', '🍩'] },
              { label: 'Salt Preference', key: 'saltIndex', icons: ['💧', '🧂'] },
              { label: 'Umami Focus', key: 'umamiFocus', icons: ['🥦', '🍄'] },
            ].map(f => (
              <div key={f.key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-widest text-accent font-bold">{f.label}</label>
                  <span className="text-xs">{f.icons[0]} → {f.icons[1]}</span>
                </div>
                <input 
                  type="range" min="1" max="5" 
                  value={formData.flavorDNA[f.key]}
                  onChange={e => setFormData({...formData, flavorDNA: {...formData.flavorDNA, [f.key]: parseInt(e.target.value)}})}
                  className="w-full accent-accent"
                />
              </div>
            ))}
          </div>
        </div>
      );
      case 4: return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="space-y-1">
            <h2 className="font-poiret text-3xl text-primary uppercase tracking-widest">The Lab</h2>
            <p className="text-[10px] uppercase tracking-widest text-primary/30">What tools are at your disposal?</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {EQUIPMENT.map(item => (
              <button
                key={item}
                onClick={() => toggleItem(formData.equipment, item, 'equipment')}
                className={`px-3 py-2 rounded-xl text-[10px] uppercase tracking-widest border transition-all ${formData.equipment.includes(item) ? 'bg-accent text-background border-accent' : 'bg-surface/50 text-primary/40 border-primary/10'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      );
      case 5: return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="space-y-1">
            <h2 className="font-poiret text-3xl text-primary uppercase tracking-widest">Mastery & Goals</h2>
            <p className="text-[10px] uppercase tracking-widest text-primary/30">Your final culinary identity</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-accent font-bold">Skill Level</label>
              <div className="grid grid-cols-2 gap-2">
                {SKILL_LEVELS.map(level => (
                  <button
                    key={level}
                    onClick={() => setFormData({...formData, meta: {...formData.meta, skillLevel: level}})}
                    className={`px-3 py-2 rounded-xl text-[10px] uppercase tracking-widest border transition-all ${formData.meta.skillLevel === level ? 'bg-primary text-background border-primary' : 'bg-surface/50 text-primary/40 border-primary/10'}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-accent font-bold">What motivates you to cook?</label>
              <select 
                value={formData.goals.cookingMotivation}
                onChange={e => setFormData({...formData, goals: {...formData.goals, cookingMotivation: e.target.value}})}
                className="w-full bg-surface border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent/40"
              >
                <option value="">Select Motivation</option>
                {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className={`premium-card border-accent/20 mx-auto overflow-hidden transition-all duration-700 ${step === 0 ? 'max-w-4xl' : 'max-w-2xl'}`}>
      {/* Progress Bar (Only during onboarding) */}
      {step > 0 && (
        <div className="h-1 bg-primary/5 flex">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`flex-1 transition-all duration-500 ${i <= step ? 'bg-accent' : ''}`} />
          ))}
        </div>
      )}

      <div className="p-8 space-y-12">
        {step === 0 ? (
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-12">
              {renderSection(1)}
              {renderSection(2)}
              {renderSection(3)}
            </div>
            <div className="space-y-12">
              {renderSection(4)}
              {renderSection(5)}
              <div className="pt-8 flex flex-col gap-4">
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="btn-primary w-full py-4 text-sm bg-accent border-accent font-bold"
                >
                  {loading ? 'Redefining DNA...' : 'Save Updates ✨'}
                </button>
                <p className="text-[8px] uppercase tracking-[0.3em] text-center text-primary/20">Chef AI will adapt immediately</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {renderSection(step)}
            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t border-primary/5">
              <button 
                onClick={prevStep}
                disabled={step === 1}
                className="text-[10px] uppercase tracking-widest text-primary/40 hover:text-primary disabled:opacity-0 transition-opacity"
              >
                ← Back
              </button>
              
              {step < 5 ? (
                <button 
                  onClick={nextStep}
                  className="btn-primary text-xs px-8"
                >
                  Continue →
                </button>
              ) : (
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="btn-primary text-xs px-10 bg-accent border-accent"
                >
                  {loading ? 'Analyzing Palate...' : 'Train my AI Chef ✨'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CulinaryBioForm;
