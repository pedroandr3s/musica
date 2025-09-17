import React from 'react';
import { formatTime, getPhaseLabel } from '../utils/helpers';

const DisplayWindowButton = ({ 
  bands, 
  currentBandIndex, 
  isRunning, 
  soundEnabled,
  onDisplayWindowCreated 
}) => {
  const openDisplayWindow = () => {
    const newDisplayWindow = window.open('', 'StageDisplay', 'width=1920,height=1080,fullscreen=yes');
    if (newDisplayWindow) {
      // Notificar al componente padre que se creó la ventana
      onDisplayWindowCreated(newDisplayWindow);
      
      newDisplayWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Stage Timer - Display</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            * { box-sizing: border-box; }
            body { 
              margin: 0; 
              font-family: Arial, sans-serif; 
              overflow: hidden;
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
            @media (max-width: 768px) {
              .timer { font-size: 6rem !important; }
              .band-name { font-size: 2rem !important; }
              .phase { font-size: 1.5rem !important; }
            }
            @media (min-width: 769px) and (max-width: 1200px) {
              .timer { font-size: 9rem !important; }
              .band-name { font-size: 3rem !important; }
              .phase { font-size: 2rem !important; }
            }
          </style>
        </head>
        <body>
          <div id="display-root">Inicializando visualizador...</div>
        </body>
        </html>
      `);
    }
  };

  return (
    <button
      onClick={openDisplayWindow}
      style={{
        padding: '12px 20px',
        backgroundColor: '#4299e1',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        justifyContent: 'center'
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = '#3182ce';
        e.target.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = '#4299e1';
        e.target.style.transform = 'translateY(0)';
      }}
    >
      <span>📺</span>
      Abrir Display
    </button>
  );
};

// Función para actualizar el contenido de la ventana de display
export const updateDisplayWindow = (displayWindow, bands, currentBandIndex, isRunning, soundEnabled) => {
  if (displayWindow && !displayWindow.closed) {
    const currentBand = bands[currentBandIndex];
    const totalPhaseTime = currentBand ? (
      currentBand.phase === 'setup' ? currentBand.setupTime * 60 :
      currentBand.phase === 'show' ? currentBand.showTime * 60 :
      currentBand.teardownTime * 60
    ) : 0;
    
    const progressPercentage = currentBand ? 
      Math.max(0, ((totalPhaseTime - currentBand.timeRemaining) / totalPhaseTime) * 100) : 0;
    
    const displayContent = `
      <div style="
        min-height: 100vh;
        background-color: #1a1a1a;
        color: white;
        font-family: Arial, sans-serif;
        display: flex;
        flex-direction: column;
      ">
        <div style="
          background-color: #2d3748;
          padding: 0vh 2vw;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
        ">
          <div style="display: flex; align-items: center; gap: 1vw; font-size: clamp(1.2rem, 3vw, 2rem); font-weight: bold;">
            🕐 Stage Timer
          </div>
          <div style="display: flex; gap: 2vw; align-items: center; font-size: clamp(0.8rem, 2vw, 1.2rem);">
            ${currentBand ? `<div style="color: #a0aec0;">${currentBandIndex + 1}/${bands.length}</div>` : ''}
            <div style="color: ${soundEnabled ? '#68d391' : '#a0aec0'};">
              ${soundEnabled ? '🔊' : '🔇'}
            </div>
          </div>
        </div>

        <div style="
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2vh 2vw;
          text-align: center;
        ">
          ${currentBand ? `
            <div class="band-name" style="
              font-size: clamp(2rem, 8vw, 6rem); 
              font-weight: bold; 
              margin-bottom: 0vh; 
              line-height: 0;
              word-break: break-word;
            ">
              ${currentBand.name}
            </div>
            
            <div class="timer" style="
              font-size: clamp(6rem, 22vw, 18rem);
              font-family: monospace;
              font-weight: bold;
              margin-bottom: 2vh;
              color: ${currentBand.timeRemaining <= 30 && currentBand.status === 'active' ? '#f56565' :
                      currentBand.timeRemaining <= 300 && currentBand.status === 'active' ? '#f56565' : 
                      currentBand.timeRemaining <= 600 && currentBand.status === 'active' ? '#f6ad55' : 
                      currentBand.phase === 'show' ? '#68d391' :
                      currentBand.phase === 'teardown' ? '#f6ad55' : '#63b3ed'};
              ${currentBand.timeRemaining <= 30 && currentBand.status === 'active' ? 'animation: pulse 1s infinite;' : ''}
            ">
              ${formatTime(currentBand.timeRemaining)}
            </div>

            <div class="phase" style="
              font-size: clamp(1.5rem, 5vw, 3rem);
              font-weight: bold;
              padding: 1vh 3vw;
              border-radius: 50px;
              margin-bottom: 3vh;
              background-color: ${currentBand.status === 'waiting' ? 
                (currentBand.phase === 'setup' ? '#d69e2e' :
                 currentBand.phase === 'show' ? '#38a169' :
                 '#dd6b20') :
              currentBand.status === 'active' ? 
                (currentBand.timeRemaining <= 30 ? '#e53e3e' : '#3182ce') :
              '#4a5568'};
              ${currentBand.timeRemaining <= 30 && currentBand.status === 'active' ? 'animation: pulse 1s infinite;' : ''}
            ">
              ${currentBand.status === 'waiting' ? 
                `ESPERANDO ${getPhaseLabel(currentBand.phase).toUpperCase()}` :
               currentBand.status === 'active' ? 
                (currentBand.timeRemaining <= 30 ? 
                  `¡${getPhaseLabel(currentBand.phase).toUpperCase()}!` :
                  getPhaseLabel(currentBand.phase).toUpperCase()) : 
                'FINALIZADO'}
            </div>

            <div style="width: min(90vw, 800px); margin-top: 2vh;">
              <div style="
                width: 100%;
                height: clamp(16px, 2vh, 32px);
                background-color: #4a5568;
                border-radius: 12px;
                overflow: hidden;
                position: relative;
              ">
                <div style="
                  height: 100%;
                  border-radius: 12px;
                  transition: width 1s ease;
                  background-color: ${currentBand.timeRemaining <= 300 && currentBand.status === 'active' ? '#f56565' : 
                                     currentBand.timeRemaining <= 600 && currentBand.status === 'active' ? '#f6ad55' : 
                                     currentBand.phase === 'show' ? '#68d391' :
                                     currentBand.phase === 'teardown' ? '#f6ad55' : '#63b3ed'};
                  width: ${progressPercentage}%;
                "></div>
              </div>
              
              <div style="
                display: flex;
                justify-content: space-between;
                margin-top: 1vh;
                font-size: clamp(0.8rem, 2vw, 1rem);
                color: #a0aec0;
              ">
                <span>0:00</span>
                <span>${formatTime(totalPhaseTime)}</span>
              </div>
            </div>

            ${currentBand.timeRemaining <= 300 && currentBand.status === 'active' ? `
              <div style="
                margin-top: 3vh;
                font-size: clamp(1.2rem, 4vw, 2.5rem);
                font-weight: bold;
                text-align: center;
                color: ${currentBand.timeRemaining <= 30 ? '#f56565' : '#f6ad55'};
                ${currentBand.timeRemaining <= 30 ? 'animation: pulse 1s infinite;' : ''}
              ">
                ${currentBand.timeRemaining <= 10 ? '¡TIEMPO AGOTADO!' :
                  currentBand.timeRemaining <= 30 ? '¡30 SEGUNDOS!' :
                  currentBand.timeRemaining <= 60 ? '¡1 MINUTO RESTANTE!' :
                  currentBand.timeRemaining <= 120 ? '2 MINUTOS RESTANTES' :
                  '5 MINUTOS RESTANTES'}
              </div>
            ` : ''}

            ${currentBandIndex < bands.length - 1 ? `
              <div style="margin-top: 3vh; text-align: center;">
                <div style="font-size: clamp(1rem, 3vw, 1.5rem); color: #a0aec0;">Siguiente:</div>
                <div style="font-size: clamp(1.5rem, 4vw, 2.5rem); font-weight: bold; color: #e2e8f0;">
                  ${bands[currentBandIndex + 1].name}
                </div>
              </div>
            ` : ''}
          ` : `
            <div style="text-align: center;">
              <div style="font-size: clamp(2rem, 6vw, 4rem); color: #a0aec0; margin-bottom: 2vh;">
                No hay bandas programadas
              </div>
              <div style="font-size: clamp(1rem, 3vw, 1.5rem); color: #718096;">
                Agrega bandas en el panel de administración
              </div>
            </div>
          `}
        </div>

        <div style="background-color: #2d3748; padding: 1vh 2vw; flex-shrink: 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
            <div style="font-size: clamp(1rem, 3vw, 1.5rem);">
              ${currentBand ? `
                Banda ${currentBandIndex + 1} de ${bands.length} - ${getPhaseLabel(currentBand.phase)}
                ${currentBand.status === 'active' ? '<span style="margin-left: 1vw; color: #63b3ed;">● EN VIVO</span>' : ''}
              ` : 'Sin bandas programadas'}
            </div>
            <div style="display: flex; gap: 2vw; align-items: center; font-size: clamp(0.9rem, 2.5vw, 1.2rem);">
              ${currentBand ? `
                <span>
                  Tiempo asignado: ${
                    currentBand.phase === 'setup' ? currentBand.setupTime :
                    currentBand.phase === 'show' ? currentBand.showTime :
                    currentBand.teardownTime
                  } minutos
                </span>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
    
    const displayRoot = displayWindow.document.getElementById('display-root');
    if (displayRoot) {
      displayRoot.innerHTML = displayContent;
    }
  }
};

export default DisplayWindowButton;