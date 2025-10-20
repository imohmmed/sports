import Header from '../Header';

export default function HeaderExample() {
  return (
    <div className="min-h-screen bg-background">
      <Header 
        isAuthenticated={true}
        userEmail="user@example.com"
        isSubscribed={true}
        onLogout={() => console.log('Logout clicked')}
      />
      <div className="p-8 text-foreground">
        <h1 className="text-2xl font-bold">محتوى الصفحة</h1>
      </div>
    </div>
  );
}
