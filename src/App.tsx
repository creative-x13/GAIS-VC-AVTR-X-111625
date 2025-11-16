import React from 'react';
import { RemodelingLiveWidget } from './components/organisms/RemodelingLiveWidget/RemodelingLiveWidget';

const App: React.FC = () => {
  return (
    <>
      <div className="min-h-screen bg-slate-100 text-slate-800 font-sans p-4 md:p-6 lg:p-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">Our Awesome Website</h1>
          <p className="text-slate-600 mt-2 text-lg">This page represents your website where the AI widget is embedded.</p>
        </header>
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Page Content</h2>
            <p className="mb-4">
                This is where the main content of your website would go. The AI agent widget, which you can open using the launcher button, will float on top of this content.
            </p>
            <p className="mb-4">
                Try moving your mouse towards the top of the browser window as if you were going to close the tab to see the exit-intent trigger in action (if it's enabled in the settings).
            </p>
            <p>
                You can customize the widget's position, theme, colors, and behavior from the settings menu inside the widget itself.
            </p>
        </div>
      </div>
      <RemodelingLiveWidget />
    </>
  );
};

export default App;
