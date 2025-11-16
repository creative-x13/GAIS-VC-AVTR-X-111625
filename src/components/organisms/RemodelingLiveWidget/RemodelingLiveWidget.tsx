import React, { useState, useMemo, useEffect } from 'react';
import { useWidgetContext } from '../../../contexts/WidgetContext';
import { DamageAnalysisReport } from '../../../types/project';
import { TranscriptionEntry, WidgetPosition } from '../../../types/widget';
import { ImageComparisonSlider } from '../../molecules/ImageComparisonSlider/ImageComparisonSlider';
import { RemodelingLiveSettingsModal } from '../RemodelingLiveSettingsModal/RemodelingLiveSettingsModal';

const kitchenStyles = [
    { name: 'Modern Farmhouse', prompt: 'A Modern Farmhouse kitchen. Feature white shaker-style cabinets, light quartz countertops with subtle veining, a classic white subway tile backsplash, and stainless steel appliances. Include a large central island with a butcher block top and rustic pendant lighting above it. The flooring should be warm-toned wood.' },
    { name: 'Sleek Modern', prompt: 'A Sleek Modern kitchen. Use handleless, flat-panel cabinets in a matte dark grey finish. Install a white waterfall-edge quartz countertop on the island. The main countertops should also be white quartz. Appliances should be high-end and integrated into the cabinetry for a seamless look. Add under-cabinet LED strip lighting.' },
    { name: 'Tuscan Mediterranean', prompt: 'A warm and inviting Tuscan-style kitchen. Use raised-panel cabinets made of warm-toned wood like cherry. Install granite countertops with earthy tones. The backsplash should be a decorative mosaic of tumbled stone tiles. Flooring should be terracotta tiles. Add a large, ornate range hood and wrought iron light fixtures.' },
    { name: 'Japandi Minimalist', prompt: 'A Japandi (Japanese + Scandinavian) style kitchen. Emphasize minimalism and natural materials. Use light-colored wood cabinets with clean lines and minimal hardware. Countertops should be a neutral, matte-finish solid surface. The backsplash can be a simple, textured white tile. Focus on an uncluttered, functional, and serene aesthetic.' },
];

const bathroomStyles = [
    { name: 'Modern Spa', prompt: 'A Modern Spa bathroom. Use a neutral color palette of greys and whites, with natural wood accents like a teak vanity. Feature a large, walk-in shower with a rainfall showerhead and frameless glass door. Include a freestanding soaking tub. Countertops should be white quartz. Flooring should be large-format grey porcelain tiles.' },
    { name: 'Classic Marble', prompt: 'A Classic Luxury bathroom. Use floor-to-ceiling Carrara or Calacatta marble tiles. Install a traditional-style vanity with intricate details, polished nickel faucets, and a marble top. Include a classic clawfoot bathtub. Add elegant sconces on either side of a decorative mirror.' },
    { name: 'Rustic Farmhouse', prompt: 'A Rustic Farmhouse bathroom. Feature a shiplap accent wall. Install a reclaimed wood vanity with a vessel sink. Use oil-rubbed bronze fixtures. The shower should have simple white subway tiles. Flooring should be patterned cement tile or dark wood-look tile. Add rustic open shelving.' },
    { name: 'Coastal Retreat', prompt: 'A light and airy Coastal Retreat bathroom. Use a color palette of white, sandy beige, and soft aqua. Install a white or light wood vanity with simple hardware. Use a pebble tile floor in the shower. Add accents of natural materials like wicker baskets and driftwood. The space should feel bright and relaxing.' },
];

