import { useState, useEffect } from 'react';

const IngredientSelector = ({ onChange, initialTags = [] }) => {
  const [input, setInput] = useState('');
  const [tags, setTags] = useState(initialTags);

  useEffect(() => {
    setTags(initialTags);
  }, [initialTags]);

  const addTag = (tag) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      const newTags = [...tags, trimmed];
      setTags(newTags);
      onChange(newTags);
    }
    setInput('');
  };

  const removeTag = (tagToRemove) => {
    const newTags = tags.filter(t => t !== tagToRemove);
    setTags(newTags);
    onChange(newTags);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const items = paste.split(/[,\n]/);
    let newTags = [...tags];
    items.forEach(item => {
      const trimmed = item.trim().toLowerCase();
      if (trimmed && !newTags.includes(trimmed)) {
        newTags.push(trimmed);
      }
    });
    setTags(newTags);
    onChange(newTags);
  };

  return (
    <div className="premium-card !p-4 border border-primary/5">
      <div className="flex flex-wrap gap-2 items-center">
        {tags.map((tag, i) => (
          <span 
            key={i} 
            className="bg-primary/5 border border-primary/10 text-primary text-[10px] uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-2"
          >
            {tag}
            <button onClick={() => removeTag(tag)} className="hover:text-accent">&times;</button>
          </span>
        ))}
        <input
          type="text"
          className="bg-transparent outline-none text-sm flex-1 min-w-[150px] py-1"
          placeholder={tags.length === 0 ? "Type ingredients (onion, chicken...)" : "Add more..."}
          value={input}
          onChange={(e) => {
            const val = e.target.value;
            setInput(val);
            // Proactive update for the parent if it's the only input
            if (val.endsWith(',') || val.endsWith(' ')) {
              addTag(val.replace(/[ ,]+$/, ''));
            }
          }}
          onBlur={() => addTag(input)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />
      </div>
      <p className="text-[9px] uppercase tracking-[0.2em] text-accent/30 mt-3 ml-1">PRESS ENTER OR COMMA TO ADD</p>
    </div>
  );
};

export default IngredientSelector;
