import { useState } from 'react';
import Dashboard from './Workspaces'; // شيلنا components/ لأنهم مع بعض في نفس الفولدر
import Board from './Board';         // شيلنا components/ لأنهم مع بعض في نفس الفولدر

interface SelectedBoardType {
  id: string | number;
  title: string;
}

export default function Kanban() { // غيرنا اسم الكومبوننت لـ Kanban
  const [selectedBoard, setSelectedBoard] = useState<SelectedBoardType | null>(null);

  const handleSelectBoard = (id: string | number, title: string): void => {
    setSelectedBoard({ id, title });
  };

  const handleBackToDashboard = (): void => {
    setSelectedBoard(null);
  };

  return (
    <div className="app-container min-h-screen bg-gray-50">
      {!selectedBoard ? (
        <Dashboard onSelectBoard={handleSelectBoard} />
      ) : (
        <Board 
          boardId={selectedBoard.id} 
          boardTitle={selectedBoard.title} 
          onBack={handleBackToDashboard} 
        />
      )}
    </div>
  );
}