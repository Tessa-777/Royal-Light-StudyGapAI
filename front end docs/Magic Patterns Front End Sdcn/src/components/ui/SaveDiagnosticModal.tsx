import React from 'react';
import { X, Save } from 'lucide-react';
import Button from './Button';
import Card from './Card';
type SaveDiagnosticModalProps = {
  isOpen: boolean;
  onSave: () => void;
  onSkip: () => void;
  isLoading?: boolean;
};
const SaveDiagnosticModal = ({
  isOpen,
  onSave,
  onSkip,
  isLoading = false
}: SaveDiagnosticModalProps) => {
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <div className="flex items-start mb-4">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <Save className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-grow">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Save Your Diagnostic Results?
              </h2>
              <p className="text-sm text-gray-600">
                We found unsaved diagnostic results from your recent quiz. Would
                you like to save them to your account?
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <Button variant="primary" fullWidth onClick={onSave} isLoading={isLoading}>
              Save Results
            </Button>
            <button onClick={onSkip} disabled={isLoading} className="w-full text-sm text-gray-600 hover:text-gray-800 font-medium py-2">
              Skip
            </button>
          </div>
        </div>
      </Card>
    </div>;
};
export default SaveDiagnosticModal;