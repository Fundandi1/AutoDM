import React, { useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

const CampaignSchedule = ({ onSave, initialValues = {} }) => {
  const [formData, setFormData] = useState({
    timeZone: initialValues.timeZone || '(GMT+2:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna',
    startTime: initialValues.startTime || '9:00 AM',
    endTime: initialValues.endTime || '5:00 PM',
    days: initialValues.days || {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    randomDayOff: initialValues.randomDayOff || true,
    active: initialValues.active || false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDayToggle = (day) => {
    setFormData({
      ...formData,
      days: {
        ...formData.days,
        [day]: !formData.days[day]
      }
    });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const handleToggleActive = () => {
    setFormData({
      ...formData,
      active: !formData.active
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-800">Awesome Campaign</h1>
          <button type="button" className="text-primary-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Draft
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Submit Campaign
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button className="px-4 py-2 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-gray-300">
            Leads
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-gray-300">
            Sequences
          </button>
          <button className="px-4 py-2 text-sm font-medium text-primary-500 border-b-2 border-primary-500">
            Schedule
          </button>
        </div>
      </div>

      <div className="mb-6 px-4 py-3 bg-blue-50 rounded-md">
        <div className="flex items-start">
          <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-2" />
          <p className="text-sm text-gray-600">
            We may need to increase the intervals if we need more time in order to hit the 50 DMs/day on your account.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">When should the messages be sent?</h2>

          <div className="space-y-6">
            <div>
              <label htmlFor="timeZone" className="block text-sm font-medium text-gray-700 mb-1">
                Time Zone
              </label>
              <select
                id="timeZone"
                name="timeZone"
                value={formData.timeZone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="(GMT+2:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna">
                  (GMT+2:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna
                </option>
                <option value="(GMT+0:00) London, Edinburgh, Dublin">(GMT+0:00) London, Edinburgh, Dublin</option>
                <option value="(GMT-5:00) Eastern Time (US & Canada)">(GMT-5:00) Eastern Time (US & Canada)</option>
                <option value="(GMT-8:00) Pacific Time (US & Canada)">(GMT-8:00) Pacific Time (US & Canada)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                  From
                </label>
                <select
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="9:00 AM">9:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="1:00 PM">1:00 PM</option>
                </select>
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                  to
                </label>
                <select
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="3:00 PM">3:00 PM</option>
                  <option value="4:00 PM">4:00 PM</option>
                  <option value="5:00 PM">5:00 PM</option>
                  <option value="6:00 PM">6:00 PM</option>
                  <option value="7:00 PM">7:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Days of the week</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries({
                  monday: 'Monday',
                  tuesday: 'Tuesday',
                  wednesday: 'Wednesday',
                  thursday: 'Thursday',
                  friday: 'Friday',
                  saturday: 'Saturday',
                  sunday: 'Sunday'
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center">
                    <input
                      id={key}
                      type="checkbox"
                      checked={formData.days[key]}
                      onChange={() => handleDayToggle(key)}
                      className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor={key} className="ml-2 block text-sm text-gray-700">
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="randomDayOff"
                name="randomDayOff"
                type="checkbox"
                checked={formData.randomDayOff}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="randomDayOff" className="ml-2 block text-sm text-gray-700">
                Random day off
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="mr-2 text-sm font-medium text-gray-700">
              {formData.active ? 'Active' : 'Paused'}
            </span>
            <button
              type="button"
              onClick={handleToggleActive}
              className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                formData.active ? 'bg-primary-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                  formData.active ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Save Schedule
          </button>
        </div>
      </form>
    </div>
  );
};

export default CampaignSchedule; 