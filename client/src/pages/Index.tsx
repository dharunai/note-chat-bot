import { Link } from 'react-router-dom';
import TopNav from '@/components/navigation/TopNav';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import heroRobot from '@/assets/hero-robot.webp';
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
    to: '/tools/plagiarism-check',
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
  return <div className="min-h-screen gradient-hero">
      <TopNav />
      <main className="container mx-auto px-4 py-8 md:py-16">
        {/* Hero Section - Enhanced with animations */}
        <section className="relative overflow-hidden rounded-2xl md:rounded-3xl gradient-hero shadow-elegant mb-12 md:mb-20 border border-border/20 particles-bg">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-50" />
          <div className="relative container mx-auto px-4 py-12 md:py-16 lg:py-24">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Left: Copy */}
              <div className="animate-slide-in-left opacity-0">
                <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl mb-4 md:mb-6 gradient-text-animated leading-tight text-left font-bold tracking-tight max-w-4xl">
                  Click, Convert, Create, Conquer, Chat — Notebot AI for Everything
                </h1>
                <p className="text-base md:text-lg lg:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl leading-relaxed font-medium">
                  From files to ideas, from PDFs to posters — Note Bot AI turns your work into wow in seconds.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <Button size="default" className="px-6 md:px-8 py-3 md:py-4 text-base gradient-primary shadow-glow hover-glow transition-all duration-300 font-semibold group animate-pulse-glow" asChild>
                    <Link to="/dashboard" aria-label="Chat with your notes">
                      <span className="group-hover:scale-105 transition-transform duration-200">Chat with Your Notes</span>
                    </Link>
                  </Button>
                  <Button size="default" variant="outline" className="px-6 md:px-8 py-3 md:py-4 text-base hover-lift border-2 hover:border-primary/50 transition-all duration-300 font-semibold animate-border-dance" asChild>
                    <a href="#tools" aria-label="Explore all tools">Explore All Tools</a>
                  </Button>
                </div>
              </div>

              {/* Right: Visual */}
              <div className="relative flex items-center justify-center animate-slide-in-right opacity-0">
                <div className="absolute -inset-6 md:-inset-10 rounded-2xl md:rounded-[3rem] opacity-40 glow-ellipse-purple float" aria-hidden="true" />
                <div className="relative hover-tilt transition-transform duration-500">
                  <img 
                    src={heroRobot} 
                    alt="Notebot AI hero illustration" 
                    loading="lazy" 
                    decoding="async" 
                    className="relative w-full h-auto rounded-2xl md:rounded-3xl bg-gradient-to-br from-card to-card/80 shadow-elegant object-contain mx-auto p-3 md:p-4 border border-border/30" 
                  />
                  <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-t from-primary/10 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tools Grid */}
        <section id="tools" aria-label="Tools grid" className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
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
                  
                  <CardHeader className="relative z-10 p-5 md:p-6">
                    <div className="flex items-start gap-4 mb-3 md:mb-4">
                      <div className="relative rounded-xl bg-gradient-to-br from-primary/15 to-primary/10 p-3 md:p-3.5 flex-shrink-0 group-hover:from-primary/25 group-hover:to-primary/15 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                        <div className="absolute inset-0 rounded-xl bg-primary/20 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300" />
                        <img 
                          src={iconSrc} 
                          alt={alt} 
                          className="relative h-5 w-5 md:h-6 md:w-6 object-contain filter group-hover:brightness-110 transition-all duration-300" 
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
                    <CardDescription className="text-sm md:text-sm leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300 font-medium break-words">
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