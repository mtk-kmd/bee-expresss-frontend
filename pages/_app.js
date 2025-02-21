import "@/styles/globals.css";
import  "bootstrap/dist/css/bootstrap.min.css";
import { AuthProvider } from "@/context/AuthContext";
import ChatButton from "@/components/chat/ChatButton";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;

export default function App({ Component, pageProps }) {
    return (
        <AuthProvider>
            <Component {...pageProps} />
            <ChatButton/>
        </AuthProvider>
    );
}
