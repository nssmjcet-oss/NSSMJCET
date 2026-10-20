import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TopProgressBar from "@/components/TopProgressBar";

export default function PublicLayout({ children }) {
    return (
        <main className="marvelous-theme">
            <TopProgressBar />
            <Navbar />
            {children}
            <Footer />
        </main>
    );
}

