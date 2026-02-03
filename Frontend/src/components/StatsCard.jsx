import React from 'react';

const StatsCard = ({ title, value, icon }) => {
    return (
        <div className="bg-[#F7F0E8] border border-[#E5DCD2] rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="bg-white p-3 rounded-full mb-3 shadow-[0_2px_8px_rgba(107,58,42,0.1)]">
                <span className="text-2xl">{icon}</span>
            </div>
            <h3 className="text-3xl font-serif font-bold text-[#3B2415] mb-1">{value}</h3>
            <p className="text-[#8A7060] text-sm uppercase tracking-wide font-medium">{title}</p>
        </div>
    );
};

export default StatsCard;
