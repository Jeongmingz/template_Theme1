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
        {theme === lightTheme ? <FiMoon size={16} /> : <FiSun size={16} />}
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
  right: 15px;
  bottom: 15px;
  padding: 15px;
  border: 0;
  border-radius: 15px;
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
