import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

interface CustomModalProps {
  open: boolean;
  handleClose: () => void;
  handleSave: () => void;
  content: React.ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({ open, handleClose, handleSave, content }) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent>{content}</DialogContent>
      <DialogActions>
        <Button onClick={handleSave} color="primary">
          Salvar
        </Button>
        <Button onClick={handleClose} color="secondary">
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomModal;