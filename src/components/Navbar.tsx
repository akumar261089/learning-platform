import React from 'react';
import { BookOpen, Settings, Download, Upload, Trash2, BarChart3 } from 'lucide-react';

interface NavbarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onExport: () => void;
  onImport: () => void;
  onClearData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onViewChange,
  onExport,
  onImport,
  onClearData
}) => {
  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Learning Portal</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <button
                onClick={() => onViewChange('dashboard')}
                className={`${
                  activeView === 'dashboard'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                Dashboard
              </button>
              <button
                onClick={() => onViewChange('courses')}
                className={`${
                  activeView === 'courses'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                Courses
              </button>
              <button
                onClick={() => onViewChange('settings')}
                className={`${
                  activeView === 'settings'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                Settings
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onExport}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
              title="Export Data"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={onImport}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
              title="Import Data"
            >
              <Upload className="h-5 w-5" />
            </button>
            <button
              onClick={onClearData}
              className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors duration-200"
              title="Clear All Data"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};