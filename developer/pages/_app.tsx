import MainLayout from '@/components/Layout/MainLayout';
import ThemeToggle from '@/components/ThemeToggle';
import { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MainLayout>
      <ThemeToggle>
        <Component {...pageProps} />
      </ThemeToggle>
    </MainLayout>
  );
}

export default MyApp;
