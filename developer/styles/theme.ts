import { DefaultTheme } from "styled-components";

const lightTheme: DefaultTheme = {
  colors: {
    background: "#ffffff",
    text: "#1b1d25",
  },
  otherThemeColors:  {
    background: "#1b1d25",
    text: "#ffffff",
  },
};

const darkTheme: DefaultTheme = {
  colors: {
    background: "#1b1d25",
    text: "#ffffff",
  },
  otherThemeColors:  {
    background: "#ffffff",
    text: "#1b1d25",
  },
};

export { lightTheme, darkTheme };
