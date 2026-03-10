import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Palette, 
  Wind, 
  Activity, 
  Heart, 
  ChevronRight, 
  BookOpen,
  Mic,
  Moon,
  Sun,
  Menu,
  X,
  Languages
} from 'lucide-react';
import { cn } from './lib/utils';
import { generateDailyPrompt } from './services/gemini';
import { translations, Language } from './constants/translations';

type Pillar = 'expression' | 'art' | 'spirit' | 'body';

interface PromptData {
  title: string;
  description: string;
  instructions: string[];
  reflection: string;
}

export default function App() {
  const [activePillar, setActivePillar] = useState<Pillar>('spirit');
  const [lang, setLang] = useState<Language>('pt');
  const [prompt, setPrompt] = useState<PromptData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const t = translations[lang];

  const pillars = [
    { id: 'expression', name: t.expression, icon: BookOpen },
    { id: 'art', name: t.art, icon: Palette },
    { id: 'spirit', name: t.spirit, icon: Wind },
    { id: 'body', name: t.body, icon: Activity },
  ];

  const formatError = (err: any) => {
    const errorStr = typeof err === 'string' ? err : err.message || JSON.stringify(err);
    
    if (errorStr.includes('API_KEY') || errorStr.includes('Clave API no válida') || errorStr.includes('API key not valid')) {
      return t.error_api_key;
    }

    try {
      const parsed = JSON.parse(errorStr);
      if (parsed.error && parsed.error.message) {
        const msg = parsed.error.message;
        if (msg.includes('API key not valid') || msg.includes('Clave API no válida')) return t.error_api_key;
        return msg;
      }
    } catch (e) {}

    return t.error_generic;
  };

  const fetchPrompt = async (pillar: Pillar, language: Language) => {
    setLoading(true);
    setError(null);
    setIsDemoMode(false);
    setLastUpdate(Date.now());
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "undefined" || apiKey === "") {
      console.warn("API Key missing, falling back to demo mode automatically.");
      loadDemo();
      setLoading(false);
      return;
    }

    try {
      const data = await generateDailyPrompt(pillar, language);
      setPrompt(data);
    } catch (err: any) {
      console.error("Error fetching prompt:", err);
      setError(formatError(err));
      loadDemo();
    } finally {
      setLoading(false);
    }
  };

  const loadDemo = () => {
    const demoData: Record<Pillar, PromptData[]> = {
      expression: [
        {
          title: lang === 'pt' ? "O Eco da Verdade" : lang === 'es' ? "El Eco de la Verdad" : "The Echo of Truth",
          description: lang === 'pt' ? "Um exercício para liberar a voz autêntica através da ressonância e da escuta profunda." : lang === 'es' ? "Un ejercicio para liberar la voz auténtica a través de la resonancia y la escucha profunda." : "An exercise to release the authentic voice through resonance and deep listening.",
          instructions: [
            lang === 'pt' ? "Encontre um lugar silencioso e sente-se confortavelmente." : lang === 'es' ? "Encuentra un lugar silencioso y siéntate cómodamente." : "Find a quiet place and sit comfortably.",
            lang === 'pt' ? "Emita um som contínuo (como um 'Hummm') por 2 minutos, variando o tom." : lang === 'es' ? "Emite un sonido continuo (como un 'Hummm') por 2 minutos, variando el tono." : "Emit a continuous sound (like a 'Hummm') for 2 minutes, varying the pitch.",
            lang === 'pt' ? "Sinta a vibração no seu peito e imagine essa vibração limpando sua garganta." : lang === 'es' ? "Siente la vibración en tu pecho e imagina esa vibración limpiando tu garganta." : "Feel the vibration in your chest and imagine this vibration clearing your throat.",
            lang === 'pt' ? "Ao final, escreva três palavras que surgiram na sua mente durante o som." : lang === 'es' ? "Al final, escribe tres palabras que surgieron en tu mente durante el sonido." : "At the end, write three words that came to your mind during the sound."
          ],
          reflection: lang === 'pt' ? "Sua voz é o instrumento da sua alma; quando você a libera, o mundo se harmoniza." : lang === 'es' ? "Tu voz es el instrumento de tu alma; cuando la liberas, el mundo se armoniza." : "Your voice is the instrument of your soul; when you release it, the world harmonizes."
        },
        {
          title: lang === 'pt' ? "Escrita Automática" : lang === 'es' ? "Escritura Automática" : "Automatic Writing",
          description: lang === 'pt' ? "Deixe as palavras fluírem sem julgamento por 5 minutos." : lang === 'es' ? "Deja que las palabras fluyan sin juicio por 5 minutos." : "Let the words flow without judgment for 5 minutes.",
          instructions: [
            lang === 'pt' ? "Pegue papel e caneta e coloque um cronômetro para 5 minutos." : lang === 'es' ? "Toma papel y lápiz y pon un cronómetro por 5 minutos." : "Take paper and pen and set a timer for 5 minutes.",
            lang === 'pt' ? "Escreva sem parar, sem tirar a caneta do papel." : lang === 'es' ? "Escribe sin parar, sin levantar el lápiz del papel." : "Write without stopping, without taking the pen off the paper.",
            lang === 'pt' ? "Não se preocupe com gramática ou sentido." : lang === 'es' ? "No te preocupes por la gramática o el sentido." : "Don't worry about grammar or sense.",
            lang === 'pt' ? "Se travar, escreva 'estou travado' até que algo novo surja." : lang === 'es' ? "Si te trabas, escribe 'estoy trabado' hasta que surja algo nuevo." : "If you get stuck, write 'I am stuck' until something new emerges."
          ],
          reflection: lang === 'pt' ? "O inconsciente fala quando o crítico silencia." : lang === 'es' ? "El inconsciente habla cuando el crítico calla." : "The unconscious speaks when the critic falls silent."
        }
      ],
      art: [
        {
          title: lang === 'pt' ? "Linhas Invisíveis" : lang === 'es' ? "Líneas Invisibles" : "Invisible Lines",
          description: lang === 'pt' ? "Desenhe no ar a forma do seu sentimento atual, transformando emoção em movimento." : lang === 'es' ? "Dibuja en el aire la forma de tu sentimiento actual, transformando la emoción en movimiento." : "Draw in the air the shape of your current feeling, transforming emotion into movement.",
          instructions: [
            lang === 'pt' ? "Feche os olhos e respire fundo três vezes." : lang === 'es' ? "Cierra los ojos y respira profundamente tres veces." : "Close your eyes and take three deep breaths.",
            lang === 'pt' ? "Use suas mãos para 'pintar' no espaço à sua frente o que você sente agora." : lang === 'es' ? "Usa tus manos para 'pintar' en el espacio frente a ti lo que sientes ahora." : "Use your hands to 'paint' in the space in front of you what you feel now.",
            lang === 'pt' ? "Imagine que suas mãos deixam rastros de luz colorida no ar." : lang === 'es' ? "Imagina que tus manos dejan rastros de luz colorida en el aire." : "Imagine that your hands leave trails of colored light in the air.",
            lang === 'pt' ? "Abra os olhos e tente traduzir esse movimento em um papel em 1 minuto." : lang === 'es' ? "Abre los ojos e intenta traducir ese movimiento en un papel en 1 minuto." : "Open your eyes and try to translate that movement onto paper in 1 minute."
          ],
          reflection: lang === 'pt' ? "A arte nasce no invisível antes de se tornar matéria." : lang === 'es' ? "El arte nace en lo invisible antes de convertirse en materia." : "Art is born in the invisible before becoming matter."
        },
        {
          title: lang === 'pt' ? "Colagem Mental" : lang === 'es' ? "Collage Mental" : "Mental Collage",
          description: lang === 'pt' ? "Crie uma imagem interna usando fragmentos de memórias felizes." : lang === 'es' ? "Crea una imagen interna usando fragmentos de memorias felices." : "Create an internal image using fragments of happy memories.",
          instructions: [
            lang === 'pt' ? "Visualize três cores que representam alegria para você." : lang === 'es' ? "Visualiza tres colores que representen alegría para ti." : "Visualize three colors that represent joy to you.",
            lang === 'pt' ? "Imagine essas cores se misturando em uma tela branca." : lang === 'es' ? "Imagina esos colores mezclándose en un lienzo blanco." : "Imagine these colors mixing on a white canvas.",
            lang === 'pt' ? "Adicione uma textura (como areia ou seda) a essa imagem." : lang === 'es' ? "Añade una textura (como arena o seda) a esa imagen." : "Add a texture (like sand or silk) to this image.",
            lang === 'pt' ? "Respire essa imagem para dentro do seu coração." : lang === 'es' ? "Respira esa imagen hacia tu corazón." : "Breathe this image into your heart."
          ],
          reflection: lang === 'pt' ? "Sua mente é a paleta mais rica que você possui." : lang === 'es' ? "Tu mente es la paleta más rica que posees." : "Your mind is the richest palette you possess."
        }
      ],
      spirit: [
        {
          title: lang === 'pt' ? "O Vazio Pleno" : lang === 'es' ? "El Vacío Pleno" : "The Full Void",
          description: lang === 'pt' ? "Uma meditação curta sobre a pausa sagrada entre os pensamentos." : lang === 'es' ? "Una meditación corta sobre la pausa sagrada entre los pensamientos." : "A short meditation on the sacred pause between thoughts.",
          instructions: [
            lang === 'pt' ? "Sente-se ereto, com as mãos relaxadas sobre os joelhos." : lang === 'es' ? "Siéntate erguido, con las manos relajadas sobre las rodillas." : "Sit upright, with your hands relaxed on your knees.",
            lang === 'pt' ? "Observe seus pensamentos como nuvens passando no céu." : lang === 'es' ? "Observa tus pensamientos como nubes pasando por el cielo." : "Observe your thoughts like clouds passing in the sky.",
            lang === 'pt' ? "Tente focar no espaço vazio entre um pensamento e outro." : lang === 'es' ? "Intenta enfocarte en el espacio vacío entre un pensamiento y otro." : "Try to focus on the empty space between one thought and another.",
            lang === 'pt' ? "Permaneça nesse espaço por 5 respirações completas." : lang === 'es' ? "Permanece en ese espacio por 5 respiraciones completas." : "Stay in that space for 5 full breaths."
          ],
          reflection: lang === 'pt' ? "No silêncio absoluto, todas as respostas já estão presentes." : lang === 'es' ? "En el silencio absoluto, todas las respuestas ya están presentes." : "In absolute silence, all answers are already present."
        },
        {
          title: lang === 'pt' ? "Gratidão Radical" : lang === 'es' ? "Gratitud Radical" : "Radical Gratitude",
          description: lang === 'pt' ? "Agradeça por algo que você normalmente ignora." : lang === 'es' ? "Agradece por algo que normalmente ignoras." : "Give thanks for something you normally ignore.",
          instructions: [
            lang === 'pt' ? "Feche os olhos e sinta a gravidade segurando você na Terra." : lang === 'es' ? "Cierra los ojos y siente la gravedad sosteniéndote en la Tierra." : "Close your eyes and feel gravity holding you to the Earth.",
            lang === 'pt' ? "Agradeça ao ar que entra nos seus pulmões sem esforço." : lang === 'es' ? "Agradece al aire que entra en tus pulmones sin esfuerzo." : "Give thanks for the air that enters your lungs effortlessly.",
            lang === 'pt' ? "Agradeça à água que sacia sua sede." : lang === 'es' ? "Agradece al agua que sacia tu sed." : "Give thanks for the water that quenches your thirst.",
            lang === 'pt' ? "Sinta como você é sustentado pelo universo a cada segundo." : lang === 'es' ? "Siente como eres sostenido por el universo a cada segundo." : "Feel how you are sustained by the universe every second."
          ],
          reflection: lang === 'pt' ? "A gratidão é a porta de entrada para a abundância." : lang === 'es' ? "La gratitud es la puerta de entrada a la abundancia." : "Gratitude is the gateway to abundance."
        }
      ],
      body: [
        {
          title: lang === 'pt' ? "Fluxo Vital" : lang === 'es' ? "Flujo Vital" : "Vital Flow",
          description: lang === 'pt' ? "Movimentos conscientes para despertar as articulações e a energia vital." : lang === 'es' ? "Movimientos conscientes para despertar las articulaciones y la energía vital." : "Conscious movements to awaken the joints and vital energy.",
          instructions: [
            lang === 'pt' ? "Fique de pé e sinta o peso do seu corpo nos calcanhares." : lang === 'es' ? "Ponte de pie y siente el peso de tu cuerpo en los talones." : "Stand up and feel the weight of your body on your heels.",
            lang === 'pt' ? "Gire o pescoço e os ombros lentamente, liberando tensões." : lang === 'es' ? "Gira el cuello y los hombros lentamente, liberando tensiones." : "Rotate your neck and shoulders slowly, releasing tensions.",
            lang === 'pt' ? "Balance os braços livremente ao lado do corpo por 30 segundos." : lang === 'es' ? "Balancea los brazos libremente al lado del cuerpo por 30 segundos." : "Swing your arms freely at your sides for 30 seconds.",
            lang === 'pt' ? "Termine com um abraço em si mesmo, agradecendo ao seu corpo." : lang === 'es' ? "Termina con un abrazo a ti mismo, agradeciendo a tu cuerpo." : "Finish with a hug to yourself, thanking your body."
          ],
          reflection: lang === 'pt' ? "Seu corpo é o templo da sua existência; cuide dele com presença." : lang === 'es' ? "Tu cuerpo es el templo de tu existencia; cuídalo con presencia." : "Your body is the temple of your existence; take care of it with presence."
        },
        {
          title: lang === 'pt' ? "Respiração Quadrada" : lang === 'es' ? "Respiración Cuadrada" : "Box Breathing",
          description: lang === 'pt' ? "Técnica para acalmar o sistema nervoso instantaneamente." : lang === 'es' ? "Técnica para calmar el sistema nervioso instantáneamente." : "Technique to calm the nervous system instantly.",
          instructions: [
            lang === 'pt' ? "Inspire contando até 4." : lang === 'es' ? "Inhala contando hasta 4." : "Inhale counting to 4.",
            lang === 'pt' ? "Segure o ar por 4 segundos." : lang === 'es' ? "Mantén el aire por 4 segundos." : "Hold your breath for 4 seconds.",
            lang === 'pt' ? "Expire contando até 4." : lang === 'es' ? "Exhala contando hasta 4." : "Exhale counting to 4.",
            lang === 'pt' ? "Fique sem ar por 4 segundos e repita o ciclo." : lang === 'es' ? "Quédate sin aire por 4 segundos y repite el ciclo." : "Stay without air for 4 seconds and repeat the cycle."
          ],
          reflection: lang === 'pt' ? "O controle da respiração é o controle da mente." : lang === 'es' ? "El control de la respiración es el control de la mente." : "Breath control is mind control."
        }
      ]
    };
    
    const variations = demoData[activePillar];
    const randomIndex = Math.floor(Math.random() * variations.length);
    setPrompt(variations[randomIndex]);
    setIsDemoMode(true);
    setError(null);
    setLastUpdate(Date.now());
  };

  useEffect(() => {
    fetchPrompt(activePillar, lang);
  }, [activePillar, lang]);

  const toggleLang = (newLang: Language) => {
    setLang(newLang);
    setIsLangMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-stone-900 font-sans selection:bg-blue-100 relative overflow-x-hidden">
      {/* API Key Warning Banner */}
      {!process.env.GEMINI_API_KEY && (
        <div className="fixed bottom-0 left-0 right-0 z-[60] bg-amber-500 text-white text-[10px] py-1 px-4 text-center font-bold uppercase tracking-widest flex items-center justify-center gap-2">
          <Sparkles className="w-3 h-3" />
          {lang === 'pt' ? 'Modo Demo Ativo - Configure a GEMINI_API_KEY para IA Real' : lang === 'es' ? 'Modo Demo Activo - Configure GEMINI_API_KEY para IA Real' : 'Demo Mode Active - Configure GEMINI_API_KEY for Real AI'}
        </div>
      )}

      {/* Subtle Background Elements inspired by "ACÁ" logo */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.03]">
        <div className="absolute -top-20 -left-20 text-[40rem] font-serif font-bold select-none rotate-12 text-blue-900">
          ACÁ
        </div>
        <div className="absolute -bottom-40 -right-20 text-[30rem] font-serif font-bold select-none -rotate-12 text-blue-900">
          EXPRESSÃO
        </div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-serif italic text-sm md:text-lg leading-none tracking-tight text-blue-900 truncate">{t.brand_title}</span>
              <span className="text-[8px] md:text-[10px] uppercase tracking-[0.1em] md:tracking-[0.2em] font-bold text-blue-600 truncate">{t.brand_subtitle}</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            {pillars.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePillar(p.id as Pillar)}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-blue-600",
                  activePillar === p.id ? "text-blue-600" : "text-stone-400"
                )}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-blue-600 transition-colors"
              >
                <Languages className="w-4 h-4" />
                {lang}
              </button>
              <AnimatePresence>
                {isLangMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-32 bg-white border border-stone-100 rounded-2xl shadow-xl overflow-hidden"
                  >
                    {(['pt', 'es', 'en'] as Language[]).map((l) => (
                      <button
                        key={l}
                        onClick={() => toggleLang(l)}
                        className={cn(
                          "w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-blue-50 transition-colors",
                          lang === l ? "text-blue-600 bg-blue-50/50" : "text-stone-400"
                        )}
                      >
                        {l === 'pt' ? 'Português' : l === 'es' ? 'Español' : 'English'}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button 
              className="md:hidden text-stone-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden overflow-y-auto"
          >
            <div className="flex flex-col gap-6">
              {pillars.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setActivePillar(p.id as Pillar);
                    setIsMenuOpen(false);
                  }}
                  className="text-2xl font-serif italic text-left border-b border-stone-100 pb-4 text-blue-900"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-32 pb-20 px-6 max-w-5xl mx-auto relative z-10">
        {/* Header Section */}
        <header className="mb-12 md:mb-16">
          <motion.div
            key={`${activePillar}-${lang}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs uppercase tracking-widest font-semibold text-blue-400 mb-2 block">
              {activePillar === 'expression' ? t.expression_tag : 
               activePillar === 'art' ? t.art_tag : 
               activePillar === 'spirit' ? t.spirit_tag : t.body_tag}
            </span>
            <h1 className="text-3xl md:text-7xl font-serif italic leading-tight mb-6 text-blue-950">
              {activePillar === 'expression' && t.expression_hero}
              {activePillar === 'art' && t.art_hero}
              {activePillar === 'spirit' && t.spirit_hero}
              {activePillar === 'body' && t.body_hero}
            </h1>
          </motion.div>
        </header>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-64 flex items-center justify-center border border-dashed border-blue-100 rounded-3xl bg-blue-50/20"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium text-blue-400 italic">{t.loading}</p>
                  </div>
                </motion.div>
              ) : error && !prompt ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 md:p-12 border border-red-100 rounded-[2rem] bg-red-50/30 text-center flex flex-col items-center"
                >
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <X className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-serif italic text-red-900 mb-4">{t.error_generic}</h3>
                  <p className="text-[8px] text-stone-300 uppercase mb-2">v1.0.4</p>
                  <p className="text-red-700/70 text-sm mb-8 max-w-md leading-relaxed">
                    {error}
                  </p>
                  <div className="flex flex-col gap-4 w-full justify-center">
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-8 py-4 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 flex items-center justify-center gap-2"
                    >
                      Recarregar Página
                    </button>
                    <button 
                      onClick={() => fetchPrompt(activePillar, lang)}
                      className="px-8 py-3 bg-white border border-red-200 text-red-600 rounded-full text-sm font-medium hover:bg-red-50 transition-all active:scale-95"
                    >
                      Tentar Novamente (IA Real)
                    </button>
                  </div>
                  <div className="mt-8 p-4 bg-white/50 rounded-2xl border border-stone-100 text-left">
                    <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold mb-2">Como resolver:</p>
                    <ol className="text-[10px] text-stone-400 space-y-1 list-decimal ml-4">
                      <li>Vá em <b>Settings &gt; Secrets</b> no AI Studio</li>
                      <li>Adicione <b>GEMINI_API_KEY</b> com sua chave</li>
                      <li>Clique em <b>Deploy</b> ou <b>Share</b> novamente</li>
                    </ol>
                    <div className="mt-4 pt-4 border-t border-stone-100">
                      <p className="text-[8px] text-stone-300 uppercase">Debug: Key Status: {process.env.GEMINI_API_KEY ? (process.env.GEMINI_API_KEY === 'undefined' ? 'UNDEFINED_STRING' : 'PRESENT_MASKED') : 'NOT_DEFINED'}</p>
                    </div>
                  </div>
                </motion.div>
              ) : prompt && (
                <motion.div
                  key={`${prompt.title}-${lastUpdate}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-12"
                >
                  <section>
                    {isDemoMode && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-widest rounded-full mb-6 border border-amber-100 w-fit">
                        <Sparkles className="w-3 h-3" />
                        {lang === 'pt' ? 'Exemplo de Demonstração' : lang === 'es' ? 'Ejemplo de Demostración' : 'Demo Example'}
                      </div>
                    )}
                    <h2 className="text-3xl font-serif mb-4 text-blue-900">{prompt.title}</h2>
                    <p className="text-lg text-stone-600 leading-relaxed">
                      {prompt.description}
                    </p>
                  </section>

                  <section className="bg-blue-50/50 rounded-[2rem] p-6 md:p-12 border border-blue-100/50">
                    <h3 className="text-sm uppercase tracking-widest font-bold mb-8 flex items-center gap-2 text-blue-600">
                      <ChevronRight className="w-4 h-4" /> {t.instructions}
                    </h3>
                    <ul className="space-y-6">
                      {prompt.instructions.map((step, i) => (
                        <li key={i} className="flex gap-4">
                          <span className="font-serif italic text-blue-300 text-xl">0{i + 1}</span>
                          <p className="text-stone-700 leading-relaxed">{step}</p>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="border-l-2 border-blue-600 pl-6 md:pl-8 py-2">
                    <h3 className="text-sm uppercase tracking-widest font-bold mb-4 text-blue-400">{t.reflection}</h3>
                    <p className="text-stone-600 italic leading-relaxed">
                      "{prompt.reflection}"
                    </p>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar / Actions */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="bg-blue-900 text-white rounded-[2rem] p-8 shadow-xl shadow-blue-900/10">
              <h3 className="text-xl font-serif italic mb-4">{t.daily_practice}</h3>
              <p className="text-blue-100/60 text-sm mb-6 leading-relaxed">
                {t.constancy_key}
              </p>
              <button 
                onClick={() => fetchPrompt(activePillar, lang)}
                className="w-full py-4 bg-white text-blue-900 rounded-full font-medium text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 shadow-lg active:scale-95"
              >
                <Sparkles className="w-4 h-4" /> {t.new_exercise}
              </button>
            </div>

            <div className="border border-stone-100 rounded-[2rem] p-8 bg-white/50 backdrop-blur-sm">
              <h3 className="text-sm uppercase tracking-widest font-bold mb-6 text-stone-400">{t.explore}</h3>
              <div className="grid grid-cols-2 gap-4">
                {pillars.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePillar(p.id as Pillar)}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-2xl transition-all active:scale-95",
                      activePillar === p.id 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                        : "bg-stone-50 text-stone-400 hover:bg-blue-50 hover:text-blue-400"
                    )}
                  >
                    <p.icon className="w-6 h-6 mb-2" />
                    <span className="text-[10px] uppercase font-bold tracking-tighter">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-[2rem] aspect-square shadow-lg">
              <img 
                src={`https://picsum.photos/seed/${activePillar}-blue/800/800`} 
                alt="Inspiration" 
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 to-transparent flex items-end p-8">
                <p className="text-white/80 text-[10px] uppercase tracking-widest italic">{t.visual_inspiration} {t[activePillar]}</p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-100 py-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="font-serif italic text-lg text-blue-900">{t.brand_title} {t.brand_subtitle}</span>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p className="text-stone-400 text-[10px] uppercase tracking-widest">
              {t.footer_text} | v1.0.4
            </p>
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="text-[8px] uppercase tracking-tighter text-stone-300 hover:text-blue-400 underline underline-offset-2 transition-colors"
            >
              Limpar Cache e Recarregar
            </button>
          </div>
          <div className="flex gap-6">
            <Heart className="w-4 h-4 text-blue-400" />
          </div>
        </div>
      </footer>
    </div>
  );
}
