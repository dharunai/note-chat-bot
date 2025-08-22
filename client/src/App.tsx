import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import { lazy, Suspense } from "react";
import LoadingSpinner from "@/components/ui/loading-spinner";

const FeatureHub = lazy(() => import("./pages/FeatureHub"));
const StudyTools = lazy(() => import("./pages/StudyTools"));
const ImageToPDF = lazy(() => import("./pages/tools/ImageToPDF"));
const TextToPDF = lazy(() => import("./pages/tools/TextToPDF"));
const WordToPDF = lazy(() => import("./pages/tools/WordToPDF"));
const PdfToWord = lazy(() => import("./pages/tools/PdfToWord"));
const PdfMerge = lazy(() => import("./pages/tools/PdfMerge"));
const PdfSplit = lazy(() => import("./pages/tools/PdfSplit"));
const PdfCompressor = lazy(() => import("./pages/tools/PdfCompressor"));
const ExcelToPDF = lazy(() => import("./pages/tools/ExcelToPDF"));
const ImageCompressor = lazy(() => import("./pages/tools/ImageCompressor"));
const Summarizer = lazy(() => import("./pages/tools/Summarizer"));
const Translator = lazy(() => import("./pages/tools/Translator"));
const CitationGenerator = lazy(() => import("./pages/tools/CitationGenerator"));
const FlashcardCreator = lazy(() => import("./pages/tools/FlashcardCreator"));
const ParaphraseTool = lazy(() => import("./pages/tools/ParaphraseTool"));
const GrammarChecker = lazy(() => import("./pages/tools/GrammarChecker"));
const FlyerCreator = lazy(() => import("./pages/tools/FlyerCreator"));
const PresentationCreator = lazy(() => import("./pages/tools/PresentationCreator"));
const OCRTool = lazy(() => import("./pages/tools/OCRTool"));
const ResumeBuilder = lazy(() => import("./pages/tools/ResumeBuilder"));
const ResumeBuilderPro = lazy(() => import("./pages/tools/ResumeBuilderPro"));
const RemoveBg = lazy(() => import("./pages/tools/RemoveBg"));
const ComingSoon = lazy(() => import("./pages/tools/ComingSoon"));
// Blog pages
const Blogs = lazy(() => import("./pages/Blogs"));
const ChatWithYourNotes = lazy(() => import("./pages/blog/ChatWithYourNotes"));
// Individual blog posts
const ChatWithPDFs = lazy(() => import("./pages/blog/ChatWithPDFs"));
const AISummarization = lazy(() => import("./pages/blog/AISummarization"));
const MultiFileLearning = lazy(() => import("./pages/blog/MultiFileLearning"));
const FreeForeverPlan = lazy(() => import("./pages/blog/FreeForeverPlan"));
const BackbenchersGuide = lazy(() => import("./pages/blog/BackbenchersGuide"));
const PdfEditingAnnotation = lazy(() => import("./pages/blog/PdfEditingAnnotation"));
const ImageToPdfPdfToImage = lazy(() => import("./pages/blog/ImageToPdfPdfToImage"));
const FileFormatConversions = lazy(() => import("./pages/blog/FileFormatConversions"));
const FileCompression = lazy(() => import("./pages/blog/FileCompression"));
const AICreativityDesignTools = lazy(() => import("./pages/blog/AICreativityDesignTools"));
const SecurityPrivacyFeatures = lazy(() => import("./pages/blog/SecurityPrivacyFeatures"));
const BlogPostComingSoon = lazy(() => import("./pages/BlogPostComingSoon"));
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
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center space-y-4">
                <LoadingSpinner size="lg" />
                <p className="text-muted-foreground">Loading...</p>
              </div>
            </div>
          }>
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
              <Route path="/tools/flyer-creator" element={<FlyerCreator />} />
              <Route path="/tools/presentation-creator" element={<PresentationCreator />} />
              <Route path="/tools/ocr-tool" element={<OCRTool />} />
{/* Explicit tool routes */}
<Route path="/tools/remove-bg" element={<RemoveBg />} />
<Route path="/tools/resume-builder" element={<ResumeBuilderPro />} />
{/* Scaffold the rest as coming soon */}
<Route path="/tools/:slug" element={<ComingSoon title="Tool" description="This tool will be available soon." />} />
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
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
