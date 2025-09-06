import { Link } from 'react-router-dom';
import TopNav from '@/components/navigation/TopNav';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import heroRobot from '@/assets/removed-bg.jpg';
import { useMemo, lazy, Suspense } from 'react';
const Index = () => {
  const tools = [{
    title: 'Image → PDF',
    desc: 'Combine images into a single PDF.',
    to: '/tools/image-to-pdf',
    iconSrc: '/icons/image.svg',
    alt: 'Image to PDF icon'
  }, {
    title: 'Text → PDF',
    desc: 'Turn notes into clean PDFs.',
    to: '/tools/text-to-pdf',
    iconSrc: '/icons/text.svg',
    alt: 'Text to PDF icon'
  }, {
    title: 'PDF Merge',
    desc: 'Combine multiple PDFs quickly.',
    to: '/tools/pdf-merge',
    iconSrc: '/icons/pdf.svg',
    alt: 'PDF merge icon'
  }, {
    title: 'PDF Split',
    desc: 'Split pages into separate PDFs.',
    to: '/tools/pdf-split',
    iconSrc: '/icons/pdf.svg',
    alt: 'PDF split icon'
  }, {
    title: 'PDF → Word',
    desc: 'Convert PDFs to editable docs.',
    to: '/tools/pdf-to-word',
    iconSrc: '/icons/word.svg',
    alt: 'PDF to Word icon'
  }, {
    title: 'Excel → PDF',
    desc: 'Make spreadsheets easy to read.',
    to: '/tools/excel-to-pdf',
    iconSrc: '/icons/excel.svg',
    alt: 'Excel to PDF icon'
  }, {
    title: 'PDF Compressor',
    desc: 'Reduce PDF size smartly.',
    to: '/tools/pdf-compress',
    iconSrc: '/icons/pdf.svg',
    alt: 'PDF compressor icon'
  }, {
    title: 'JPG ↔ PDF',
    desc: 'Images to PDFs and back.',
    to: '/tools/jpg-to-pdf',
    iconSrc: '/icons/image.svg',
    alt: 'JPG and PDF icon'
  }, {
    title: 'PDF ↔ JPG',
    desc: 'Export pages as images.',
    to: '/tools/pdf-to-jpg',
    iconSrc: '/icons/image.svg',
    alt: 'PDF and JPG icon'
  }, {
    title: 'Grammar Checker',
    desc: 'Fix errors, improve clarity.',
    to: '/tools/grammar',
    iconSrc: '/icons/grammar.svg',
    alt: 'Grammar checker icon'
  }, {
    title: 'AI Essay Writer',
    desc: 'Get help with academic writing.',
    to: '/tools/essay-writer',
    iconSrc: '/icons/essay.svg',
    alt: 'Essay writer icon'
  }, {
    title: 'Citation Generator',
    desc: 'APA, MLA, Chicago formats.',
    to: '/tools/citation-generator',
    iconSrc: '/icons/citation.svg',
    alt: 'Citation generator icon'
  }, {
    title: 'Plagiarism Checker',
    desc: 'Ensure originality.',
    to: '/tools/plagiarism-checker',
    iconSrc: '/icons/plagiarism.svg',
    alt: 'Plagiarism checker icon'
  }, {
    title: 'Paraphrasing Tool',
    desc: 'Rewrite with better clarity.',
    to: '/tools/paraphrase',
    iconSrc: '/icons/paraphrase.svg',
    alt: 'Paraphrasing tool icon'
  }, {
    title: 'Summarizer',
    desc: 'Condense long texts.',
    to: '/tools/summarizer',
    iconSrc: '/icons/summarize.svg',
    alt: 'Summarizer icon'
  }, {
    title: 'Translator',
    desc: 'Translate to 20+ languages.',
    to: '/tools/translator',
    iconSrc: '/icons/translator.svg',
    alt: 'Translator icon'
  }, {
    title: 'Flashcard Creator',
    desc: 'Turn notes into Q&A cards.',
    to: '/tools/flashcard-creator',
    iconSrc: '/icons/flashcards.svg',
    alt: 'Flashcard creator icon'
  }, {
    title: 'Image Compressor',
    desc: 'Reduce file size without quality loss.',
    to: '/tools/image-compress',
    iconSrc: '/icons/image.svg',
    alt: 'Image compressor icon'
  }, {
    title: 'Background Remover',
    desc: 'Clean images for presentations.',
    to: '/tools/remove-bg',
    iconSrc: '/icons/magic-wand.svg',
    alt: 'Background remover icon'
  }, {
    title: 'Resume Builder',
    desc: 'Create a job-ready resume.',
    to: '/tools/resume',
    iconSrc: '/icons/resume.svg',
    alt: 'Resume builder icon'
  }, {
    title: 'OCR (Handwriting → Text)',
    desc: 'Scan and digitize notes.',
    to: '/tools/ocr-tool',
    iconSrc: '/icons/ocr.svg',
    alt: 'OCR icon'
  }, {
    title: 'Poster / Flyer Maker',
    desc: 'Design eye-catching posters.',
    to: '/tools/flyer-creator',
    iconSrc: '/icons/poster.svg',
    alt: 'Poster maker icon'
  }] as const;
  return <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <TopNav />
      <main className="container mx-auto px-4 py-8 md:py-16">
        {/* Hero Section - Enhanced with animations */}
        <section className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 shadow-xl mb-12 md:mb-20 border border-purple-200/50 dark:border-purple-800/50">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-100/30 via-transparent to-purple-100/30 dark:from-purple-900/30 dark:via-transparent dark:to-purple-900/30 opacity-50" />
          <div className="relative container mx-auto px-4 py-12 md:py-16 lg:py-24">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Left: Copy */}
              <div className="animate-slide-in-left opacity-0">
                <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl mb-4 md:mb-6 text-purple-600 dark:text-purple-300 leading-tight text-left font-bold tracking-tight max-w-4xl">
                  Click, Convert, Create, Conquer, Chat — Notebot AI for Everything
                </h1>
                <p className="text-base md:text-lg lg:text-xl text-purple-500 dark:text-purple-400 mb-6 md:mb-8 max-w-2xl leading-relaxed font-medium">
                  From files to ideas, from PDFs to posters — Note Bot AI turns your work into wow in seconds.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <Button size="default" className="px-6 md:px-8 py-3 md:py-4 text-base bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 text-white shadow-lg transition-all duration-300 font-semibold group" asChild>
                    <Link to="/dashboard" aria-label="Chat with your notes">
                      <span className="group-hover:scale-105 transition-transform duration-200">Chat with Your Notes</span>
                    </Link>
                  </Button>
                  <Button size="default" className="px-6 md:px-8 py-3 md:py-4 text-base bg-purple-500 hover:bg-purple-600 dark:bg-purple-500 dark:hover:bg-purple-400 text-white shadow-lg transition-all duration-300 font-semibold group border-0" asChild>
                    <a href="#tools" aria-label="Explore all tools">
                      <span className="group-hover:scale-105 transition-transform duration-200">Explore All Tools</span>
                    </a>
                  </Button>
                </div>
              </div>

              {/* Right: Visual */}
              <div className="relative flex items-center justify-center animate-slide-in-right opacity-0">
                <div className="relative hover-tilt transition-transform duration-500">
                  <img
                    src={heroRobot}
                    alt="Notebot AI hero illustration"
                    loading="lazy"
                    decoding="async"
                    className="relative w-full h-auto rounded-2xl md:rounded-3xl object-contain mx-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tools Grid */}
        <section id="tools" aria-label="Tools grid" className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
             {tools.map(({
            title,
            desc,
            to,
            iconSrc,
            alt
          }, index) => <Link 
                key={title} 
                to={to} 
                className={`block group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl animate-fade-in opacity-0 animate-stagger-${(index % 6) + 1}`}
              >
                <Card className="text-left hover-lift hover-glow hover-magnetic morphing-border ripple-effect relative overflow-hidden border-2 border-border/50 hover:border-primary/30 shadow-lg bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm h-full group-hover:bg-gradient-to-br group-hover:from-card group-hover:to-primary/5 transition-all duration-500 glass-effect">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500 -z-10" />
                  
                  <CardHeader className="relative z-10 p-5 md:p-6 text-center">
                    <div className="flex flex-col items-center gap-4 mb-3 md:mb-4">
                      <div className="flex justify-center">
                        <img
                          src={iconSrc}
                          alt={alt}
                          className="h-8 w-8 md:h-10 md:w-10 object-contain filter group-hover:brightness-110 group-hover:scale-110 transition-all duration-300"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base md:text-lg font-semibold leading-tight text-foreground group-hover:text-primary transition-colors duration-300 tracking-tight">
                          {title}
                        </CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-sm md:text-base text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300 leading-relaxed">
                      {desc}
                    </CardDescription>
                    
                    {/* Subtle gradient overlay on hover */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-glow to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </CardHeader>
                </Card>
              </Link>)}
          </div>
        </section>
      </main>
    </div>;
};
export default Index;