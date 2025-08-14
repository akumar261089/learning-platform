import React, { useState, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { CourseList } from './components/CourseList';
import { CourseDetail } from './components/CourseDetail';
import { Settings } from './components/Settings';
import { Dashboard } from './components/Dashboard';
import { Course } from './types';
import { storageService } from './services/storage';

function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'courses' | 'settings'>('dashboard');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
  };

  const handleExport = () => {
    const data = storageService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learning-portal-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        storageService.importData(data);
        alert('Data imported successfully!');
        // Refresh the page to show updated data
        window.location.reload();
      } catch (error) {
        alert('Failed to import data: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      storageService.clearAllData();
      alert('All data has been cleared!');
      window.location.reload();
    }
  };

  const renderContent = () => {
    if (activeView === 'dashboard') {
      return <Dashboard />;
    }
    
    if (activeView === 'settings') {
      return <Settings />;
    }

    if (selectedCourse) {
      return (
        <CourseDetail
          course={selectedCourse}
          onBack={handleBackToCourses}
        />
      );
    }

    return <CourseList onCourseSelect={handleCourseSelect} />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        activeView={activeView}
        onViewChange={setActiveView}
        onExport={handleExport}
        onImport={handleImport}
        onClearData={handleClearData}
      />
      
      <main className="pb-8">
        {renderContent()}
      </main>
      
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}

export default App;