import { Link } from 'react-router-dom';
import TopNav from '@/components/navigation/TopNav';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import heroRobot from '@/assets/hero-robot.webp';
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
    title: 'Resume Builder',
    desc: 'Create a job-ready resume.',
    to: '/tools/resume',
    iconSrc: '/icons/resume.svg',
    alt: 'Resume builder icon'
  }, {
    title: 'OCR (Handwriting → Text)',
    desc: 'Scan and digitize notes.',
    to: '/tools/ocr',
    iconSrc: '/icons/ocr.svg',
    alt: 'OCR icon'
  }, {
    title: 'Poster / Flyer Maker',
    desc: 'Design eye-catching posters.',
    to: '/tools/poster-maker',
    iconSrc: '/icons/poster.svg',
    alt: 'Poster maker icon'
  }] as const;
  return <div className="min-h-screen gradient-hero">
      <TopNav />
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section - Remix pulse-robot (purple) */}
        <section className="relative overflow-hidden rounded-3xl gradient-hero shadow-elegant mb-16">
          <div className="relative container mx-auto px-4 py-12 md:py-20">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              {/* Left: Copy */}
              <div>
                <h1 className="text-5xl mb-6 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent leading-tight text-left font-bold md:text-4xl">Click, Convert, Create, Conquer, Chat — Notebot AI for Everything</h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
                  From files to ideas, from PDFs to posters — Note Bot AI turns your work into wow in seconds.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="px-8 py-6 gradient-primary shadow-glow transition-smooth" asChild>
                    <Link to="/dashboard" aria-label="Chat with your notes">Chat with Your Notes</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="px-8 py-6 transition-smooth" asChild>
                    <a href="#tools" aria-label="Explore all tools">Explore All Tools</a>
                  </Button>
                </div>
              </div>

              {/* Right: Visual */}
              <div className="relative flex items-center justify-center">
                <div className="absolute -inset-8 rounded-[2rem] opacity-60 glow-ellipse-purple" aria-hidden="true" />
                <img src={heroRobot} alt="Notebot AI hero illustration" loading="lazy" decoding="async" className="relative w-full h-auto rounded-3xl bg-card shadow-elegant object-contain mx-auto p-2" />
              </div>
            </div>
          </div>
        </section>

        {/* Tools Grid */}
        <section id="tools" aria-label="Tools grid" className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
             {tools.map(({
            title,
            desc,
            to,
            iconSrc,
            alt
          }) => <Link key={title} to={to} className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
                <Card className="text-left hover:shadow-elegant transition-smooth border-0 shadow-lg bg-card/80 backdrop-blur-sm hover-scale">
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="rounded-xl bg-primary/10 p-3">
                        <img src={iconSrc} alt={alt} className="h-5 w-5 object-contain" loading="lazy" decoding="async" />
                      </div>
                      <CardTitle className="text-base md:text-lg truncate">{title}</CardTitle>
                    </div>
                    <CardDescription className="text-sm md:text-base leading-relaxed break-words">
                      {desc}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>)}
          </div>
        </section>
      </main>
    </div>;
};
export default Index;