import MainLayout from '@/components/Layout/MainLayout';
import ThemeToggle from '@/components/ThemeToggle';
import { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeToggle>
      <MainLayout>
        <Component {...pageProps} />
      </MainLayout>
    </ThemeToggle>
  );
}

export default MyApp;
