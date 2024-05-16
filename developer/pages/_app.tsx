import ThemeToggle from '@/components/ThemeToggle';
import { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeToggle>
      <Component {...pageProps} />
    </ThemeToggle>
  );
}

export default MyApp;
