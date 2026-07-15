import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  destructive
}) => {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm">
      <div className="mb-6">
        <p className="text-charcoal-muted text-sm">{message}</p>
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant={destructive ? 'danger' : 'primary'} onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </Modal>
  );
};
