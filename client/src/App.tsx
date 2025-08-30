import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import LoadingSpinner from "@/components/ui/loading-spinner";

import FeatureHub from "./pages/FeatureHub";
import StudyTools from "./pages/StudyTools";
import ImageToPDF from "./pages/tools/ImageToPDF";
import TextToPDF from "./pages/tools/TextToPDF";
import WordToPDF from "./pages/tools/WordToPDF";
import PdfToWord from "./pages/tools/PdfToWord";
import PdfMerge from "./pages/tools/PdfMerge";
import PdfSplit from "./pages/tools/PdfSplit";
import PdfCompressor from "./pages/tools/PdfCompressor";
import ExcelToPDF from "./pages/tools/ExcelToPDF";
import ImageCompressor from "./pages/tools/ImageCompressor";
import Summarizer from "./pages/tools/Summarizer";
import Translator from "./pages/tools/Translator";
import CitationGenerator from "./pages/tools/CitationGenerator";
import FlashcardCreator from "./pages/tools/FlashcardCreator";
import ParaphraseTool from "./pages/tools/ParaphraseTool";
import GrammarChecker from "./pages/tools/GrammarChecker";
import AIEssayWriter from "./pages/tools/AIEssayWriter";
import FlyerCreator from "./pages/tools/FlyerCreator";
import PresentationCreator from "./pages/tools/PresentationCreator";
import OCRTool from "./pages/tools/OCRTool";
import ResumeBuilder from "./pages/tools/ResumeBuilder";
import ResumeBuilderPro from "./pages/tools/ResumeBuilderPro";
import RemoveBg from "./pages/tools/RemoveBg";
import PlagiarismChecker from "./pages/tools/PlagiarismChecker";
// Blog pages
import Blogs from "./pages/Blogs";
import ChatWithYourNotes from "./pages/blog/ChatWithYourNotes";
// Individual blog posts
import ChatWithPDFs from "./pages/blog/ChatWithPDFs";
import AISummarization from "./pages/blog/AISummarization";
import MultiFileLearning from "./pages/blog/MultiFileLearning";
import FreeForeverPlan from "./pages/blog/FreeForeverPlan";
import BackbenchersGuide from "./pages/blog/BackbenchersGuide";
import PdfEditingAnnotation from "./pages/blog/PdfEditingAnnotation";
import ImageToPdfPdfToImage from "./pages/blog/ImageToPdfPdfToImage";
import FileFormatConversions from "./pages/blog/FileFormatConversions";
import FileCompression from "./pages/blog/FileCompression";
import AICreativityDesignTools from "./pages/blog/AICreativityDesignTools";
import SecurityPrivacyFeatures from "./pages/blog/SecurityPrivacyFeatures";
import BlogPostComingSoon from "./pages/BlogPostComingSoon";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/tools" element={<FeatureHub />} />
              <Route path="/tools/study" element={<StudyTools />} />
              <Route path="/tools/image-to-pdf" element={<ImageToPDF />} />
              <Route path="/tools/text-to-pdf" element={<TextToPDF />} />
              <Route path="/tools/word-to-pdf" element={<WordToPDF />} />
              <Route path="/tools/pdf-to-word" element={<PdfToWord />} />
              <Route path="/tools/pdf-merge" element={<PdfMerge />} />
              <Route path="/tools/pdf-split" element={<PdfSplit />} />
              <Route path="/tools/pdf-compress" element={<PdfCompressor />} />
              <Route path="/tools/excel-to-pdf" element={<ExcelToPDF />} />
              <Route path="/tools/image-compress" element={<ImageCompressor />} />
              <Route path="/tools/summarizer" element={<Summarizer />} />
              <Route path="/tools/translator" element={<Translator />} />
              <Route path="/tools/citation-generator" element={<CitationGenerator />} />
              <Route path="/tools/flashcard-creator" element={<FlashcardCreator />} />
              <Route path="/tools/paraphrase" element={<ParaphraseTool />} />
              <Route path="/tools/grammar" element={<GrammarChecker />} />
              <Route path="/tools/essay-writer" element={<AIEssayWriter />} />
              <Route path="/tools/flyer-creator" element={<FlyerCreator />} />
              <Route path="/tools/presentation-creator" element={<PresentationCreator />} />
              <Route path="/tools/ocr-tool" element={<OCRTool />} />
{/* Explicit tool routes */}
<Route path="/tools/remove-bg" element={<RemoveBg />} />
<Route path="/tools/plagiarism-checker" element={<PlagiarismChecker />} />
<Route path="/tools/plagrism-checker" element={<Navigate to="/tools/plagiarism-checker" />} />
<Route path="/tools/resume-builder" element={<ResumeBuilderPro />} />
{/* Scaffold the rest as coming soon */}
<Route path="/tools/:slug" element={<NotFound />} />
{/* Blog routes */}
<Route path="/blog" element={<Blogs />} />
<Route path="/blog/chat-with-your-notes" element={<ChatWithYourNotes />} />
<Route path="/blog/chat-with-pdfs" element={<ChatWithPDFs />} />
<Route path="/blog/ai-summarization" element={<AISummarization />} />
<Route path="/blog/multi-file-learning" element={<MultiFileLearning />} />
<Route path="/blog/free-forever-plan" element={<FreeForeverPlan />} />
<Route path="/blog/backbenchers-guide" element={<BackbenchersGuide />} />
<Route path="/blog/pdf-editing-annotation" element={<PdfEditingAnnotation />} />
<Route path="/blog/image-to-pdf-and-pdf-to-image" element={<ImageToPdfPdfToImage />} />
<Route path="/blog/file-format-conversions" element={<FileFormatConversions />} />
<Route path="/blog/file-compression" element={<FileCompression />} />
<Route path="/blog/ai-creativity-design-tools" element={<AICreativityDesignTools />} />
<Route path="/blog/security-privacy-features" element={<SecurityPrivacyFeatures />} />
<Route path="/blog/:slug" element={<BlogPostComingSoon />} />
<Route path="/auth" element={<Auth />} />
<Route path="/dashboard" element={<Dashboard />} />
<Route path="/history" element={<History />} />
{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
<Route path="*" element={<NotFound />} />
            </Routes>
          
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
