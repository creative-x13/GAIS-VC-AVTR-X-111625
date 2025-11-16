import React, { useState, useCallback } from 'react';
import { useWidgetContext } from '../../../contexts/WidgetContext';
import { BusinessMatch } from '../../../types/agent';
import { AppPersona, WidgetPosition, CustomThemeColors, WidgetTheme, WidgetOpenBehavior } from '../../../types/widget';
import { Tooltip } from '../../atoms/Tooltip/Tooltip';
import { SALES_STYLES, PPC_VERTICALS } from '../../../config/remodelingLiveConfig';
import { NewWebhook, Webhook, WebhookEvent, WEBHOOK_EVENTS } from '../../../types/integration';

interface RemodelingLiveSettingsModalProps {
  onClose: () => void;
}

const VOICES = [
    { id: 'Kore', name: 'Female 1', description: 'Professional & Clear (Female)' },
    { id: 'Zephyr', name: 'Female 2', description: 'Friendly & Warm (Female)' },
    { id: 'Puck', name: 'Male 1', description: 'Confident & Engaging (Male)' },
    { id: 'Charon', name: 'Male 2', description: 'Deep & Authoritative (Male)' },
    { id: 'Fenrir', name: 'Male 3', description: 'Energetic & Youthful (Male)' },
];

const CONTRACTOR_TRADES = [
    {
        category: "Fundamental Trades",
        trades: [
            "General Contractor (GC)", "Electrician", "Plumber", "HVAC Technician", "Roofer",
            "Rough Carpenter / Framer", "Finishing Carpenter", "Drywaller / Plasterer",
            "Painter and Decorator", "Flooring Contractor", "Masonry Contractor", "Concrete Contractor",
            "Insulation Contractor", "Window & Door Contractor", "Siding and Exterior Finish"
        ]
    },
    {
        category: "Logistics & Maintenance Services",
        trades: [
            "Remodeling/Renovation Specialist", "Handyman Service", "Landscaper / Hardscaper",
            "Junk Removal Service", "Dumpster Rental / Waste Hauling", "Residential Moving Service",
            "Storage/Container Service", "Home Cleaning Service", "Pest Control / Exterminator",
            "Tree Service / Arborist", "Gutter & Downspout Specialist", "Garage Door Technician",
            "Demolition/Abatement", "Solar & Energy System Installer", "Structural Engineer / Consultant"
        ]
    }
];

