export const metadata = {
  title: "Next.js Todo List",
  description: "A minimal todo list built with Next.js App Router"
};

import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="header">
            <h1>Todo List</h1>
          </header>
          <main>{children}</main>
          <footer className="footer">
            <span>
              Built with Next.js
            </span>
          </footer>
        </div>
      </body>
    </html>
  );
}
