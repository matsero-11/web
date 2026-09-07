'use server';

interface Message {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

export async function askCopilot(
  history: Message[], 
  newMessage: string, 
  contextData?: Record<string, any>
) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return { error: "La clave de IA no está configurada en el servidor." };
  }

  const systemPrompt = `Eres el Copiloto Financiero de MetaBox, una plataforma de finanzas personales de élite orientada a la claridad, la fricción cero y la utilidad visual.

DIRECTRICES DE COMPORTAMIENTO:
1. Eres un asesor financiero experto, tranquilo, sumamente claro, elegante y objetivo.
2. NUNCA utilices muletillas de asistente genérico ("¡Excelente pregunta!", "Por supuesto", "Como IA", "Espero que te sea útil"). Ve directamente al grano.
3. Estructura tus respuestas visualmente: Conclusión clara -> Datos clave -> Escenarios (si aplica) -> Siguiente paso.
4. NUNCA des consejos genéricos ("ahorra más", "gasta menos"). Utiliza siempre los datos numéricos específicos que el usuario te ha proporcionado.
5. Si te faltan datos críticos para hacer un cálculo o análisis, pide un máximo de 2 o 3 variables de forma ordenada mediante una lista numérica.
6. Etiqueta la naturaleza de tus datos cuando sea pertinente: [CALCULADO], [ESTIMADO] o [SUPUESTO].
7. Mantén un tono prudente: no garantices rentabilidades de inversiones ni prometas futuros financieros absolutos. Explica riesgos y costes de oportunidad.
8. Tu objetivo final es guiar al usuario hacia las herramientas interactivas de MetaBox proporcionando contexto e interpretación de alta calidad.`;

  // Construimos el array de contenidos con memoria de sesión y system prompt integrado
  const fullContents: Message[] = [
    {
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\nContexto inicial de la herramienta: ${JSON.stringify(contextData || {})}` }]
    },
    {
      role: 'model',
      parts: [{ text: "Entendido. Operando como Copiloto Financiero de MetaBox." }]
    },
    ...history,
    {
      role: 'user',
      parts: [{ text: newMessage }]
    }
  ];

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: fullContents })
    });

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo procesar la respuesta en este momento.";
    
    return { success: true, text: textResponse };
  } catch (error) {
    return { error: "Error de conexión con el copiloto financiero." };
  }
      }