const WebhookManager: React.FC = () => {
    const { webhooks, addWebhook, deleteWebhook, testWebhook } = useWidgetContext();
    const [showAddForm, setShowAddForm] = useState(false);
    const [newUrl, setNewUrl] = useState('');
    const [newEvents, setNewEvents] = useState<WebhookEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [newlyCreatedWebhook, setNewlyCreatedWebhook] = useState<Webhook | null>(null);
    const [testStatus, setTestStatus] = useState<Record<string, { status: 'testing' | 'success' | 'error', message: string }>>({});

    const handleEventToggle = (event: WebhookEvent) => {
        setNewEvents(prev => prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUrl || newEvents.length === 0) return;
        setIsLoading(true);
        const newWebhookData: NewWebhook = { url: newUrl, events: newEvents };
        const created = await addWebhook(newWebhookData);
        setNewlyCreatedWebhook(created);
        setIsLoading(false);
        setNewUrl('');
        setNewEvents([]);
        // Keep form open to show secret, but reset for next entry
    };
    
    const handleTest = async (webhookId: string) => {
        setTestStatus(prev => ({ ...prev, [webhookId]: { status: 'testing', message: 'Sending test event...' } }));
        const result = await testWebhook(webhookId);
        setTestStatus(prev => ({ ...prev, [webhookId]: { status: result.success ? 'success' : 'error', message: result.message }}));
        setTimeout(() => setTestStatus(prev => { const { [webhookId]: _, ...rest } = prev; return rest; }), 5000);
    };
    
    const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

    return (
        <div className="mt-4 p-4 border rounded-lg">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    <div>
                        <h4 className="font-semibold text-gray-800">Webhooks</h4>
                        <p className="text-sm text-gray-600">Trigger automations in apps like Zapier or Make.com.</p>
                    </div>
                </div>
                <button onClick={() => { setShowAddForm(p => !p); setNewlyCreatedWebhook(null); }} className="font-semibold py-2 px-4 rounded-md bg-blue-600 text-white hover:bg-blue-500">
                    {showAddForm ? 'Cancel' : '+ Add Webhook'}
                </button>
            </div>

            {showAddForm && (
                <div className="mt-4 pt-4 border-t">
                    {newlyCreatedWebhook ? (
                        <div>
                            <h4 className="font-semibold text-lg text-green-700">Webhook Created Successfully!</h4>
                            <p className="text-sm text-gray-600 mt-2">For security, this is the only time we will show you the signing secret. Copy it now and store it securely. You'll need it to verify payloads from us.</p>
                            <div className="mt-4 p-3 bg-gray-100 rounded-md">
                                <label className="block text-xs font-semibold text-gray-500 uppercase">Signing Secret</label>
                                <div className="flex items-center justify-between">
                                    <pre className="text-sm font-mono text-gray-800 truncate"><code>{newlyCreatedWebhook.signingSecret}</code></pre>
                                    <button onClick={() => copyToClipboard(newlyCreatedWebhook.signingSecret)} className="text-sm font-semibold text-blue-600 hover:text-blue-800">Copy</button>
                                </div>
                            </div>
                            <button onClick={() => setNewlyCreatedWebhook(null)} className="mt-4 font-semibold text-blue-600 text-sm">Add another webhook</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <h4 className="font-semibold text-gray-800 mb-2">New Webhook Configuration</h4>
                            <div>
                                <label htmlFor="webhook-url" className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
                                <input id="webhook-url" type="url" value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://your-automation-tool.com/webhook/..." required className="w-full p-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Events to send</label>
                                <div className="space-y-2">{WEBHOOK_EVENTS.map(event => (
                                    <label key={event.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                                        <input type="checkbox" checked={newEvents.includes(event.id)} onChange={() => handleEventToggle(event.id)} className="h-5 w-5 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                                        <div><span className="font-semibold text-gray-800">{event.label}</span><p className="text-xs text-gray-500">{event.description}</p></div>
                                    </label>
                                ))}</div>
                            </div>
                            <button type="submit" disabled={isLoading || !newUrl || newEvents.length === 0} className="mt-4 font-semibold py-2 px-4 rounded-md bg-green-600 text-white hover:bg-green-500 disabled:bg-gray-400">
                                {isLoading ? 'Saving...' : 'Save Webhook'}
                            </button>
                        </form>
                    )}
                </div>
            )}
            
            <div className="mt-4 pt-4 border-t space-y-3">
                {webhooks.length === 0 && !showAddForm && <p className="text-sm text-gray-500 text-center py-4">No webhooks configured yet.</p>}
                {webhooks.map(wh => (
                    <div key={wh.id} className="p-3 bg-gray-50 rounded-lg border">
                        <div className="flex justify-between items-start">
                           <div>
                                <p className="font-mono text-sm text-blue-800 break-all">{wh.url.replace(/https?:\/\//, '').replace(/\/$/, '')}</p>
                                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">{wh.events.map(e => <span key={e} className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{WEBHOOK_EVENTS.find(we => we.id === e)?.label || e}</span>)}</div>
                           </div>
                           <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                <button onClick={() => handleTest(wh.id)} className="p-2 text-gray-500 hover:bg-gray-200 rounded-md" aria-label="Test Webhook">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </button>
                                <button onClick={() => deleteWebhook(wh.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-md" aria-label="Delete Webhook">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                </button>
                           </div>
                        </div>
                        {testStatus[wh.id] && (
                            <div className={`mt-2 p-2 text-xs rounded-md border ${testStatus[wh.id].status === 'success' ? 'bg-green-50 border-green-200 text-green-800' : testStatus[wh.id].status === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                                <strong>{testStatus[wh.id].status === 'testing' ? 'Testing...' : testStatus[wh.id].status === 'success' ? 'Success:' : 'Error:'}</strong> {testStatus[wh.id].message}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};


export const RemodelingLiveSettingsModal: React.FC<RemodelingLiveSettingsModalProps> = ({ onClose }) => {
  const {
    appPersona, handleSetAppPersona, activeSalesStyle, handleSetActiveSalesStyle,
    contractorTrade, handleSetContractorTrade, ppcVertical, handleSetPpcVertical,
    knowledgeBase, isGeneratingKb, kbGenerationMessage, kbError,
    generateKnowledgeBase, clearKnowledgeBase, kbBusinessMatches, isSearchingBusinesses,
    searchBusinessesForKb, clearBusinessMatches, agentCustomerId, agentName, handleSetAgentName,
    agentOpeningMessage, handleSetAgentOpeningMessage, additionalInstructions, handleSetAdditionalInstructions,
    agentVoice, handleSetAgentVoice, playVoiceSample, agentAvatarUrl, isGeneratingAgentAvatar,
    handleGenerateAgentAvatar, logoUrl, widgetTitle, handleSetWidgetTitle, phoneNumber,
    handleSetPhoneNumber, googleSheetUrl, handleSetGoogleSheetUrl, handleSetLogo, handleClearLogo, 
    isGoogleConnected, handleConnectGoogle, handleDisconnectGoogle, isExitIntentEnabled, handleToggleExitIntent,
    widgetPosition, handleSetWidgetPosition, widgetTheme, handleSetWidgetTheme, customThemeColors, handleSetCustomThemeColor,
    widgetOpenBehavior, handleSetWidgetOpenBehavior, isAutoActivateEnabled, handleToggleAutoActivate,
    ppcCustomVertical, handleSetPpcCustomVertical, ppcServices, handleSetPpcServices, ppcKeywords, handleSetPpcKeywords,
    customPpcInstructions, handleSetCustomPpcInstructions, isGeneratingPpcInstructions, ppcGeneratorStep, handleSetPpcGeneratorStep,
    generateAndSetPpcInstructions
  } = useWidgetContext();

  const [activeTab, setActiveTab] = useState<'branding' | 'agent' | 'app_type' | 'kb' | 'integrations' | 'widget'>('app_type');
  
  const [inputType, setInputType] = useState<'url' | 'business' | 'file'>('url');
  const [url, setUrl] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');

  const [copyButtonText, setCopyButtonText] = useState('Copy Code');
  const [playingSample, setPlayingSample] = useState<string | null>(null);
  
  const [avatarStyle, setAvatarStyle] = useState('Photorealistic');
  const [avatarSubject, setAvatarSubject] = useState('Woman');
  const [avatarDescription, setAvatarDescription] = useState('receptionist with a headset');

  const TABS = [
    { id: 'app_type', label: 'App Type' },
    { id: 'branding', label: 'Branding & Style' },
    { id: 'agent', label: 'Agent Persona' },
    { id: 'kb', label: 'Knowledge Base' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'widget', label: 'Engagement & Code' },
  ] as const;

  const widgetCode = `<div id="live-agent-widget-container"></div>
<script
  src="https://your-saas.com/live-agent-widget.js"
  data-customer-id="${agentCustomerId}"
  async
  defer
></script>`;

  const handlePlaySample = async (voiceId: string) => {
    setPlayingSample(voiceId);
    await playVoiceSample(voiceId);
    setPlayingSample(null);
  };
  
  const handleGenerateAvatarClick = () => handleGenerateAgentAvatar(avatarStyle, avatarSubject, avatarDescription);
  const handleCopyCode = useCallback(() => { navigator.clipboard.writeText(widgetCode).then(() => { setCopyButtonText('Copied!'); setTimeout(() => setCopyButtonText('Copy Code'), 2000); }); }, [widgetCode]);
  const handleUrlSubmit = (e: React.FormEvent) => { e.preventDefault(); if (url.trim()) generateKnowledgeBase({ type: 'url', value: url }); };
  const handleBusinessSearch = (e: React.FormEvent) => { e.preventDefault(); if(businessName.trim() && location.trim()) searchBusinessesForKb(businessName, location); };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file && (file.type === 'text/plain' || file.type === 'text/markdown' || file.name.endsWith('.md'))) { setFileName(file.name); const reader = new FileReader(); reader.onload = (event) => setFileContent(event.target?.result as string); reader.readAsText(file); } else { alert("Please upload a valid .txt or .md file."); setFileName(''); setFileContent(''); } };
  const handleFileSubmit = (e: React.FormEvent) => { e.preventDefault(); if(fileContent) generateKnowledgeBase({ type: 'file', content: fileContent }); };
  const handleSelectBusiness = (business: BusinessMatch) => generateKnowledgeBase({ type: 'business', value: business });
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) handleSetLogo(file); };

  const renderKbContent = () => {
    const showResults = knowledgeBase || isGeneratingKb || kbError;
    const showBusinessList = kbBusinessMatches.length > 0 && !showResults;
    if (showResults) return renderKbResults();
    if (showBusinessList) return renderBusinessList();
    return renderKbInputForms();
  }

  const renderKbInputForms = () => (
     <div>
        <div className="flex border-b border-gray-200 mb-4">
            <button onClick={() => setInputType('url')} className={`px-4 py-2 -mb-px border-b-2 ${inputType === 'url' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>From URL</button>
            <button onClick={() => setInputType('business')} className={`px-4 py-2 -mb-px border-b-2 ${inputType === 'business' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>From Business Name</button>
            <button onClick={() => setInputType('file')} className={`px-4 py-2 -mb-px border-b-2 ${inputType === 'file' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>From File</button>
        </div>
        {inputType === 'url' && <form onSubmit={handleUrlSubmit} className="flex flex-col sm:flex-row gap-2"><input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/faq" required className="flex-grow p-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" /><button type="submit" className="font-semibold py-2 px-4 rounded-md bg-blue-600 text-white hover:bg-blue-500">Generate</button></form>}
        {inputType === 'business' && <form onSubmit={handleBusinessSearch} className="flex flex-col gap-2"><div className="flex flex-col sm:flex-row gap-2"><input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Business Name" required className="flex-grow p-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" /><input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State or Address" required className="w-full sm:w-auto p-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div><button type="submit" className="font-semibold py-2 px-4 rounded-md bg-blue-600 text-white hover:bg-blue-500" disabled={isSearchingBusinesses}>{isSearchingBusinesses ? 'Searching...' : 'Search Businesses'}</button></form>}
        {inputType === 'file' && <form onSubmit={handleFileSubmit} className="flex flex-col gap-2"><div><input id="pro-file-upload" type="file" accept=".txt,.md" onChange={handleFileChange} className="hidden" /><label htmlFor="pro-file-upload" className="w-full text-center font-semibold py-2 px-4 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-pointer block">Choose a File (.txt, .md)</label>{fileName && <p className="text-sm text-gray-500 mt-2">Selected: <strong>{fileName}</strong></p>}</div><button type="submit" className="font-semibold py-2 px-4 rounded-md bg-blue-600 text-white hover:bg-blue-500 disabled:bg-gray-400" disabled={!fileContent}>Generate</button></form>}
    </div>
  );

  const renderBusinessList = () => (
    <div>
        <div className="flex justify-between items-center mb-2"><h4 className="font-semibold text-gray-800">Select the correct business:</h4><button onClick={clearBusinessMatches} className="text-sm font-semibold text-gray-600 hover:text-gray-900">Back to Search</button></div>
        <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2">{kbBusinessMatches.map((match, index) => (<button key={index} onClick={() => handleSelectBusiness(match)} className="w-full text-left p-3 bg-gray-50 hover:bg-blue-100 rounded-md border border-gray-200"><p className="font-bold text-blue-800">{match.name}</p><p className="text-sm text-gray-600">{match.address}</p></button>))}</div>
    </div>
  );

  const renderKbResults = () => (
    <div>
        {isGeneratingKb && <div className="flex items-center justify-center gap-3 mt-4 text-blue-600"><svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><p className="font-medium">{kbGenerationMessage}</p></div>}
        {kbError && <p className="text-red-600 text-sm mt-2">{kbError}</p>}
        {knowledgeBase && !isGeneratingKb && <div className="mt-4"><div className="flex justify-between items-center mb-2"><h4 className="font-semibold text-gray-700">Generated Knowledge Base XML:</h4><button onClick={clearKnowledgeBase} className="text-sm font-semibold py-1 px-3 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300">Clear & Start Over</button></div><pre className="w-full h-64 bg-gray-900 text-white font-mono text-xs rounded-lg p-4 overflow-auto border border-gray-700"><code>{knowledgeBase}</code></pre></div>}
    </div>
  );
  
  const renderPpcGenerator = () => (
      <div className="mt-6 pt-6 border-t">
          <div className="flex items-center">
              <h4 className="text-lg font-semibold text-gray-800">AI-Powered Instruction Generator</h4>
              <Tooltip text="Provide your business details and let AI generate a tailored set of system instructions for your Pay-Per-Call agent to maximize call conversions." />
          </div>
          <p className="text-sm text-gray-600 mb-4">Craft the perfect script for your agent.</p>

          {ppcGeneratorStep === 'input' ? (
              <div className="space-y-4">
                  <div>
                      <label htmlFor="ppc-custom-vertical" className="block text-sm font-medium text-gray-700 mb-1">Business Vertical</label>
                      <input id="ppc-custom-vertical" type="text" value={ppcCustomVertical} onChange={(e) => handleSetPpcCustomVertical(e.target.value)} placeholder="e.g., Emergency Plumbing, HVAC Repair" required className="w-full p-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                      <label htmlFor="ppc-services" className="block text-sm font-medium text-gray-700 mb-1">Services Offered</label>
                      <textarea id="ppc-services" value={ppcServices} onChange={(e) => handleSetPpcServices(e.target.value)} placeholder="e.g., Emergency leak repair, drain cleaning, water heater installation" rows={3} required className="w-full p-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                      <label htmlFor="ppc-keywords" className="block text-sm font-medium text-gray-700 mb-1">Key Selling Points</label>
                      <textarea id="ppc-keywords" value={ppcKeywords} onChange={(e) => handleSetPpcKeywords(e.target.value)} placeholder="e.g., 24/7 service, free estimates, licensed & insured" rows={3} className="w-full p-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Phone Number</label>
                      <p className="text-sm p-2 rounded-md bg-gray-100 text-gray-800">{phoneNumber || 'Please set a phone number in Branding & Style'}</p>
                  </div>
                  <button onClick={generateAndSetPpcInstructions} disabled={isGeneratingPpcInstructions || !ppcCustomVertical.trim() || !ppcServices.trim()} className="font-semibold py-2 px-4 rounded-md bg-blue-600 text-white hover:bg-blue-500 disabled:bg-gray-400">
                      {isGeneratingPpcInstructions ? 'Generating...' : 'Generate Instructions with AI'}
                  </button>
              </div>
          ) : (
              <div>
                  <label htmlFor="custom-ppc-instructions" className="block text-sm font-medium text-gray-700 mb-1">Generated Agent Instructions</label>
                  <p className="text-xs text-gray-500 mb-2">Review and edit the generated instructions below. This will be the new system prompt for your agent.</p>
                  <textarea id="custom-ppc-instructions" value={customPpcInstructions} onChange={(e) => handleSetCustomPpcInstructions(e.target.value)} rows={12} className="w-full p-2 rounded-md bg-gray-50 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <div className="flex gap-2 mt-2">
                       <button onClick={() => handleSetPpcGeneratorStep('input')} className="font-semibold py-2 px-4 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300">Edit Inputs</button>
                       <button onClick={generateAndSetPpcInstructions} disabled={isGeneratingPpcInstructions} className="font-semibold py-2 px-4 rounded-md bg-blue-600 text-white hover:bg-blue-500 disabled:bg-gray-400">
                          {isGeneratingPpcInstructions ? 'Regenerating...' : 'Regenerate'}
                       </button>
                  </div>
              </div>
          )}
      </div>
  );

  const renderAgentCustomizationContent = () => (
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-4">Agent Persona</h3>
      <div className="flex items-center"><h4 className="text-lg font-semibold text-gray-800">Agent Identity</h4><Tooltip text="Customize the name, voice, and visual appearance of your virtual agent to match your brand's personality." /></div>
      <p className="text-sm text-gray-600 mb-4">Customize the name, voice, and avatar of your virtual agent.</p>
      <div className="space-y-4">
        <div>
            <label htmlFor="agent-name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Agent Name
                <Tooltip text="The name your agent will use to introduce itself. Keep it simple and friendly." />
            </label>
            <input id="agent-name" type="text" value={agentName} onChange={(e) => handleSetAgentName(e.target.value)} placeholder="e.g., Alex, Sam, etc." className="w-full p-2 rounded-md bg-gray-50 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>
        <div>
            <label htmlFor="agent-opening-message" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Agent Opening Message
                <Tooltip text="Customize the exact first sentence your agent will say. This overrides the default greeting." />
            </label>
            <textarea
                id="agent-opening-message"
                value={agentOpeningMessage}
                onChange={(e) => handleSetAgentOpeningMessage(e.target.value)}
                placeholder="e.g., Hi, thank you for calling Example Corp. My name is [Agent Name], how can I help?"
                rows={3}
                className="w-full p-2 rounded-md bg-gray-50 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
        <div>
            <label htmlFor="agent-additional-instructions" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Additional Instructions
                <Tooltip text="Provide extra rules or context for your agent (e.g., 'Always mention our 10% discount.'). This is added to its core instructions." />
            </label>
            <textarea
                id="agent-additional-instructions"
                value={additionalInstructions}
                onChange={(e) => handleSetAdditionalInstructions(e.target.value)}
                placeholder="e.g., Be extra empathetic. Always offer to schedule a follow-up call."
                rows={5}
                className="w-full p-2 rounded-md bg-gray-50 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
      </div>

      {appPersona === 'contractor_agent' && (
        <div className="mt-6 pt-6 border-t">
            <div className="flex items-center">
                <h4 className="text-lg font-semibold text-gray-800">Trade Specialty</h4>
                <Tooltip text="Select the specific trade for your contractor agent. This will tailor its expertise and introduction." />
            </div>
            <p className="text-sm text-gray-600 mb-4">Choose the specific trade for your virtual contractor.</p>
            <select 
                value={contractorTrade} 
                onChange={(e) => handleSetContractorTrade(e.target.value)} 
                className="w-full p-2 rounded-md bg-gray-50 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {CONTRACTOR_TRADES.map(group => (
                    <optgroup key={group.category} label={group.category}>
                        {group.trades.map(trade => (
                            <option key={trade} value={trade}>{trade}</option>
                        ))}
                    </optgroup>
                ))}
            </select>
        </div>
      )}

      {appPersona === 'sales_agent' && <div className="mt-6 pt-6 border-t"><div className="flex items-center"><h4 className="text-lg font-semibold text-gray-800">Sales Style</h4><Tooltip text="Select a sales methodology for your agent. This will change its core behavior and conversational style." /></div><p className="text-sm text-gray-600 mb-4">Choose the sales methodology for your virtual agent.</p><select value={activeSalesStyle} onChange={(e) => handleSetActiveSalesStyle(e.target.value)} className="w-full p-2 rounded-md bg-gray-50 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">{SALES_STYLES.map(style => (<option key={style.name} value={style.name}>{style.name}</option>))}</select></div>}
      
      {appPersona === 'customizable_ppc_agent' && renderPpcGenerator()}

      <div className="mt-6 pt-6 border-t">
        <div className="flex items-center"><h4 className="text-lg font-semibold text-gray-800">Voice Selection</h4><Tooltip text="Choose the text-to-speech voice for your agent. Click the play button to hear a preview." /></div>
        <p className="text-sm text-gray-600 mb-4">Choose the voice for your virtual agent. Click the play button to hear a sample.</p>
        <div className="space-y-3">
          {VOICES.map((voice) => (
            <div key={voice.id} className={`p-3 rounded-lg border-2 transition-colors flex items-center justify-between ${agentVoice === voice.id ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}`}>
              <label htmlFor={`voice-${voice.id}`} className="flex items-center cursor-pointer flex-grow">
                <input type="radio" id={`voice-${voice.id}`} name="agent-voice" value={voice.id} checked={agentVoice === voice.id} onChange={(e) => handleSetAgentVoice(e.target.value)} className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"/>
                <div className="ml-3">
                  <span className="block font-semibold text-gray-800">{voice.name}</span>
                  <span className="block text-sm text-gray-500">{voice.description}</span>
                </div>
              </label>
              <button onClick={() => handlePlaySample(voice.id)} disabled={playingSample === voice.id} className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-200 disabled:opacity-50" aria-label={`Play sample for ${voice.name}`}>
                {playingSample === voice.id ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t">
          <div className="flex items-center"><h4 className="text-lg font-semibold text-gray-800">Agent Avatar</h4><Tooltip text="Generate a unique visual avatar for your agent. This is only used for voice-only agent personas." /></div>
          <p className="text-sm text-gray-600 mb-4">Generate a visual avatar for your agent (used for voice agent personas).</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label htmlFor="avatar-style" className="block text-sm font-medium text-gray-700 mb-1">Style</label><select id="avatar-style" value={avatarStyle} onChange={e => setAvatarStyle(e.target.value)} className="w-full p-2 rounded-md bg-gray-50 border border-gray-300 focus:ring-blue-500"><option>Photorealistic</option><option>Digital Art</option><option>Anime</option></select></div>
              <div><label htmlFor="avatar-subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label><select id="avatar-subject" value={avatarSubject} onChange={e => setAvatarSubject(e.target.value)} className="w-full p-2 rounded-md bg-gray-50 border border-gray-300 focus:ring-blue-500"><option>Man</option><option>Woman</option><option>Person</option><option>Robot</option></select></div>
              <div className="md:col-span-2"><label htmlFor="avatar-desc" className="block text-sm font-medium text-gray-700 mb-1">Description</label><input id="avatar-desc" type="text" value={avatarDescription} onChange={e => setAvatarDescription(e.target.value)} placeholder="e.g., friendly customer service agent" className="w-full p-2 rounded-md bg-gray-50 border border-gray-300 focus:ring-blue-500" /></div>
          </div>
          <div className="flex items-center gap-4 mt-4">
              <button onClick={handleGenerateAvatarClick} disabled={isGeneratingAgentAvatar} className="font-semibold py-2 px-4 rounded-md bg-blue-600 text-white hover:bg-blue-500 disabled:bg-gray-400">{isGeneratingAgentAvatar ? 'Generating...' : 'Generate Avatar'}</button>
              {agentAvatarUrl && <div className="flex items-center gap-2"><img src={agentAvatarUrl} alt="Generated Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-blue-500" /><p className="text-sm text-gray-600">Avatar generated!</p></div>}
          </div>
      </div>

    </div>
  );

  const renderBrandingContent = () => (
    <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Branding &amp; Appearance</h3>
        <div className="flex items-center"><h4 className="text-lg font-semibold text-gray-800">Widget Branding</h4><Tooltip text="Customize the header of your widget with your brand's logo, title, and contact number." /></div>
        <p className="text-sm text-gray-600 mb-4">Set the title, phone number, and logo for your widget.</p>
        <div className="space-y-4">
            <div><label htmlFor="widget-title" className="block text-sm font-medium text-gray-700 mb-1">Widget Title</label><input id="widget-title" type="text" value={widgetTitle} onChange={(e) => handleSetWidgetTitle(e.target.value)} placeholder="e.g., Support, Sales Assistant" className="w-full p-2 rounded-md bg-gray-50 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label htmlFor="widget-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number/Target Number (Optional)</label><input id="widget-phone" type="tel" value={phoneNumber} onChange={(e) => handleSetPhoneNumber(e.target.value)} placeholder="e.g., 1-800-555-1234" className="w-full p-2 rounded-md bg-gray-50 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Company Logo</label><div className="flex items-center gap-4"><div className="w-20 h-20 bg-gray-100 rounded-md border p-1 flex items-center justify-center">{logoUrl ? <img src={logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" /> : <span className="text-xs text-gray-500">Preview</span>}</div><div className="flex-grow"><input id="logo-upload" type="file" accept="image/png, image/jpeg" onChange={handleLogoFileChange} className="hidden" /><label htmlFor="logo-upload" className="font-semibold py-2 px-4 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-pointer">Upload Logo</label>{logoUrl && <button onClick={handleClearLogo} className="ml-2 text-sm text-red-600 hover:text-red-800">Remove</button>}<p className="text-xs text-gray-500 mt-1">Recommended: Square image (PNG, JPG).</p></div></div></div>
        </div>

        <div className="mt-6 pt-6 border-t"><div className="flex items-center"><h4 className="text-lg font-semibold text-gray-800">Widget Appearance</h4><Tooltip text="Control the position and color scheme of the widget on your website." /></div>
            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Widget Position</label>
                <div className="grid grid-cols-2 gap-2 max-w-xs">
                    {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as WidgetPosition[]).map(pos => (
                        <button key={pos} onClick={() => handleSetWidgetPosition(pos)} className={`capitalize p-3 rounded-md border-2 ${widgetPosition === pos ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'}`}>{pos.replace('-', ' ')}</button>
                    ))}
                    <div className="col-span-2">
                        <button onClick={() => handleSetWidgetPosition('full-screen')} className={`w-full text-center p-3 rounded-md border-2 ${widgetPosition === 'full-screen' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'}`}>
                            Full-Screen Overlay
                        </button>
                    </div>
                </div>
            </div>
            <div className="mt-4"><label className="block text-sm font-medium text-gray-700 mb-2">Theme</label><div className="flex gap-4">{(['light', 'dark', 'custom'] as WidgetTheme[]).map(theme => <label key={theme} className="flex items-center gap-2"><input type="radio" name="theme" value={theme} checked={widgetTheme === theme} onChange={() => handleSetWidgetTheme(theme as WidgetTheme)} /> <span className="capitalize">{theme}</span></label>)}</div></div>
            {widgetTheme === 'custom' && <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">{Object.keys(customThemeColors).map(key => <div key={key}><label className="capitalize text-sm font-medium text-gray-700">{key.replace(/([A-Z])/g, ' $1')}</label><input type="color" value={customThemeColors[key as keyof CustomThemeColors]} onChange={(e) => handleSetCustomThemeColor(key as keyof CustomThemeColors, e.target.value)} className="w-full h-10 p-1 border border-gray-300 rounded-md"/></div>)}</div>}
        </div>
    </div>
  );
  
  const renderAppTypeContent = () => (
    <div><h3 className="text-xl font-bold text-gray-800 mb-4">Application Type</h3><div className="flex items-center"><h4 className="text-lg font-semibold text-gray-800">Agent Persona</h4><Tooltip text="Select the primary function of the application. This will change the UI and the agent's capabilities." /></div><p className="text-sm text-gray-600 mb-4">Choose the persona for your virtual agent.</p>
        <div className="space-y-3">
            <div className={`p-4 rounded-lg border-2 transition-colors ${appPersona === 'remodeling_consultant' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}`}><label htmlFor="persona-remodeling" className="flex items-start cursor-pointer"><input type="radio" id="persona-remodeling" name="app-persona" value="remodeling_consultant" checked={appPersona === 'remodeling_consultant'} onChange={(e) => handleSetAppPersona(e.target.value as AppPersona)} className="h-5 w-5 mt-0.5 text-blue-600 border-gray-300 focus:ring-blue-500"/><div className="ml-3"><span className="block font-semibold text-gray-800">Remodeling Design Consultant</span><span className="block text-sm text-gray-500">A visual, virtual assistant for kitchen and bathroom remodels. Includes live video, photo capture, and image generation.</span></div></label></div>
            <div className={`p-4 rounded-lg border-2 transition-colors ${appPersona === 'water_damage_restoration' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}`}><label htmlFor="persona-water-damage" className="flex items-start cursor-pointer"><input type="radio" id="persona-water-damage" name="app-persona" value="water_damage_restoration" checked={appPersona === 'water_damage_restoration'} onChange={(e) => handleSetAppPersona(e.target.value as AppPersona)} className="h-5 w-5 mt-0.5 text-blue-600 border-gray-300 focus:ring-blue-500"/><div className="ml-3"><span className="block font-semibold text-gray-800">Water Damage Restoration</span><span className="block text-sm text-gray-500">A multi-step visual tool to assess damage, visualize a clean slate, and then remodel a restored space.</span></div></label></div>
            <div className={`p-4 rounded-lg border-2 transition-colors ${appPersona === 'contractor_agent' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}`}><label htmlFor="persona-contractor" className="flex items-start cursor-pointer"><input type="radio" id="persona-contractor" name="app-persona" value="contractor_agent" checked={appPersona === 'contractor_agent'} onChange={(e) => handleSetAppPersona(e.target.value as AppPersona)} className="h-5 w-5 mt-0.5 text-blue-600 border-gray-300 focus:ring-blue-500"/><div className="ml-3"><span className="block font-semibold text-gray-800">Contractor Agent</span><span className="block text-sm text-gray-500">A troubleshooting assistant for home repair issues. Uses photo analysis to diagnose problems and suggest solutions. Prioritizes safety.</span></div></label></div>
            <div className={`p-4 rounded-lg border-2 transition-colors ${appPersona === 'live_voice_agent' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}`}><label htmlFor="persona-voice" className="flex items-start cursor-pointer"><input type="radio" id="persona-voice" name="app-persona" value="live_voice_agent" checked={appPersona === 'live_voice_agent'} onChange={(e) => handleSetAppPersona(e.target.value as AppPersona)} className="h-5 w-5 mt-0.5 text-blue-600 border-gray-300 focus:ring-blue-500"/><div className="ml-3"><span className="block font-semibold text-gray-800">Live Voice Agent</span><span className="block text-sm text-gray-500">A voice-first virtual agent for customer support and lead capture. Focuses on conversation using a knowledge base, without video or image features.</span></div></label></div>
            <div className={`p-4 rounded-lg border-2 transition-colors ${appPersona === 'sales_agent' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}`}><label htmlFor="persona-sales" className="flex items-start cursor-pointer"><input type="radio" id="persona-sales" name="app-persona" value="sales_agent" checked={appPersona === 'sales_agent'} onChange={(e) => handleSetAppPersona(e.target.value as AppPersona)} className="h-5 w-5 mt-0.5 text-blue-600 border-gray-300 focus:ring-blue-500"/><div className="ml-3"><span className="block font-semibold text-gray-800">Live Sales Agent</span><span className="block text-sm text-gray-500">A voice-first virtual agent for sales and lead qualification. Adopts specific sales methodologies to guide conversations and close deals.</span></div></label></div>
            <div className={`p-4 rounded-lg border-2 transition-colors ${appPersona === 'ppc_agent' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}`}>
                <label htmlFor="persona-ppc" className="flex items-start cursor-pointer">
                    <input type="radio" id="persona-ppc" name="app-persona" value="ppc_agent" checked={appPersona === 'ppc_agent'} onChange={(e) => handleSetAppPersona(e.target.value as AppPersona)} className="h-5 w-5 mt-0.5 text-blue-600 border-gray-300 focus:ring-blue-500"/>
                    <div className="ml-3">
                        <span className="block font-semibold text-gray-800">PPC / Pay-Per-Call Agent</span>
                        <span className="block text-sm text-gray-500">A lead-generation-focused agent for specific business verticals. Acts as a matching service.</span>
                    </div>
                </label>
                {appPersona === 'ppc_agent' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <label htmlFor="ppc-vertical" className="block text-sm font-medium text-gray-700 mb-1">Business Vertical</label>
                        <select 
                            id="ppc-vertical" 
                            value={ppcVertical} 
                            onChange={(e) => handleSetPpcVertical(e.target.value)}
                            className="w-full p-2 rounded-md bg-gray-50 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {PPC_VERTICALS.map(vertical => (
                                <option key={vertical} value={vertical}>{vertical}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
            <div className={`p-4 rounded-lg border-2 transition-colors ${appPersona === 'customizable_ppc_agent' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}`}><label htmlFor="persona-custom-ppc" className="flex items-start cursor-pointer"><input type="radio" id="persona-custom-ppc" name="app-persona" value="customizable_ppc_agent" checked={appPersona === 'customizable_ppc_agent'} onChange={(e) => handleSetAppPersona(e.target.value as AppPersona)} className="h-5 w-5 mt-0.5 text-blue-600 border-gray-300 focus:ring-blue-500"/><div className="ml-3"><span className="block font-semibold text-gray-800">Customizable PPC Agent</span><span className="block text-sm text-gray-500">Uses AI to generate a custom agent script based on your business details to maximize call conversions.</span></div></label></div>
        </div>
    </div>
  );
  
  const renderIntegrationsContent = () => (
    <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Integrations</h3>
        <p className="text-sm text-gray-600 mb-6">Connect your favorite tools to supercharge your virtual agent's capabilities, like scheduling meetings directly to your calendar.</p>
        
        <div className="p-4 border rounded-lg">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <img src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png" alt="Google Logo" className="h-8"/>
                    <div>
                        <h4 className="font-semibold text-gray-800">Google Workspace</h4>
                        <p className="text-sm text-gray-600">Connect to Google Calendar for seamless appointment scheduling.</p>
                    </div>
                </div>
                {isGoogleConnected ? (
                    <button 
                        onClick={handleDisconnectGoogle}
                        className="font-semibold py-2 px-4 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
                    >
                        Disconnect
                    </button>
                ) : (
                    <button 
                        onClick={handleConnectGoogle}
                        className="font-semibold py-2 px-4 rounded-md bg-blue-600 text-white hover:bg-blue-500"
                    >
                        Connect
                    </button>
                )}
            </div>
             {isGoogleConnected && (
                <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-800">
                    <p className="font-semibold">Successfully connected to Google Workspace.</p>
                    <p className="text-sm">Your agent can now schedule events directly to your Google Calendar.</p>
                </div>
            )}
            <div className="mt-4 pt-4 border-t">
                 <label htmlFor="google-sheet-url" className="block text-sm font-medium text-gray-700 mb-1">Google Sheet for Leads</label>
                 <input 
                    id="google-sheet-url" 
                    type="url" 
                    value={googleSheetUrl} 
                    onChange={e => handleSetGoogleSheetUrl(e.target.value)} 
                    placeholder="Paste your Google Sheet URL here..." 
                    className="w-full p-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                 <p className="text-xs text-gray-500 mt-1">Structured lead data will be appended here after each session.</p>
            </div>
        </div>
        <WebhookManager />
    </div>
  );

  const renderWidgetContent = () => (
    <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Engagement &amp; Code</h3>
        <div className="flex items-center"><h4 className="text-lg font-semibold text-gray-800">Proactive Engagement</h4><Tooltip text="Engage visitors proactively based on their behavior to increase conversions." /></div>
        <div className="space-y-4 mt-4">
            <div className="p-4 border rounded-lg">
                <label htmlFor="widget-open-behavior" className="block font-semibold text-gray-800 mb-2">Widget Auto-Open Behavior</label>
                <p className="text-sm text-gray-600 mb-2">Control when the widget automatically appears for a visitor.</p>
                <select 
                    id="widget-open-behavior" 
                    value={widgetOpenBehavior} 
                    onChange={(e) => handleSetWidgetOpenBehavior(e.target.value as WidgetOpenBehavior)}
                    className="w-full p-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="manual">Manual (User Clicks Launcher)</option>
                    <option value="immediate">Immediate on Page Load</option>
                    <option value="delay_15s">After 15 Seconds</option>
                    <option value="delay_30s">After 30 Seconds</option>
                </select>
            </div>
             <div className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                    <h4 className="font-semibold text-gray-800">Live Voice Auto-Activation</h4>
                    <p className="text-sm text-gray-600">Start the voice conversation automatically when the widget opens.</p>
                </div>
                <label htmlFor="auto-activate-toggle" className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="auto-activate-toggle" className="sr-only peer" checked={isAutoActivateEnabled} onChange={handleToggleAutoActivate} />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
            <div className="p-4 border rounded-lg flex justify-between items-center">
                <div><h4 className="font-semibold text-gray-800">Enable Exit Intent</h4><p className="text-sm text-gray-600">Open the widget automatically when a user is about to leave the page.</p></div>
                <label htmlFor="exit-intent-toggle" className="relative inline-flex items-center cursor-pointer"><input type="checkbox" id="exit-intent-toggle" className="sr-only peer" checked={isExitIntentEnabled} onChange={handleToggleExitIntent} /><div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></label>
            </div>
        </div>
        <div className="mt-6 pt-6 border-t"><h4 className="text-lg font-semibold text-gray-800 mb-2">Embed on Your Website</h4><p className="text-sm text-gray-600 mb-4">Copy this code and paste it right before the closing <code>&lt;/body&gt;</code> tag on any page of your website to add the Live Agent widget.</p>
            <div className="relative bg-gray-900 text-white rounded-lg p-4 font-mono text-xs"><button onClick={handleCopyCode} className="absolute top-2 right-2 font-sans font-semibold py-1 px-3 rounded-md bg-gray-600 hover:bg-gray-500">{copyButtonText}</button><pre><code>{widgetCode}</code></pre></div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800"><p><strong>How it works:</strong> The <code>data-customer-id</code> ensures that your specific knowledge base and settings are loaded for the widget on your site. The script loads asynchronously, so it won't slow down your page.</p></div>
        </div>
   </div>
 );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center p-4 border-b gap-6"><h2 className="text-xl font-bold text-gray-800">Remodeling Live Settings</h2><div className="flex-grow"></div><button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl" aria-label="Close settings">&times;</button></header>
        <main className="flex-grow flex min-h-0">
          <aside className="w-1/4 border-r p-4 overflow-y-auto">
            <nav className="flex flex-col space-y-1">{TABS.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>{tab.label}</button>))}</nav>
          </aside>
          <div className="w-3/4 p-6 overflow-y-auto">
            {activeTab === 'branding' && renderBrandingContent()}
            {activeTab === 'agent' && renderAgentCustomizationContent()}
            {activeTab === 'app_type' && renderAppTypeContent()}
            {activeTab === 'kb' && (<div><h3 className="text-xl font-bold text-gray-800 mb-4">Knowledge Base</h3><p className="text-sm text-gray-600 mb-4">Provide a source to build a knowledge base. The virtual agent will use this to answer customer questions accurately.</p>{renderKbContent()}</div>)}
            {activeTab === 'integrations' && renderIntegrationsContent()}
            {activeTab === 'widget' && renderWidgetContent()}
          </div>
        </main>
        <footer className="flex justify-end items-center gap-3 p-4 border-t bg-gray-50 rounded-b-lg"><button onClick={onClose} className="font-semibold py-2 px-6 rounded-md bg-blue-600 text-white hover:bg-blue-500">Done</button></footer>
      </div>
    </div>
  );
};