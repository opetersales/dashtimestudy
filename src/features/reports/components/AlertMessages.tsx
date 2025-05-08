
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AlertMessagesProps {
  messages: string[];
}

/**
 * Componente para exibição de alertas encontrados na análise
 */
export const AlertMessages: React.FC<AlertMessagesProps> = ({ messages }) => {
  if (!messages.length) return null;

  return (
    <Alert variant="destructive">
      <AlertTitle>Alertas Encontrados</AlertTitle>
      <AlertDescription>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          {messages.map((alert, idx) => (
            <li key={idx}>{alert}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};