const TranscriptionView: React.FC<{ history: TranscriptionEntry[], currentUserText: string, currentModelText: string, agentName: string }> = ({ history, currentUserText, currentModelText, agentName }) => {
    const { isTranscriptCollapsed, toggleTranscriptCollapsed } = useWidgetContext();
    const scrollRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history, currentUserText, currentModelText]);

    const containerClasses = isTranscriptCollapsed
        ? "absolute z-20 left-0 bottom-0 w-full bg-black/70 backdrop-blur-sm rounded-t-lg transition-all duration-300"
        : "absolute z-20 left-0 bottom-0 w-full md:w-[80%] max-h-[40%] bg-gradient-to-t from-black/80 via-black/60 to-transparent transition-all duration-300";

    return (
        <div className={containerClasses}>
            <div className="flex justify-end p-1">
                <button
                    onClick={toggleTranscriptCollapsed}
                    className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full"
                    aria-label={isTranscriptCollapsed ? "Expand transcript" : "Collapse transcript"}
                    data-testid="toggle-transcript-button"
                >
                    {isTranscriptCollapsed ? <IconChevronUp /> : <IconChevronDown />}
                </button>
            </div>
            
            {!isTranscriptCollapsed && (
                <div ref={scrollRef} className="p-4 pt-0 space-y-2 overflow-y-auto max-h-[calc(40vh-40px)]" data-testid="transcription-content">
                    {history.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ textShadow: '1px 1px 2px black' }}>
                            <span className={`font-bold ${entry.speaker === 'user' ? 'text-blue-300' : 'text-teal-300'}`}>{entry.speaker === 'user' ? 'You' : agentName}:</span> {entry.text}
                        </p>
                    ))}
                    {currentUserText && <p className="text-sm text-blue-300/80" style={{ textShadow: '1px 1px 2px black' }}><span className="font-bold">You:</span> {currentUserText}</p>}
                    {currentModelText && <p className="text-sm text-teal-300/80" style={{ textShadow: '1px 1px 2px black' }}><span className="font-bold">{agentName}:</span> {currentModelText}</p>}
                </div>
            )}
        </div>
    );
};

// --- Icon Components ---
const IconEndCall = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 transform rotate-135" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>;
const IconCapture = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconUpload = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>;
const IconClose = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const IconExpand = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" /></svg>;
const IconCollapse = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;
const IconChevronUp = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>;
const IconChevronDown = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const IconPhone = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>;


const HorizontalLauncher: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    const IconMicrophone = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
    );

    return (
        <button
            onClick={onClick}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[95vw] max-w-lg mb-4 z-50 p-4 bg-blue-700 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-blue-600 transition-all transform hover:scale-105"
            aria-label="Speak to Live Virtual Agent"
        >
            <div className="relative flex items-center justify-center">
                 <div className="absolute h-10 w-10 bg-white/20 rounded-full animate-ping"></div>
                 <IconMicrophone />
            </div>
            <span className="font-semibold text-lg ml-3">Speak to Live Virtual Agent</span>
        </button>
    );
};

