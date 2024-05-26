import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  * {
    font-family: 'Roboto', 'Noto Sans KR', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    height: 100%;
    background-color: ${({ theme }) => theme.main.background};
    color: ${({ theme }) => theme.main.text.color};
    margin: 0;
    padding: 0;
    font-family: 'Roboto', 'Noto Sans KR', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  code {
    font-family: 'Roboto Mono', 'Noto Sans KR', monospace;
    }
`;

export default GlobalStyle;
