import { ReactNode, useState, useEffect } from 'react';
import styled, { DefaultTheme, ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from '../styles/theme';
import GlobalStyle from '../styles/global';
import { FiMoon, FiSun } from 'react-icons/fi';

interface ThemeToggleProps {
  children: ReactNode;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ children }) => {
  const [theme, setTheme] = useState<DefaultTheme>(darkTheme);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setTheme(lightTheme);
    } else {
      setTheme(darkTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === lightTheme ? darkTheme : lightTheme;
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme === lightTheme ? 'light' : 'dark');
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <ThemeToggleBtn onClick={toggleTheme}>
        {theme === lightTheme ? <FiMoon size={20} /> : <FiSun size={20} />}
      </ThemeToggleBtn>
      {children}
    </ThemeProvider>
  );
};

const ThemeToggleBtn = styled.button`
  display: flex;
  flex-direction: row;

  align-items: center;
  justify-content: center;

  cursor: pointer;
  position: fixed;
  right: 30px;
  bottom: 30px;
  padding: 18px;
  border: 0;
  border-radius: 18px;
  background-color: ${({ theme }) => theme.otherTheme.background};
  color: ${({ theme }) => theme.otherTheme.text};

  z-index: 100;

  &:hover {
    background-color: ${({ theme }) =>
    theme === lightTheme ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'};
  }

  svg {
    color: ${({ theme }) => theme.otherTheme.text.color};
  }
`;



export default ThemeToggle;
