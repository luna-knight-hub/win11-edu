import React from 'react';
import { FileExplorer } from './FileExplorer';
import { Notepad } from './Notepad';
import { Calculator } from './Calculator';
import { Paint } from './Paint';
import { Settings } from './Settings';
import { Word } from './Word';
import { PowerPoint } from './PowerPoint';
import { LearningTasks } from './LearningTasks';

export const AppRegistry: Record<string, React.FC<{ windowId: string }>> = {
  FileExplorer,
  Notepad,
  Calculator,
  Paint,
  Settings,
  Word,
  PowerPoint,
  LearningTasks,
};
