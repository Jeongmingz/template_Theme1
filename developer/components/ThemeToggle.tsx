import { ReactNode, useState, useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from '../styles/theme';
import GlobalStyle from '../styles/global';
import { FiMoon, FiSun } from 'react-icons/fi';

interface ThemeToggleProps {
  children: ReactNode;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ children }) => {
  const [theme, setTheme] = useState(lightTheme);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
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
        {theme === lightTheme ? <FiMoon size={24} /> : <FiSun size={24} />}
      </ThemeToggleBtn>
      {children}
    </ThemeProvider>
  );
};

const ThemeToggleBtn = styled.button`
  cursor: pointer;
  position: fixed;
  right: 20px;
  bottom: 20px;
  padding: 20px;
  border: 0;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.otherThemeColors.background};
  color: ${({ theme }) => theme.otherThemeColors.text};

  &:hover {
    background-color: ${({ theme }) =>
    theme === lightTheme ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'};
  }

  svg {
    color: ${({ theme }) => theme.otherThemeColors.text};
  }
`;



export default ThemeToggle;
