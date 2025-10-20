import Footer from '../Footer';

export default function FooterExample() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-foreground">محتوى الصفحة</h1>
      </div>
      <Footer />
    </div>
  );
}
