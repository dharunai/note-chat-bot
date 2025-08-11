import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import { lazy, Suspense } from "react";
const FeatureHub = lazy(() => import("./pages/FeatureHub"));
const ImageToPDF = lazy(() => import("./pages/tools/ImageToPDF"));
const TextToPDF = lazy(() => import("./pages/tools/TextToPDF"));
const WordToPDF = lazy(() => import("./pages/tools/WordToPDF"));
const PdfToWord = lazy(() => import("./pages/tools/PdfToWord"));
const PdfMerge = lazy(() => import("./pages/tools/PdfMerge"));
const PdfSplit = lazy(() => import("./pages/tools/PdfSplit"));
const PdfCompressor = lazy(() => import("./pages/tools/PdfCompressor"));
const ExcelToPDF = lazy(() => import("./pages/tools/ExcelToPDF"));
const ImageCompressor = lazy(() => import("./pages/tools/ImageCompressor"));
const AIEssayWriter = lazy(() => import("./pages/tools/AIEssayWriter"));
const GrammarChecker = lazy(() => import("./pages/tools/GrammarChecker"));
const PlagiarismChecker = lazy(() => import("./pages/tools/PlagiarismChecker"));
const ComingSoon = lazy(() => import("./pages/tools/ComingSoon"));
// Blog pages
const Blogs = lazy(() => import("./pages/Blogs"));
const ChatWithYourNotes = lazy(() => import("./pages/blog/ChatWithYourNotes"));
const BlogPostComingSoon = lazy(() => import("./pages/BlogPostComingSoon"));
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div className="p-6 text-muted-foreground">Loading…</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/tools" element={<FeatureHub />} />
              <Route path="/tools/image-to-pdf" element={<ImageToPDF />} />
              <Route path="/tools/text-to-pdf" element={<TextToPDF />} />
              <Route path="/tools/word-to-pdf" element={<WordToPDF />} />
              <Route path="/tools/pdf-to-word" element={<PdfToWord />} />
              <Route path="/tools/pdf-merge" element={<PdfMerge />} />
              <Route path="/tools/pdf-split" element={<PdfSplit />} />
              <Route path="/tools/pdf-compress" element={<PdfCompressor />} />
              <Route path="/tools/excel-to-pdf" element={<ExcelToPDF />} />
              <Route path="/tools/image-compress" element={<ImageCompressor />} />
              <Route path="/tools/essay-writer" element={<AIEssayWriter />} />
              <Route path="/tools/grammar" element={<GrammarChecker />} />
<Route path="/tools/plagiarism-check" element={<PlagiarismChecker />} />
{/* Scaffold the rest as coming soon */}
<Route path="/tools/:slug" element={<ComingSoon title="Tool" description="This tool will be available soon." />} />
{/* Blog routes */}
<Route path="/blog" element={<Blogs />} />
<Route path="/blog/chat-with-your-notes" element={<ChatWithYourNotes />} />
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
  </QueryClientProvider>
);

export default App;
