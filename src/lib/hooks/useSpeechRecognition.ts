import { useState, useRef, useCallback, useEffect } from 'react';
import { SpeechRecognition, SpeechRecognitionEvent } from '../../types/speech';

interface UseSpeechRecognitionOptions {
  onTranscriptChange: (transcript: string) => void;
}

export const useSpeechRecognition = ({ onTranscriptChange }: UseSpeechRecognitionOptions) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startRecording = useCallback(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    
    if (isRecording || recognitionRef.current) {
      return;
    }

    setTranscript('');
    onTranscriptChange('');
    setError(null);
    
    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        const fullTranscript = transcript + finalTranscript + interimTranscript;
        setTranscript(fullTranscript);
        onTranscriptChange(fullTranscript);
    };


    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setError(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognition.start();

  }, [isRecording, onTranscriptChange, transcript]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  return { isRecording, transcript, error, startRecording, stopRecording };
};
