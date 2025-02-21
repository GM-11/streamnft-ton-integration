import React, { useState } from 'react';

const TabComponent = () => {
  const [activeTab, setActiveTab] = useState('live');

  return (
    <div className="flex justify-center items-center  my-4">
      <button
        onClick={() => setActiveTab('live')}
        className={`px-4 py-2 text-sm font-medium ${activeTab === 'live' ? 'text-green-5 font-semibold text-3xl border-b-2 border-green-6' : 'text-gray-600'}`}
      >
        Live & Upcoming
      </button>
      <button
        onClick={() => setActiveTab('past')}
        className={`px-4 py-2 text-sm font-medium ${activeTab === 'past' ? 'text-green-5 font-semibold text-3xl border-b-2 border-green-6' : 'text-gray-600'}`}
      >
        Past
      </button>
    </div>
  );
};

export default TabComponent;
