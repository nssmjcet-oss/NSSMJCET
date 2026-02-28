import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PublicLayout({ children }) {
    return (
        <main className="marvelous-theme">
            <Navbar />
            {children}
            <Footer />
        </main>
    );
}
