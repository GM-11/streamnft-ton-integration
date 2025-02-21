import React from 'react';

const ToggleSwitch = ({ checked, onChange, onLabel = 'Yes', offLabel = 'No' }) => {
  return (
    <div className="flex items-center">
      <label className="relative inline-block w-12 h-6">
        <input
          type="checkbox"
          className="opacity-0 w-0 h-0"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span
          className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-400 rounded-full transition-all duration-300 ${
            checked ? 'bg-green-4' : 'bg-gray-400'
          }`}
        />
        <span
          className={`absolute left-0 top-0 bottom-0 w-6 h-6 bg-white rounded-full transition-transform duration-300 transform ${
            checked ? 'translate-x-6' : ''
          }`}
        />
      </label>
      <span
        className={`ml-3 text-sm font-semibold ${
          checked ? 'text-green-5' : 'text-white'
        }`}
      >
        {checked ? onLabel : offLabel}
      </span>
    </div>
  );
};

export default ToggleSwitch;