export const RemodelingLiveWidget: React.FC = () => {
    const {
        isWidgetOpen, setIsWidgetOpen, appPersona, appPhase, liveStatus, transcriptionHistory, currentUserText,
        currentModelText, videoRef, spaces, activeSpaceId, selectedImageIndex, isGeneratingRemodel, isAnalyzingImage,
        startLiveConsultation, takeAndSetStillPhoto, generateStyleRemodel, generateWDRemodel, endLiveConsultation, handleSendReportAndEnd,
        setSelectedImageIndex, handleCreateNewSpace, setActiveSpaceId, widgetTitle, logoUrl, agentName, agentAvatarUrl,
        handleUploadClick, handleFileChange, fileInputRef, widgetPosition, widgetTheme, customThemeColors, phoneNumber,
        isPendingSpaceCreation, setIsPendingSpaceCreation, openAndStartConsultation, diagnosis, damageAnalysisReport,
        styleSuggestions, isFetchingSuggestions
    } = useWidgetContext();

    const [roomType, setRoomType] = useState<'kitchen' | 'bathroom'>('kitchen');
    const [isConfirmingEnd, setIsConfirmingEnd] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isNamingSpace, setIsNamingSpace] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    useEffect(() => {
        if (isPendingSpaceCreation) {
            setIsNamingSpace(true);
        }
    }, [isPendingSpaceCreation]);

    const handleCancelNameSpace = () => {
        setIsNamingSpace(false);
        setIsPendingSpaceCreation(false);
    }

    const activeSpace = useMemo(() => spaces.find(s => s.id === activeSpaceId), [spaces, activeSpaceId]);
    const galleryImages = activeSpace?.images || [];
    const originalImage = galleryImages.find(img => img.style === 'Original') || null;
    const cleanedImage = galleryImages.find(img => img.style === 'Cleaned Slate') || null;
    const currentImage = selectedImageIndex !== null ? galleryImages[selectedImageIndex] : null;

    const styles = roomType === 'kitchen' ? kitchenStyles : bathroomStyles;
    
    if (!isWidgetOpen) {
        return <HorizontalLauncher onClick={openAndStartConsultation} />;
    }
    
    const themeTextColor = widgetTheme === 'dark' ? 'text-gray-200' : 'text-slate-800';
    const themeTextStyle = widgetTheme === 'custom' ? { color: 'var(--text-color)' } : {};
    
    const isVisualPersona = appPersona === 'remodeling_consultant' || appPersona === 'contractor_agent' || appPersona === 'water_damage_restoration';

    const renderWelcome = () => {
        const personaConfig = {
            remodeling_consultant: {
                title: 'Welcome to Remodeling Live',
                subtitle: `Connect with our virtual design consultant, ${agentName}, for a live video consultation to visualize your dream remodel project.`,
                buttonText: 'Start Live Consultation',
            },
            water_damage_restoration: {
                title: 'Water Damage Restoration Studio',
                subtitle: `Connect with our virtual restoration expert, ${agentName}, to analyze damage and visualize a remodel.`,
                buttonText: 'Start Assessment',
            },
            contractor_agent: {
                title: 'Contractor Assistant',
                subtitle: `Connect with our virtual assistant, ${agentName}, to get help diagnosing your home repair issue.`,
                buttonText: 'Start Live Consultation',
            },
            sales_agent: {
                title: 'Live Sales Agent',
                subtitle: `Connect with our virtual sales expert, ${agentName}, for a consultation.`,
                buttonText: 'Start Sales Call',
            },
            live_voice_agent: {
                title: 'Live Voice Agent',
                subtitle: `Connect with our virtual support agent, ${agentName}, for assistance.`,
                buttonText: 'Start Live Call',
            },
            ppc_agent: {
                title: 'Live Connection Service',
                subtitle: `Connect with our virtual assistant, ${agentName}, for immediate help.`,
                buttonText: 'Start Live Call',
            },
        };

        const config = personaConfig[appPersona] || personaConfig.live_voice_agent;
        
        if (agentAvatarUrl && (appPersona === 'live_voice_agent' || appPersona === 'sales_agent' || appPersona === 'ppc_agent' || appPhase === 'welcome')) {
            return (
                <div className="relative h-full w-full flex flex-col">
                    <button 
                        onClick={() => setIsSettingsOpen(true)} 
                        className="absolute top-4 right-4 px-3 py-1 text-sm font-semibold rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-sm transition-colors z-20"
                    >
                        Settings
                    </button>
                    <div className="flex-1 min-h-0">
                        <img 
                            src={agentAvatarUrl} 
                            alt="Agent Avatar"
                            className="w-full h-full object-contain" 
                        />
                    </div>
                    <div className="p-4 text-center">
                        <h2 
                            className={`text-2xl font-bold ${widgetTheme !== 'custom' ? themeTextColor : ''}`}
                            style={widgetTheme === 'custom' ? themeTextStyle : {}}
                        >
                            {config.title}
                        </h2>
                        <p 
                            className={`mt-1 text-sm opacity-80 ${widgetTheme !== 'custom' ? themeTextColor : ''}`}
                            style={widgetTheme === 'custom' ? themeTextStyle : {}}
                        >
                            {config.subtitle}
                        </p>
                    </div>
                    <div className="p-4 pt-0">
                        <button
                            onClick={startLiveConsultation}
                            className="w-full px-8 py-4 text-lg font-bold text-white bg-blue-700 rounded-full hover:bg-blue-600 transition-transform transform hover:scale-105 shadow-lg"
                        >
                            {config.buttonText}
                        </button>
                    </div>
                </div>
            );
        }
        
        return (
            <div className="text-center relative h-full flex flex-col justify-center items-center p-6">
                <button 
                    onClick={() => setIsSettingsOpen(true)} 
                    className="absolute top-4 right-4 px-3 py-1 text-sm font-semibold rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-sm transition-colors z-10"
                >
                    Settings
                </button>
                <h2 
                    className={`text-3xl font-bold ${widgetTheme !== 'custom' ? themeTextColor : ''}`}
                    style={widgetTheme === 'custom' ? themeTextStyle : {}}
                >
                    {config.title}
                </h2>
                <p 
                    className={`mt-2 opacity-80 ${widgetTheme !== 'custom' ? themeTextColor : ''}`}
                    style={widgetTheme === 'custom' ? themeTextStyle : {}}
                >
                    {config.subtitle}
                </p>
                <button
                    onClick={startLiveConsultation}
                    className="mt-6 px-8 py-4 text-lg font-bold text-white bg-blue-700 rounded-full hover:bg-blue-600 transition-transform transform hover:scale-105 shadow-lg"
                >
                    {config.buttonText}
                </button>
            </div>
        );
    }
    
    const ConfirmationModal = () => {
        const [email, setEmail] = useState('');
        const [isSending, setIsSending] = useState(false);
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        const handleSend = async () => {
            if (!isValidEmail) return;
            setIsSending(true);
            await handleSendReportAndEnd(email);
            setIsSending(false);
            setIsConfirmingEnd(false);
        };
        
        const reportDescription = (persona => {
            switch(persona) {
                case 'remodeling_consultant': return `a complete summary of your session. This includes your conversation with ${agentName} and all the design images for all spaces.`;
                case 'contractor_agent': return `a complete summary of your session, including the diagnosis, any generated images, and your conversation with ${agentName}.`;
                case 'water_damage_restoration': return `a complete summary of your session, including the detailed damage report and all remodel designs.`;
                default: return `a complete summary of your session, including your conversation with ${agentName}.`;
            }
        })(appPersona);

        return (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title">
                    <div className="p-6">
                        <h2 id="dialog-title" className="text-2xl font-bold text-gray-800 text-center">Before You Go...</h2>
                        <p className="mt-4 text-gray-600">Enter your email below, and we'll send you {reportDescription}</p>
                        <div className="mt-4"><label htmlFor="email-input" className="sr-only">Email address</label><input id="email-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@example.com" className="w-full p-3 rounded-md bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
                        <p className="text-xs text-gray-500 mt-4">If you end the session without saving, this data will be lost.</p>
                    </div>
                    <div className="px-6 pb-6 space-y-2">
                         <button onClick={handleSend} disabled={!isValidEmail || isSending} className="w-full p-3 font-bold text-white bg-green-600 rounded-lg hover:bg-green-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">{isSending ? 'Sending Report...' : 'Send Report & End Session'}</button>
                         <button onClick={() => setIsConfirmingEnd(false)} className="w-full p-3 font-semibold text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                         <button onClick={endLiveConsultation} className="w-full text-center text-sm text-red-600 hover:underline mt-2">End without saving</button>
                    </div>
                </div>
            </div>
        );
    };

    const NameSpaceModal = () => {
        const [spaceName, setSpaceName] = useState('');
        const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (spaceName.trim()) { handleCreateNewSpace(spaceName.trim()); setIsNamingSpace(false); } };
        return (<div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-lg shadow-xl w-full max-w-sm" role="dialog" aria-modal="true" aria-labelledby="name-space-title"><form onSubmit={handleSubmit}><div className="p-6"><h2 id="name-space-title" className="text-2xl font-bold text-gray-800 text-center">Start a New Space</h2><p className="mt-2 text-gray-600 text-center">What room are we designing next? (e.g., "Kitchen", "Master Bathroom")</p><div className="mt-4"><label htmlFor="space-name-input" className="sr-only">Space Name</label><input id="space-name-input" type="text" value={spaceName} onChange={(e) => setSpaceName(e.target.value)} placeholder="Enter space name..." className="w-full p-3 rounded-md bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" required autoFocus /></div></div><div className="px-6 pb-6 flex gap-3"><button type="button" onClick={handleCancelNameSpace} className="w-full p-3 font-semibold text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button><button type="submit" disabled={!spaceName.trim()} className="w-full p-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors disabled:bg-gray-400">Create Space</button></div></form></div></div>);
    };

    const renderLiveSession = () => (
        <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
            {isConfirmingEnd && <ConfirmationModal />}
            {isNamingSpace && <NameSpaceModal />}
            {/* Fix: Only show video during the 'consultation' phase for visual personas. */}
            { isVisualPersona && appPhase === 'consultation' && <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />}
            
            {appPhase === 'design_studio' && isVisualPersona && (
                 <div className="w-full h-full bg-gray-200 flex items-center justify-center relative">
                    {(() => {
                        if (!originalImage) return <div className="text-center text-gray-500"><p>No image for this space yet.</p><p>Capture or upload one to begin.</p></div>;
                        
                        if (currentImage?.style === 'Cleaned Slate' && originalImage) {
                            return <ImageComparisonSlider beforeImage={originalImage.dataUrl} afterImage={currentImage.dataUrl} />;
                        }
                        
                        if (currentImage && currentImage.style !== 'Original' && currentImage.style !== 'Cleaned Slate' && cleanedImage) {
                            return <ImageComparisonSlider beforeImage={cleanedImage.dataUrl} afterImage={currentImage.dataUrl} />;
                        }
                        
                        return <img src={currentImage?.dataUrl || originalImage.dataUrl} alt="Current View" className="w-full h-full object-contain" />;
                    })()}
                    {isGeneratingRemodel && <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20 rounded-lg"><svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><p className="mt-3 font-semibold text-white">Generating new design...</p></div>}
                </div>
            )}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 p-2 rounded-lg text-white"><span className={`w-3 h-3 rounded-full ${liveStatus === 'active' ? 'bg-green-500 animate-pulse' : 'bg-yellow-400'}`}></span><span>Live with {agentName}</span></div>
            <TranscriptionView history={transcriptionHistory} currentUserText={currentUserText} currentModelText={currentModelText} agentName={agentName} />
            <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col items-center gap-4 z-10">
                <button onClick={() => setIsConfirmingEnd(true)} className="w-16 h-16 rounded-full flex items-center justify-center text-white transition-colors duration-200 shadow-lg bg-red-700 hover:bg-red-600" aria-label="End Consultation"><IconEndCall /></button>
                <button onClick={handleUploadClick} className="w-16 h-16 rounded-full flex items-center justify-center text-white transition-colors duration-200 shadow-lg bg-yellow-500 hover:bg-yellow-400" aria-label="Upload Image"><IconUpload /></button>
                <button onClick={takeAndSetStillPhoto} className="w-16 h-16 rounded-full flex items-center justify-center text-white transition-colors duration-200 shadow-lg bg-green-600 hover:bg-green-500" aria-label="Capture Image"><IconCapture /></button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/jpeg,image/png"/>
            </div>
            {isAnalyzingImage && <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-30 rounded-lg"><svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><p className="mt-3 font-semibold text-white">Analyzing your photo...</p></div>}
        </div>
    );
    
    const renderDesignStudio = () => (
        <div className="lg:col-span-1 bg-gray-100 p-4 rounded-lg flex flex-col gap-4">
             <div><h3 className="font-bold text-lg">Design Studio: <span className="text-blue-700">{activeSpace?.name || 'No Space Selected'}</span></h3><p className="text-sm text-gray-500">Select a style or ask {agentName} for a custom design for the current space.</p></div>
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex gap-4" aria-label="Spaces">
                    {spaces.map(space => (
                        <button key={space.id} onClick={() => setActiveSpaceId(space.id)} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeSpaceId === space.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{space.name}</button>
                    ))}
                    <button 
                        onClick={() => setIsNamingSpace(true)} 
                        disabled={isGeneratingRemodel} 
                        className="ml-auto whitespace-nowrap py-3 px-2 border-b-2 font-medium text-sm border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        aria-label="Add new space"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110 2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        New Space
                    </button>
                </nav>
            </div>
            <div className="flex border-b"><button onClick={() => setRoomType('kitchen')} className={`px-4 py-2 -mb-px text-sm font-semibold ${roomType === 'kitchen' ? 'border-b-2 border-blue-700 text-blue-700' : 'text-gray-500'}`}>Kitchen</button><button onClick={() => setRoomType('bathroom')} className={`px-4 py-2 -mb-px text-sm font-semibold ${roomType === 'bathroom' ? 'border-b-2 border-blue-700 text-blue-700' : 'text-gray-500'}`}>Bathroom</button></div>
            <div className="flex-grow overflow-y-auto pr-2"><div className="grid grid-cols-2 gap-2">{styles.map(style => (<button key={style.name} onClick={() => generateStyleRemodel(style.name, style.prompt)} disabled={isGeneratingRemodel || galleryImages.length === 0} className="text-sm p-2 rounded-md border-2 border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">{style.name}</button>))}</div><div className="mt-4"><h4 className="font-semibold text-gray-700 mb-2">Design Gallery for {activeSpace?.name}</h4><div className="flex flex-wrap gap-2">{galleryImages.map((image, index) => (<div key={index} className="text-center"><button onClick={() => setSelectedImageIndex(index)} className={`w-16 h-16 rounded-lg border-4 overflow-hidden ${selectedImageIndex === index ? 'border-blue-700' : 'border-transparent'}`}><img src={image.dataUrl} alt={`Design ${index + 1}`} className="w-full h-full object-cover" /></button><p className="text-xs mt-1 text-gray-600 font-medium truncate w-16">{image.style}</p></div>))}{isGeneratingRemodel && (<div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center"><svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} className="opacity-25"></circle><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" fill="currentColor"></path></svg></div>)}</div></div></div>
            <div className="mt-auto flex-shrink-0">
                <button onClick={() => setIsConfirmingEnd(true)} className="w-full font-semibold py-2 px-4 rounded-md bg-gray-700 text-white hover:bg-gray-600">End Session</button>
            </div>
        </div>
    );
    
    const renderTroubleshootingStudio = () => (
        <div className="lg:col-span-1 bg-gray-100 p-4 rounded-lg flex flex-col gap-4">
            <div><h3 className="font-bold text-lg">Troubleshooting Studio</h3><p className="text-sm text-gray-500">Ask {agentName} for help diagnosing the issue from your photo.</p></div>
            <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                {diagnosis ? (
                     <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Virtual Assistant Diagnosis</h4>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900 whitespace-pre-wrap">{diagnosis}</div>
                    </div>
                ) : (
                    originalImage && <p className="text-sm text-gray-500">The agent will now analyze your photo...</p>
                )}
                <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Image Gallery</h4>
                    <div className="flex flex-wrap gap-2">{galleryImages.map((image, index) => (<div key={index} className="text-center"><button onClick={() => setSelectedImageIndex(index)} className={`w-16 h-16 rounded-lg border-4 overflow-hidden ${selectedImageIndex === index ? 'border-blue-700' : 'border-transparent'}`}><img src={image.dataUrl} alt={`Design ${index + 1}`} className="w-full h-full object-cover" /></button><p className="text-xs mt-1 text-gray-600 font-medium truncate w-16">{image.style}</p></div>))}{isGeneratingRemodel && (<div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center"><svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} className="opacity-25"></circle><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" fill="currentColor"></path></svg></div>)}</div>
                </div>
            </div>
            <div className="mt-auto flex-shrink-0">
                <button onClick={() => setIsConfirmingEnd(true)} className="w-full font-semibold py-2 px-4 rounded-md bg-gray-700 text-white hover:bg-gray-600">End Session</button>
            </div>
        </div>
    );

    const renderWaterDamageStudio = () => (
        <div className="lg:col-span-1 bg-gray-100 p-4 rounded-lg flex flex-col gap-4">
             <div><h3 className="font-bold text-lg">Water Damage Studio</h3><p className="text-sm text-gray-500">Assess damage, then visualize the restored space with new designs.</p></div>
             {damageAnalysisReport && <button onClick={() => setIsReportModalOpen(true)} className="w-full text-sm font-semibold py-2 px-3 rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200">View Damage Report</button>}
             
            <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                <div>
                    <h4 className="font-semibold text-gray-700">Style Suggestions</h4>
                    {isFetchingSuggestions && (
                        <div className="text-center text-sm text-gray-500 py-4">
                            <svg className="animate-spin h-5 w-5 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Generating design ideas...
                        </div>
                    )}
                    {!isFetchingSuggestions && styleSuggestions.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                            {styleSuggestions.map(style => (
                                <button 
                                    key={style.name} 
                                    onClick={() => generateWDRemodel(style.name, style.prompt)} 
                                    disabled={isGeneratingRemodel || galleryImages.length < 2} 
                                    className="text-sm p-2 rounded-md border-2 border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {style.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Image Gallery for {activeSpace?.name}</h4>
                    <div className="flex flex-wrap gap-2">{galleryImages.map((image, index) => (
                        <div key={index} className="text-center">
                            <button onClick={() => setSelectedImageIndex(index)} className={`w-16 h-16 rounded-lg border-4 overflow-hidden ${selectedImageIndex === index ? 'border-blue-700' : 'border-transparent'}`}>
                                <img src={image.dataUrl} alt={`Design ${index + 1}`} className="w-full h-full object-cover" />
                            </button>
                            <p className="text-xs mt-1 text-gray-600 font-medium truncate w-16">{image.style}</p>
                        </div>
                    ))}
                    {isGeneratingRemodel && (
                        <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                            <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} className="opacity-25"></circle>
                                <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" fill="currentColor"></path>
                            </svg>
                        </div>
                    )}
                    </div>
                </div>
            </div>
            <div className="mt-auto flex-shrink-0">
                <button onClick={() => setIsConfirmingEnd(true)} className="w-full font-semibold py-2 px-4 rounded-md bg-gray-700 text-white hover:bg-gray-600">End Session</button>
            </div>
        </div>
    );


    const renderLiveVoiceAgent = () => {
        if (appPhase === 'welcome') return renderWelcome();
        return ( <div className="relative w-full h-full bg-black rounded-lg overflow-hidden"> {isConfirmingEnd && <ConfirmationModal />} {agentAvatarUrl ? <img src={agentAvatarUrl} alt="Agent Avatar" className="absolute inset-0 w-full h-full object-cover opacity-30" /> : <div className="absolute inset-0 bg-gray-800"></div> }<div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 p-2 rounded-lg text-white"><span className={`w-3 h-3 rounded-full ${liveStatus === 'active' ? 'bg-green-500 animate-pulse' : 'bg-yellow-400'}`}></span><span>Live with {agentName}</span></div><TranscriptionView history={transcriptionHistory} currentUserText={currentUserText} currentModelText={currentModelText} agentName={agentName} /><div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-10"><button onClick={() => setIsConfirmingEnd(true)} className="w-16 h-16 rounded-full flex items-center justify-center text-white transition-colors duration-200 shadow-lg bg-red-700 hover:bg-red-600" aria-label="End Call"><IconEndCall /></button></div></div>)
    };
    
    const renderVisualAgent = (rightPanel: React.ReactNode) => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-2 flex flex-col gap-4 relative min-h-0">{renderLiveSession()}</div>
            {rightPanel}
        </div>
    );

    const renderContent = () => {
        if (appPhase === 'welcome' || liveStatus === 'connecting') {
            return renderWelcome();
        }
        switch(appPersona) {
            case 'remodeling_consultant':
                return renderVisualAgent(renderDesignStudio());
             case 'water_damage_restoration':
                return renderVisualAgent(renderWaterDamageStudio());
            case 'contractor_agent':
                 return renderVisualAgent(renderTroubleshootingStudio());
            case 'live_voice_agent':
            case 'sales_agent':
            case 'ppc_agent':
            default:
                return renderLiveVoiceAgent();
        }
    };
    
    const isRemodelExpanded = isVisualPersona && isExpanded;
    const isSessionActiveForVisuals = isVisualPersona && appPhase !== 'welcome';
    const isFullScreen = widgetPosition === 'full-screen';
    
    const sizeClasses = isRemodelExpanded 
        ? 'w-[85vw] h-[90vh]' 
        : isSessionActiveForVisuals 
            ? 'w-[90vw] max-w-6xl h-[90vh]' 
            : 'w-[323px] h-[612px]';

    const positionClasses: Record<WidgetPosition, string> = {
        'top-left': 'top-4 left-4',
        'top-right': 'top-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'full-screen': 'inset-0 w-screen h-screen'
    };

    const themeClasses = widgetTheme === 'dark' ? 'dark bg-gray-900' : 'bg-white';

    const themeStyle = widgetTheme === 'custom' ? {
        '--primary-color': customThemeColors.primary,
        '--background-color': customThemeColors.background,
        '--text-color': customThemeColors.text,
        '--agent-bubble-color': customThemeColors.agentBubble,
        '--user-bubble-color': customThemeColors.userBubble,
    } as React.CSSProperties : {};
    
    const DamageReportModal: React.FC<{ report: DamageAnalysisReport; onClose: () => void }> = ({ report, onClose }) => {
        const renderList = (items?: string[]) => items && items.length > 0 ? <ul className="list-disc list-inside text-sm text-gray-700">{items.map((item, i) => <li key={i}>{item}</li>)}</ul> : <p className="text-sm text-gray-500">None noted.</p>;
        const renderLocations = (locs?: string[]) => locs && locs.length > 0 ? locs.join(', ') : 'None noted.';
    
        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
                <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    <header className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-xl font-bold text-gray-800">Damage Assessment Report</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl" aria-label="Close report">&times;</button>
                    </header>
                    <main className="p-6 overflow-y-auto space-y-4">
                        <div><h3 className="font-semibold text-gray-800">Architectural Features</h3>{renderList(Object.entries(report.architectural_features).map(([k, v]) => `${k.replace('_', ' ')}: ${Array.isArray(v) ? v.join(', ') : v}`))}</div>
                        <div><h3 className="font-semibold text-gray-800">Damage Assessment</h3><div className="pl-4 border-l-2 mt-1 space-y-2"><p><strong>Standing Water:</strong> {report.damage_assessment.standing_water?.present ? `Yes (${renderLocations(report.damage_assessment.standing_water.locations)})` : 'No'}</p><p><strong>Mold:</strong> {report.damage_assessment.mold?.present ? `Yes (${renderLocations(report.damage_assessment.mold.locations)})` : 'No'}</p><div><p><strong>Water Stains:</p>{renderList(report.damage_assessment.water_stains)}</div></div></div>
                        <div><h3 className="font-semibold text-gray-800">Items to Remove</h3>{renderList(report.items_to_remove)}</div>
                        <div><h3 className="font-semibold text-gray-800">Preservation Notes</h3><p className="text-sm text-gray-700">{report.preservation_notes || 'No specific notes.'}</p></div>
                    </main>
                     <footer className="flex justify-end items-center gap-3 p-4 border-t bg-gray-50 rounded-b-lg"><button onClick={onClose} className="font-semibold py-2 px-6 rounded-md bg-blue-600 text-white hover:bg-blue-500">Close</button></footer>
                </div>
            </div>
        );
    };
    
    return (
        <div 
            className={`fixed z-40 flex flex-col transition-all duration-300 ease-in-out ${
                isFullScreen 
                ? 'inset-0 w-screen h-screen' 
                : `${positionClasses[widgetPosition]} ${sizeClasses} shadow-2xl rounded-xl border border-slate-200`
            } ${widgetTheme === 'custom' ? '' : themeClasses}`}
            style={themeStyle}
            aria-modal="true" role="dialog"
        >
            {isSettingsOpen && <RemodelingLiveSettingsModal onClose={() => setIsSettingsOpen(false)} />}
            {isReportModalOpen && damageAnalysisReport && <DamageReportModal report={damageAnalysisReport} onClose={() => setIsReportModalOpen(false)} />}
            <header 
                className={`flex justify-between items-center p-3 border-b border-black/10 flex-shrink-0 bg-[color:var(--background-color)] ${!isFullScreen && 'rounded-t-xl'} ${widgetTheme !== 'custom' ? themeTextColor : ''}`} 
                style={widgetTheme === 'custom' ? { color: 'var(--text-color)' } : {}}
            >
                <div className="flex items-center gap-3">
                    {logoUrl && <img src={logoUrl} alt="logo" className="h-8 w-8 object-contain" />}
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold">{widgetTitle}</h2>
                        {phoneNumber && (
                            <a href={`tel:${phoneNumber}`} className="flex items-center gap-1.5 text-xs opacity-80 hover:opacity-100 transition-opacity">
                                <IconPhone />
                                <span>{phoneNumber}</span>
                            </a>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                     {isVisualPersona && (
                        <button onClick={() => setIsExpanded(p => !p)} className="p-1.5 rounded-full hover:bg-black/10" aria-label={isExpanded ? 'Collapse' : 'Expand'}>
                            {isExpanded ? <IconCollapse /> : <IconExpand />}
                        </button>
                    )}
                    <button onClick={() => setIsSettingsOpen(true)} className="p-1.5 rounded-full hover:bg-black/10" aria-label="Open settings">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734 2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
                    </button>
                    <button onClick={() => setIsWidgetOpen(false)} className="p-1.5 rounded-full hover:bg-black/10" aria-label="Close widget"><IconClose /></button>
                </div>
            </header>
            <div className={`flex-grow flex flex-col justify-center relative bg-[color:var(--background-color)] min-h-0 ${!isFullScreen && 'rounded-b-xl'}`}>
              {renderContent()}
            </div>
        </div>
    );
};