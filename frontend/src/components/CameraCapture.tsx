import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, ImageIcon } from 'lucide-react';

interface CameraCaptureProps {
  onFilesSelected: (files: FileList | null) => void;
  multiple?: boolean;
  className?: string;
  label?: string;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ 
  onFilesSelected, 
  multiple = false, 
  className = "",
  label = "Add Photo"
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Enhanced mobile detection
  const isMobile = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = ['android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
    const isMobileUserAgent = mobileKeywords.some(keyword => userAgent.includes(keyword));
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    
    return isMobileUserAgent || (isTouchDevice && isSmallScreen);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilesSelected(event.target.files);
    // Reset the input value so the same file can be selected again
    event.target.value = '';
  };

  const triggerCamera = () => {
    cameraInputRef.current?.click();
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />

      {isMobile() ? (
        // Mobile: Show both camera and file selection options
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={triggerCamera}
            className="flex-1 h-12"
          >
            <Camera className="h-4 w-4 mr-2" />
            Take {multiple ? 'Photos' : 'Photo'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={triggerFileSelect}
            className="flex-1 h-12"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Choose {multiple ? 'Files' : 'File'}
          </Button>
        </div>
      ) : (
        // Desktop: Show only file selection
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={triggerFileSelect}
          className="w-full h-10"
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          {label}
        </Button>
      )}
    </div>
  );
};

export default CameraCapture; 