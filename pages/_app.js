import { Header } from '@/components/Header';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps } ) {
  return <>
    <Header />
    <Component {...pageProps} />
    <Toaster />
  </>
}

